// components/CallScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import Controls from './Controls';
import { FiMoreVertical } from 'react-icons/fi';
import { AnimatePresence, motion } from "framer-motion";
import { useVoice } from "@humeai/voice-react";
import { cn } from "@/lib/utils";
import { processVideoFrame } from "@/utils/videoProcessing";

interface CallScreenProps {
  questions: string[];
  isCallConnected: boolean;
}

const CallScreen: React.FC<CallScreenProps> = ({ questions, isCallConnected }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { messages } = useVoice();
  const chatRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (isCallConnected) {
      startVideoStream();
    }
  }, [isCallConnected]);

  const startVideoStream = async () => {
    try {
      // Step 1: Create a new session
      const sessionResponse = await fetch('/api/new-session', {
        method: 'POST',
      });
      const sessionData = await sessionResponse.json();
      setSessionId(sessionData.session_id);

      // Step 2: Create and set up RTCPeerConnection
      const pc = new RTCPeerConnection({ iceServers: sessionData.ice_servers2 });
      setPeerConnection(pc);

      pc.ontrack = (event) => {
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0] ?? null;
        }
      };

      // Step 3: Set remote description
      await pc.setRemoteDescription(new RTCSessionDescription(sessionData.sdp));

      // Step 4: Create and set local description
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Step 5: Start the stream
      const startResponse = await fetch('/api/start-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionData.session_id, sdp: answer }),
      });

      if (!startResponse.ok) {
        throw new Error('Failed to start stream');
      }

      // Step 6: Handle ICE candidates
      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          fetch('/api/ice-candidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionData.session_id, candidate }),
          });
        }
      };

      console.log("Video stream started successfully");
    } catch (error) {
      console.error('Error starting video stream:', error);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-100 p-10 flex flex-col">
      <div className="flex-grow relative flex">
        <div className={`bg-white rounded-lg shadow-lg p-6 transition-all duration-300 ease-in-out ${isChatOpen ? 'w-4/5' : 'w-full'}`}>
          <div className="absolute top-4 right-4 cursor-pointer" onClick={() => setIsChatOpen(!isChatOpen)}>
            <FiMoreVertical size={24} />
          </div>
          <div className="flex flex-col h-full">
            {isCallConnected ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="mx-auto rounded-lg shadow-lg" 
                  />
                ) : (
                  <p>Connecting to call...</p>
                )}
          </div>
        </div>
        {isChatOpen && (
          <div className="w-1/5 bg-white rounded-lg shadow-lg ml-4 p-4 flex flex-col">
            <h2 className="text-xl font-bold mb-4">Chat</h2>
            <motion.div
              layoutScroll
              className="grow rounded-md overflow-auto"
              ref={chatRef}
            >
              <motion.div className="max-w-full mx-auto w-full flex flex-col gap-4 pb-4">
                <AnimatePresence mode="popLayout">
                  {messages.map((msg, index) => {
                    if (msg.type === "user_message" || msg.type === "assistant_message") {
                      return (
                        <motion.div
                          key={msg.type + index}
                          className={cn(
                            "w-full",
                            "bg-card",
                            "border border-border rounded",
                            msg.type === "user_message" ? "ml-auto" : ""
                          )}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 0 }}
                        >
                          <div className="text-xs capitalize font-medium leading-none opacity-50 pt-2 px-3">
                            {msg.message.role}
                          </div>
                          <div className="pb-2 px-3">{msg.message.content}</div>
                        </motion.div>
                      );
                    }
                    return null;
                  })}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>
      <div className="mt-auto">
        <Controls />
      </div>
    </div>
  );
};

export default CallScreen;