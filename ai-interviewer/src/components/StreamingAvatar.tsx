import {
  Configuration,
  NewSessionData,
  StreamingAvatarApi,
} from "@heygen/streaming-avatar";
import {
  Button,
  Spinner,
  Tooltip,
} from "@nextui-org/react";
import { Microphone, MicrophoneStage } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useChat } from "ai/react";
import clsx from "clsx";
import OpenAI from "openai";
import { FiMoreVertical } from 'react-icons/fi';
import { useEffect, useRef, useState, useCallback } from "react";
import StreamingAvatarTextInput from "./StreamingAvatarTextInput";
import RemoveGreenBackground from './RemoveGreenBackground';
import Controls from "./Controls";


const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true,
});

export default function StreamingAvatar() {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  const [avatarId, setAvatarId] = useState<string>("");
  const [voiceId, setVoiceId] = useState<string>("");
  const [data, setData] = useState<NewSessionData>();
  const [text, setText] = useState<string>("");
  const [initialized, setInitialized] = useState(false); // Track initialization
  const [recording, setRecording] = useState(false); // Track recording state
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatarApi | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const { input, setInput, handleSubmit } = useChat({
    onFinish: async (message) => {
      console.log("ChatGPT Response:", message);

      if (!initialized || !avatar.current) {
        setDebug("Avatar API not initialized");
        return;
      }

      //send the ChatGPT response to the Streaming Avatar
      await avatar.current
        .speak({
          taskRequest: { text: message.content, sessionId: data?.sessionId },
        })
        .catch((e) => {
          setDebug(e.message);
        });
      setIsLoadingChat(false);
    },
    initialMessages: [
      {
        id: "1",
        role: "system",
        content: "You are a helpful assistant.",
      },
    ],
  });

  useEffect(() => {
    if (stream) {
      console.log("Stream is active");
    } else {
      console.log("Stream is not active");
    }
  }, [stream]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [input]);

  const toggleChat = useCallback(() => {
    setIsChatOpen(prevState => !prevState);
  }, []);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();
      console.log("Access Token:", token); // Log the token to verify
      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      return "";
    }
  }

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
    } catch (error) {
      console.error("Error starting avatar session:", error);
      setDebug(
        `There was an error starting the session. ${voiceId ? "This custom voice ID may not be supported." : ""}`
      );
    }
    setIsLoadingSession(false);
  }

  async function updateToken() {
    const newToken = await fetchAccessToken();
    console.log("Updating Access Token:", newToken); // Log token for debugging
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

  async function handleInterrupt() {
    if (!initialized || !avatar.current) {
      setDebug("Avatar API not initialized");
      return;
    }
    await avatar.current
      .interrupt({ interruptRequest: { sessionId: data?.sessionId } })
      .catch((e) => {
        setDebug(e.message);
      });
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

  async function handleSpeak() {
    setIsLoadingRepeat(true);
    if (!initialized || !avatar.current) {
      setDebug("Avatar API not initialized");
      return;
    }
    await avatar.current
      .speak({ taskRequest: { text: text, sessionId: data?.sessionId } })
      .catch((e) => {
        setDebug(e.message);
      });
    setIsLoadingRepeat(false);
  }

  useEffect(() => {
    async function init() {
      const newToken = await fetchAccessToken();
      console.log("Initializing with Access Token:", newToken); // Log token for debugging
      avatar.current = new StreamingAvatarApi(
        new Configuration({ accessToken: newToken, jitterBuffer: 200 })
      );
      setInitialized(true); // Set initialized to true
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

  function startRecording() {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorder.current = new MediaRecorder(stream);
        mediaRecorder.current.ondataavailable = (event) => {
          audioChunks.current.push(event.data);
        };
        mediaRecorder.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, {
            type: "audio/wav",
          });
          audioChunks.current = [];
          transcribeAudio(audioBlob);
        };
        mediaRecorder.current.start();
        setRecording(true);
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  }

  function stopRecording() {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  }

  async function transcribeAudio(audioBlob: Blob) {
    try {
      // Convert Blob to File
      const audioFile = new File([audioBlob], "recording.wav", {
        type: "audio/wav",
      });
      const response = await openai.audio.transcriptions.create({
        model: "whisper-1",
        file: audioFile,
      });
      const transcription = response.text;
      console.log("Transcription: ", transcription);
      setInput(transcription);
    } catch (error) {
      console.error("Error transcribing audio:", error);
    }
  }

  return (
    <div className="h-screen bg-gray-100 p-10 flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        <div className="bg-white rounded-lg w-full flex flex-col justify-center shadow-lg transition-all duration-300 ease-in-out relative">
          <div
            className="absolute top-5 right-5 z-10"
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
              <h2 className="text-xl font-bold mb-4">Chat</h2>
              <motion.div
                layoutScroll
                className="grow rounded-md overflow-y-auto mb-4"
                style={{ maxHeight: "calc(85vh - 200px)" }}
                ref={chatRef}
              >
                <motion.div className="max-w-full mx-auto w-full flex flex-col gap-4 pb-4">
                  <AnimatePresence mode="popLayout">
                    {/* ... (keep the existing chat messages rendering logic) */}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
              <StreamingAvatarTextInput
                label=""
                placeholder="Repeat"
                input={text}
                onSubmit={handleSpeak}
                setInput={setText}
                disabled={!stream}
                loading={isLoadingRepeat}
              />
              <div className="h-4"></div>
              <StreamingAvatarTextInput
                label=""
                placeholder="Chat"
                input={input}
                onSubmit={() => {
                  setIsLoadingChat(true);
                  if (!input) {
                    setDebug("Please enter text to send to ChatGPT");
                    return;
                  }
                  handleSubmit();
                }}
                setInput={setInput}
                loading={isLoadingChat}
                endContent={
                  <Tooltip
                    content={!recording ? "Start recording" : "Stop recording"}
                  >
                    <Button
                      onClick={!recording ? startRecording : stopRecording}
                      isDisabled={!stream}
                      isIconOnly
                      className={clsx(
                        "mr-4 text-white",
                        !recording
                          ? "bg-gradient-to-tr from-indigo-500 to-indigo-300"
                          : ""
                      )}
                      size="sm"
                      variant="shadow"
                    >
                      {!recording ? (
                        <Microphone size={20} />
                      ) : (
                        <>
                          <div className="absolute h-full w-full bg-gradient-to-tr from-indigo-500 to-indigo-300 animate-pulse -z-10"></div>
                          <MicrophoneStage size={20} />
                        </>
                      )}
                    </Button>
                  </Tooltip>
                }
                disabled={!stream}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-auto">
        <Controls />
      </div>
    </div>
  );
}
