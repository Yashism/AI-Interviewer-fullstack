"use client";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Mic, MicOff, Phone } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Toggle } from "./ui/toggle";
import { useCallback, useEffect, useState } from "react";
import {
  CONNECTION_STATE,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  useDeepgram,
} from "../context/DeepgramContextProvider";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "../context/MicrophoneContextProvider";
import Visualizer from "./Visualizer";
import MicFFT from "./MicFFT";

import "../styles/globals.css";

export default function Controls() {
  const [isFirstConnection, setIsFirstConnection] = useState(true);
  const [caption, setCaption] = useState<string | undefined>(
    "Powered by AI-INTERVIEWER"
  );
  const { connection, connectToDeepgram, connectionState } = useDeepgram();
  const { setupMicrophone, microphone, startMicrophone, stopMicrophone, microphoneState } = useMicrophone();

  const sendInitialGreeting = useCallback(() => {
    // TODO: Implement sending initial greeting with Deepgram
  }, []);

  useEffect(() => {
    setupMicrophone();
  }, []);

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      connectToDeepgram({
        model: "nova-2",
        interim_results: true,
        smart_format: true,
        filler_words: false,
        utterance_end_ms: 3000,
      });
    }
  }, [microphoneState]);

  useEffect(() => {
    if (!microphone) return;
    if (!connection) return;

    const onData = (e: BlobEvent) => {
      if (e.data.size > 0) {
        connection?.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const { is_final: isFinal, speech_final: speechFinal } = data;
      let thisCaption = data.channel.alternatives[0].transcript;

      if (thisCaption !== "") {
        setCaption(thisCaption);
      }

      if (isFinal && speechFinal) {
        setTimeout(() => {
          setCaption(undefined);
        }, 3000);
      }
    };

    if (connectionState == CONNECTION_STATE.Open) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);

      startMicrophone();
    }

    return () => {
      connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
    };
  }, [connectionState]);

  return (
    <div
      className={
        cn(
          "fixed bottom-0 left-0 w-full p-4 flex items-center justify-center",
        )
      }
    >
      <AnimatePresence>
        {/* {connectionState === CONNECTION_STATE.Open ? ( */}
          <motion.div
            initial={{
              y: "100%",
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: "100%",
              opacity: 0,
            }}
            className={
              "p-4 bg-card border border-border rounded-lg shadow-sm flex items-center gap-4"
            }
          >
            <Toggle
              pressed={microphoneState === MicrophoneState.Open}
              onPressedChange={() => {
                if (microphoneState === MicrophoneState.Open) {
                  stopMicrophone();
                } else {
                  startMicrophone();
                }
              }}
            >
              {microphoneState !== MicrophoneState.Open ? (
                <MicOff className={"size-4"} />
              ) : (
                <Mic className={"size-4"} />
              )}
            </Toggle>

            <div className={"relative grid h-8 w-48 shrink grow-0"}>
              {microphoneState === MicrophoneState.Open && (
                <motion.div
                initial={{opacity : 0}}
                animate={{opacity : 1}}
                exit={{opacity : 0}}
                className={"fill-current"}
                >
                  <Visualizer microphone={microphone} />
                </motion.div>
              )}
            </div>

            <Button
              className={"flex items-center gap-1"}
              onClick={() => {
                connection?.finish();
              }}
              variant={"destructive"}
            >
              <span>
                <Phone
                  className={"size-4 opacity-50"}
                  strokeWidth={2}
                  stroke={"currentColor"}
                />
              </span>
              <span>End Call</span>
            </Button>
          </motion.div>
        {/* ) : null} */}
      </AnimatePresence>
    </div>
  );
}