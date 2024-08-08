import {
  Configuration,
  NewSessionData,
  StreamingAvatarApi,
} from "@heygen/streaming-avatar";
import {
  Button,
  Spinner,
} from "@nextui-org/react";
import { AnimatePresence, motion } from "framer-motion";
import { useChat } from "ai/react";
import { FiMoreVertical } from 'react-icons/fi';
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from 'next/router';
import RemoveGreenBackground from './RemoveGreenBackground';
import Controls from "./Controls";
import { MicrophoneContextProvider } from "../context/MicrophoneContextProvider";
import { DeepgramContextProvider } from "../context/DeepgramContextProvider";
import { FaceWidgets } from "./FaceWidgets";
import { Descriptor } from "./Descriptor";
import { Emotion } from "../lib/data/emotion";
import FeedbackReport from './FeedbackReport';

export default function StreamingAvatar() {
  const router = useRouter();
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  const [data, setData] = useState<NewSessionData>();
  const [initialized, setInitialized] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatarApi | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const [finalTranscript, setFinalTranscript] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [currentEmotions, setCurrentEmotions] = useState<Emotion[]>([]);
  const [reportData, setReportData] = useState(null);
  const [emotionLog, setEmotionLog] = useState<Array<{ timestamp: number; emotion: string }>>([]);
  const [userMessages, setUserMessages] = useState<Array<{ content: string; timestamp: number; emotion?: string }>>([]);
  const [reportFileName, setReportFileName] = useState<string | null>(null);
  const handleInactivity = useCallback(() => {
    if (initialized && avatar.current && data?.sessionId) {
      avatar.current.speak({
        taskRequest: {
          text: "I cannot hear you. Could you please speak up or check your microphone?",
          sessionId: data.sessionId,
        },
      });
    }
  }, [initialized, avatar, data]);
  const { messages, append } = useChat({
    onFinish: async (message) => {
      console.log("ChatGPT Response:", message);

      if (!initialized || !avatar.current) {
        setDebug("Avatar API not initialized");
        return;
      }

      try {
        // Send the ChatGPT response to the Streaming Avatar
        await avatar.current.speak({
          taskRequest: { text: message.content, sessionId: data?.sessionId },
        });
      } catch (e) {
        console.error(`Error in streamingAvatar - ${e}`);
        setDebug(`Error in streamingAvatar: ${e}`);
      } finally {
        setIsProcessing(false);
      }
    },
    initialMessages: [
      {
        id: "1",
        role: "system",
        content: "You are a helpful assistant engaging in a conversation. Keep your responses concise and natural, as if speaking.",
      },
    ],
  });

  useEffect(() => {
    if (finalTranscript && !isProcessing) {
      console.log("Processing transcript:", finalTranscript);
      setIsProcessing(true);
      processTranscript(finalTranscript);
    }
  }, [finalTranscript]);

  const toggleChat = useCallback(() => {
    setIsChatOpen(prevState => !prevState);
  }, []);

  async function startSession() {
    setIsLoadingSession(true);
    await updateToken();
    if (!avatar.current) {
      setDebug("Avatar API is not initialized");
      return;
    }
    try {
      const res = await avatar.current.createStartAvatar(
        {
          newSessionRequest: {
            quality: "high",
            avatarName: "Tyler-incasualsuit-20220721",
            voice: { voiceId: "d7bbcdd6964c47bdaae26decade4a933" },
          },
        },
        setDebug
      );
      setData(res);
      setStream(avatar.current.mediaStream);

      // Speak initial message
      await avatar.current.speak({
        taskRequest: {
          text: "Hello! I'm your AI assistant. I'm here to engage in a conversation with you. I'll keep my responses concise and natural, as if we're speaking in person. How can I help you today?",
          sessionId: res.sessionId,
        },
      });
    } catch (error) {
      console.error("Error starting avatar session:", error);
      setDebug("There was an error starting the session.");
    } finally {
      setIsLoadingSession(false);
    }
  }


  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();
      console.log("Access Token:", token);
      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      return "";
    }
  }

  async function updateToken() {
    const newToken = await fetchAccessToken();
    console.log("Updating Access Token:", newToken);
    avatar.current = new StreamingAvatarApi(
      new Configuration({ accessToken: newToken })
    );

    const startTalkCallback = (e: any) => {
      console.log("Avatar started talking", e);
    };

    const stopTalkCallback = (e: any) => {
      console.log("Avatar stopped talking", e);
    };

    console.log("Adding event handlers:", avatar.current);
    avatar.current.addEventHandler("avatar_start_talking", startTalkCallback);
    avatar.current.addEventHandler("avatar_stop_talking", stopTalkCallback);

    setInitialized(true);
  }

  async function endSession() {
    if (!initialized || !avatar.current) {
      setDebug("Avatar API not initialized");
      return;
    }
    await avatar.current.stopAvatar(
      { stopSessionRequest: { sessionId: data?.sessionId } },
      setDebug
    );
    setStream(undefined);
  }

  useEffect(() => {
    async function init() {
      const newToken = await fetchAccessToken();
      console.log("Initializing with Access Token:", newToken);
      avatar.current = new StreamingAvatarApi(
        new Configuration({ accessToken: newToken, jitterBuffer: 200 })
      );
      setInitialized(true);
    }
    init();

    return () => {
      endSession();
    };
  }, []);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
        setDebug("Playing");
      };
    }
  }, [mediaStream, stream]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Error accessing camera:", err));
    } else {
      const stream = userVideoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = null;
      }
    }
  }, [isCameraOn]);

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  const handleSpeechEnd = (transcript: string) => {
    const overallEmotion = createDescription(currentEmotions);
    setEmotionLog(prevLog => [...prevLog, { transcript, emotion: overallEmotion }]);
  };

  const createDescription = (emotions: Emotion[]): string => {
    emotions.sort((a, b) => (a.score < b.score ? 1 : -1));
    if (emotions.length < 2) return "";

    const primaryEmotion = emotions[0];
    let secondaryEmotion = emotions[1];
    let secondaryDescriptor = "";
    for (let i = 1; i < emotions.length; i++) {
      const emotion = emotions[i];
      const descriptor = getEmotionDescriptor(emotion.name);
      if (descriptor !== None) {
        secondaryDescriptor = descriptor;
        secondaryEmotion = emotion;
        break;
      }
    }
    if (Math.abs(primaryEmotion.score - secondaryEmotion.score) > 0.1) {
      return primaryEmotion.name;
    }
    return `${secondaryDescriptor} ${primaryEmotion.name}`;
  };

  const handleEmotionUpdate = (emotions: Emotion[]) => {
    const currentEmotion = createDescription(emotions);
    setEmotionLog(prevLog => [...prevLog, { 
      timestamp: Date.now(), // This ensures a valid timestamp
      emotion: currentEmotion 
    }]);const handleEmotionUpdate = async (emotions: Emotion[]) => {
      const currentEmotion = createDescription(emotions);
      
      // Log emotion to both state and file
      setEmotionLog(prevLog => [...prevLog, { 
        timestamp: Date.now(),
        emotion: currentEmotion 
      }]);
    
      try {
        await fetch('/api/log-emotion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ emotion: currentEmotion }),
        });
      } catch (error) {
        console.error('Error logging emotion:', error);
      }
    };
  };

  const processTranscript = async (transcript: string) => {
    console.log("Processing transcript:", transcript);
    const currentEmotion = createDescription(currentEmotions);
    setUserMessages(prevMessages => [...prevMessages, { 
      content: transcript, 
      timestamp: Date.now(),
      emotion: currentEmotion
    }]);
    await append({
      role: 'user',
      content: transcript,
    });
    setFinalTranscript("");
  };
  
  const handleEndInterview = async () => {
    setIsGeneratingReport(true);
    try {
      // Generate transcript file
      const generateTranscriptResponse = await fetch('/api/generate-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          emotionLog,
          userMessages,
        }),
      });

      if (!generateTranscriptResponse.ok) {
        throw new Error('Failed to generate transcript');
      }

      const { fileName } = await generateTranscriptResponse.json();

      // Now call the analyze-interview API with the generated file name
      const analysisResponse = await fetch('/api/analyze-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName,
        }),
      });

      if (!analysisResponse.ok) {
        const errorText = await analysisResponse.text();
        throw new Error(`Failed to analyze interview: ${errorText}`);
      }

      const analysisData = await analysisResponse.json();
      console.log('Analysis data:', analysisData);
      
      const { interviewId } = analysisData;

      // Navigate to the feedback page
      await router.push(`/${interviewId}/feedback`);
    } catch (error) {
      console.error('Error generating report:', error);
      setIsGeneratingReport(false); // Reset loading state on error
      alert('Error generating report. Please try again.');
    }
    // Note: We don't set isGeneratingReport to false here, as we want to keep the loading state until navigation
  };
  

  if (isGeneratingReport) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
        <p className="ml-4">Generating Interview Report...</p>
      </div>
    );
  }

  if (reportGenerated) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Interview Report Generated</h1>
        {reportData ? (
          <FeedbackReport reportData={reportData} />
        ) : (
          <p>Loading report data...</p>
        )}
        <Button onClick={() => setReportGenerated(false)} className="mt-4">
          Back to Interview
        </Button>
      </div>
    );
  }

  const navigateToReports = () => {
    if (reportFileName) {
      router.push(`/reports?file=${reportFileName}`);
    } else {
      console.error('Report file name is not available');
      setDebug('Error: Report file name is not available');
    }
  };

  if (isGeneratingReport) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
        <p className="ml-4">Generating Interview Report...</p>
      </div>
    );
  }

  if (reportGenerated) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Interview Report Generated</h1>
        {reportData ? (
          <FeedbackReport reportData={reportData} />
        ) : (
          <p>Loading report data...</p>
        )}
        <Button onClick={() => setReportGenerated(false)} className="mt-4">
          Back to Interview
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 p-10 flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        <div className="bg-white rounded-lg w-full flex flex-col justify-center shadow-lg transition-all duration-300 ease-in-out relative">
          <div
            className="absolute top-5 right-5 z-10 cursor-pointer"
            onClick={toggleChat}
          >
            <FiMoreVertical size={24} />
          </div>
          <div className="h-full flex flex-col justify-center items-center">
            {stream ? (
              <div className="w-full h-full flex justify-center items-center relative">
                <RemoveGreenBackground stream={stream} />
              </div>
            ) : !isLoadingSession ? (
              <Button
                size="lg"
                onClick={startSession}
                className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white rounded-full px-8"
              >
                Start Interview
              </Button>
            ) : (
              <Spinner size="lg" color="default" />
            )}
          </div>
          {/* <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isCameraOn ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-10 right-16 w-72 h-48 bg-black rounded-lg overflow-hidden"
          >
            <video
              ref={userVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </motion.div> */}
        </div>
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "33.333%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg ml-4 p-4 flex flex-col overflow-hidden"
            >
              <h2 className="text-xl font-bold mb-4">Conversation</h2>
              <FaceWidgets 
                userVideoRef={userVideoRef}
                isCameraOn={isCameraOn}
                apiKey={'5clXGcclSBXfhERWNWBYx9GOgnPvzAruKJ3F5q6zJUbEui4j'}
              />
              <motion.div
                layoutScroll
                className="grow rounded-md overflow-y-auto mb-4"
                style={{ maxHeight: "85vh" }}
                ref={chatRef}
              >
                <motion.div className="max-w-full mx-auto w-full flex flex-col gap-4 pb-4">
                  <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        layout
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={`flex ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-md p-4 rounded-lg ${
                            message.role === "user"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-black"
                          }`}
                        >
                          {message.content}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FaceWidgets 
        userVideoRef={userVideoRef}
        isCameraOn={isCameraOn}
        apiKey={'5clXGcclSBXfhERWNWBYx9GOgnPvzAruKJ3F5q6zJUbEui4j'}
        onEmotionUpdate={handleEmotionUpdate}
      />
      <Descriptor emotions={currentEmotions} />
      <div className="mt-auto">
       <DeepgramContextProvider>
          <MicrophoneContextProvider>
            <Controls 
              finalTranscript={finalTranscript} 
              setFinalTranscript={setFinalTranscript} 
              handleSubmit={() => {
                console.log("Handle submit called");
                handleSpeechEnd(finalTranscript);
              }}
              handleInactivity={handleInactivity}
              isCameraOn={isCameraOn}
              toggleCamera={toggleCamera}
              onEndInterview={handleEndInterview}
            />
          </MicrophoneContextProvider>
        </DeepgramContextProvider>
      </div>
    </div>
  );
}