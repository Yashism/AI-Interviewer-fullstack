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
import OpenAI from "openai";
import { FiMoreVertical } from 'react-icons/fi';
import { useEffect, useRef, useState, useCallback } from "react";
import RemoveGreenBackground from './RemoveGreenBackground';
import Controls from "./Controls";
import { MicrophoneContextProvider } from "../context/MicrophoneContextProvider";
import { DeepgramContextProvider } from "../context/DeepgramContextProvider";

const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true,
});

export default function StreamingAvatar() {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  const [data, setData] = useState<NewSessionData>();
  const [initialized, setInitialized] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatarApi | null>(null);

  const [finalTranscript, setFinalTranscript] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
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

  const processTranscript = async (transcript: string) => {
    console.log("Appending user message:", transcript);
    await append({
      role: 'user',
      content: transcript,
    });
    setFinalTranscript("");
  };

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
      <div className="mt-auto">
        <DeepgramContextProvider>
          <MicrophoneContextProvider>
            <Controls 
              finalTranscript={finalTranscript} 
              setFinalTranscript={setFinalTranscript} 
              handleSubmit={() => {
                console.log("Handle submit called");
                // This function is empty because the useEffect hook handles the transcript processing
              }}
              handleInactivity={handleInactivity}
            />
          </MicrophoneContextProvider>
        </DeepgramContextProvider>
      </div>
    </div>
  );
}