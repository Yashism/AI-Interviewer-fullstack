import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Mic, MicOff, Phone, Video, VideoOff } from "lucide-react";
import { Toggle } from "./ui/toggle";
import { useEffect, useState, useRef } from "react";
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
import MicFFT from "./MicFFT";

import "../styles/globals.css";

interface ControlsProps {
  finalTranscript: string;
  setFinalTranscript: (transcript: string) => void;
  handleSubmit: () => void;
  handleInactivity: () => void;
  isCameraOn: boolean;
  toggleCamera: () => void;
}

export default function Controls({ 
  finalTranscript, 
  setFinalTranscript, 
  handleSubmit, 
  handleInactivity,
  isCameraOn,
  toggleCamera
}: ControlsProps) {
  const [caption, setCaption] = useState<string | undefined>("Powered by AI-INTERVIEWER");
  const { connection, connectToDeepgram, disconnectFromDeepgram, connectionState } = useDeepgram();
  const { setupMicrophone, microphone, startMicrophone, stopMicrophone, microphoneState } = useMicrophone();

  const [accumulatedTranscript, setAccumulatedTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [fftData, setFftData] = useState<number[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    setupMicrophone();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      connectToDeepgram({
        model: "nova-2",
        interim_results: true,
        smart_format: true,
        filler_words: false,
        utterance_end_ms: 1000,
        endpointing: 500
      });
    }
  }, [microphoneState]);

  useEffect(() => {
    if (!microphone || !connection) return;

    const onData = (e: BlobEvent) => {
      if (e.data.size > 0) {
        connection.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const { is_final, speech_final } = data;
      const thisCaption = data.channel.alternatives[0].transcript;

      console.log("Received transcript:", thisCaption, "Is final:", is_final, "Speech final:", speech_final);

      if (thisCaption !== "") {
        setCaption(thisCaption);
        setIsSpeaking(true);

        if (is_final) {
          const newTranscript = accumulatedTranscript + " " + thisCaption;
          setAccumulatedTranscript("");
          setFinalTranscript(newTranscript.trim());
          handleSubmit();
        } else {
          setAccumulatedTranscript(prev => prev + " " + thisCaption);
        }

        // Reset inactivity timer
        if (inactivityTimeoutRef.current) {
          clearTimeout(inactivityTimeoutRef.current);
        }
        inactivityTimeoutRef.current = setTimeout(() => {
          handleInactivity();
        }, 10000);
      }
    };

    if (connectionState === CONNECTION_STATE.Open) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);
      startMicrophone();

      // Set up audio context and analyser for MicFFT
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      sourceRef.current = audioContextRef.current.createMediaStreamSource(microphone.stream);
      sourceRef.current.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateFFT = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          setFftData(Array.from(dataArray));
        }
        requestAnimationFrame(updateFFT);
      };
      updateFFT();

      // Start inactivity timer
      inactivityTimeoutRef.current = setTimeout(() => {
        handleInactivity();
      }, 10000);
    }

    return () => {
      connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      if (sourceRef.current) sourceRef.current.disconnect();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [connectionState, microphone, connection]);

  const toggleMicrophone = () => {
    if (microphoneState === MicrophoneState.Open) {
      stopMicrophone();
      if (accumulatedTranscript.trim() !== "") {
        setFinalTranscript(accumulatedTranscript.trim());
        setAccumulatedTranscript("");
        handleSubmit();
      }
    } else {
      startMicrophone();
    }
  };

  return (
    <div className={cn("fixed bottom-0 left-0 w-full p-4 flex items-center justify-center")}>
      <div className="p-4 bg-card border border-border rounded-lg shadow-sm flex items-center gap-4">
        <Toggle pressed={isCameraOn} onPressedChange={toggleCamera}>
          {isCameraOn ? (
            <Video className="size-4" />
          ) : (
            <VideoOff className="size-4" />
          )}
        </Toggle>
        
        <Toggle pressed={microphoneState === MicrophoneState.Open} onPressedChange={toggleMicrophone}>
          {microphoneState !== MicrophoneState.Open ? (
            <MicOff className="size-4" />
          ) : (
            <Mic className="size-4" />
          )}
        </Toggle>

        <div className="relative h-6 w-48 shrink-0">
          {microphoneState === MicrophoneState.Open && (
            <MicFFT fft={fftData} className="text-foreground/50" />
          )}
        </div>

        <Button
          className="flex items-center gap-1"
          onClick={() => {
            connection?.finish();
            disconnectFromDeepgram();
          }}
          variant="destructive"
        >
          <span>
            <Phone className="size-4 opacity-50" strokeWidth={2} stroke="currentColor" />
          </span>
          <span>End Call</span>
        </Button>
      </div>
      <div className="absolute top-[-30px] left-0 w-full text-center">
        <p className="text-sm text-gray-500">{caption}</p>
      </div>
    </div>
  );
}