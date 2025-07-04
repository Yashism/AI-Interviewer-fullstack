import { Emotion, EmotionName } from "../lib/data/emotion";
import { useEffect, useRef, useState } from "react";
import { FacePrediction } from "../lib/data/facePrediction";
import { TrackedFace } from "../lib/data/trackedFace";
import { VideoRecorder } from "../lib/media/videoRecorder";
import { blobToBase64 } from "../lib/utilities/blobUtilities";
import { getApiUrlWs, Environment } from "../lib/utilities/environmentUtilities";
import { TopEmotions } from "./TopEmotions";
import { Descriptor } from "./Descriptor";

type FaceWidgetsProps = {
  userVideoRef: React.RefObject<HTMLVideoElement>;
  isCameraOn: boolean;
  apiKey: string;
  onEmotionUpdate?: (emotions: Emotion[]) => void;
};

export function FaceWidgets({ userVideoRef, isCameraOn, apiKey, onEmotionUpdate }: FaceWidgetsProps) {
  const socketRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<VideoRecorder | null>(null);
  const photoRef = useRef<HTMLCanvasElement | null>(null);
  const mountRef = useRef(true);
  const recorderCreated = useRef(false);
  const numReconnects = useRef(0);
  const [trackedFaces, setTrackedFaces] = useState<TrackedFace[]>([]);
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [status, setStatus] = useState("");
  const maxReconnects = 3;

  useEffect(() => {
    console.log("Mounting component");
    mountRef.current = true;
    console.log("Connecting to server");
    connect();

    return () => {
      console.log("Tearing down component");
      stopEverything();
    };
  }, []);

  useEffect(() => {
    if (isCameraOn && userVideoRef.current) {
      onVideoReady(userVideoRef.current);
    }
  }, [isCameraOn, userVideoRef]);

  function connect() {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("Socket already exists, will not create");
    } else {
      // Use the correct Environment type
      const environment: Environment = 'production' as Environment; // or the correct value for your environment
      const baseUrl = getApiUrlWs(environment);
      const endpointUrl = `${baseUrl}/v0/stream/models`;
      const socketUrl = `${endpointUrl}?apikey=${apiKey}`;
      console.log(`Connecting to websocket... (using ${endpointUrl})`);
      setStatus(`Connecting to server...`);

      const newSocket = new WebSocket(socketUrl);

      newSocket.onopen = socketOnOpen;
      newSocket.onmessage = socketOnMessage;
      newSocket.onclose = socketOnClose;
      newSocket.onerror = socketOnError;

      socketRef.current = newSocket;
    }
  }

  async function socketOnOpen() {
    console.log("Connected to websocket");
    setStatus("Connected to webcam");
    if (recorderRef.current) {
      console.log("Video recorder found, will use open socket");
      await capturePhoto();
    } else {
      console.warn("No video recorder exists yet to use with the open socket");
    }
  }

  async function socketOnMessage(event: MessageEvent) {
    setStatus("");
    const response = JSON.parse(event.data);
    console.log("Got response", response);
    const predictions: FacePrediction[] = response.face?.predictions || [];
    const warning = response.face?.warning || "";
    const error = response.error;
    if (error) {
      setStatus(error);
      console.error(error);
      stopEverything();
      return;
    }

    if (predictions.length === 0) {
      setStatus(warning.replace(".", ""));
      setEmotions([]);
    }

    const newTrackedFaces: TrackedFace[] = [];
    predictions.forEach(async (pred: FacePrediction, dataIndex: number) => {
      newTrackedFaces.push({ boundingBox: pred.bbox });
      if (dataIndex === 0) {
        const newEmotions = pred.emotions;
        setEmotions(newEmotions);
        if (onEmotionUpdate) {
          onEmotionUpdate(newEmotions);
        }
      }
    });
    setTrackedFaces(newTrackedFaces);

    await capturePhoto();
  }

  async function socketOnClose(event: CloseEvent) {
    console.log("Socket closed");

    if (mountRef.current === true) {
      setStatus("Reconnecting");
      console.log("Component still mounted, will reconnect...");
      connect();
    } else {
      console.log("Component unmounted, will not reconnect...");
    }
  }

  async function socketOnError(event: Event) {
    console.error("Socket failed to connect: ", event);
    if (numReconnects.current >= maxReconnects) {
      setStatus(`Failed to connect to the Hume API. Please check your API key.`);
      stopEverything();
    } else {
      numReconnects.current++;
      console.warn(`Connection attempt ${numReconnects.current}`);
    }
  }

  function stopEverything() {
    console.log("Stopping everything...");
    mountRef.current = false;
    const socket = socketRef.current;
    if (socket) {
      console.log("Closing socket");
      socket.close();
      socketRef.current = null;
    } else {
      console.warn("Could not close socket, not initialized yet");
    }
    const recorder = recorderRef.current;
    if (recorder) {
      console.log("Stopping recorder");
      recorder.stopRecording();
      recorderRef.current = null;
    } else {
      console.warn("Could not stop recorder, not initialized yet");
    }
  }

  async function onVideoReady(videoElement: HTMLVideoElement) {
    console.log("Video element is ready");

    if (!photoRef.current) {
      console.error("No photo element found");
      return;
    }

    if (!recorderRef.current && recorderCreated.current === false) {
      console.log("No recorder yet, creating one now");
      recorderCreated.current = true;
      const recorder = await VideoRecorder.create(videoElement, photoRef.current);

      recorderRef.current = recorder;
      const socket = socketRef.current;
      if (socket && socket.readyState === WebSocket.OPEN) {
        console.log("Socket open, will use the new recorder");
        await capturePhoto();
      } else {
        console.warn("No socket available for sending photos");
      }
    }
  }

  async function capturePhoto() {
    const recorder = recorderRef.current;

    if (!recorder) {
      console.error("No recorder found");
      return;
    }

    const photoBlob = await recorder.takePhoto();
    sendRequest(photoBlob);
  }

  async function sendRequest(photoBlob: Blob) {
    const socket = socketRef.current;

    if (!socket) {
      console.error("No socket found");
      return;
    }

    const encodedBlob = await blobToBase64(photoBlob);
    const requestData = JSON.stringify({
      data: encodedBlob,
      models: {
        face: {},
      },
    });

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(requestData);
    } else {
      console.error("Socket connection not open. Will not capture a photo");
      socket.close();
    }
  }

  return (
    <div>
      <div className="pt-6">{status}</div>
      <canvas className="hidden" ref={photoRef}></canvas>
      <TopEmotions emotions={emotions} numEmotions={3} />
      <Descriptor className="mt-8" emotions={emotions} />
    </div>
  );
}