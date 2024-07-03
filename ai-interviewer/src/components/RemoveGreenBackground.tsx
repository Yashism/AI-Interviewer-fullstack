import React, { useEffect, useRef } from 'react';
import background from "../../public/background.png";

interface RemoveGreenBackgroundProps {
  stream: MediaStream | null;
}

const RemoveGreenBackground: React.FC<RemoveGreenBackgroundProps> = ({ stream }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const imageLoaded = useRef<boolean>(false);
  const offscreenCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));

  useEffect(() => {
    // Load background image
    imageRef.current.src = 'http://localhost:3000/background.png' // Change to white background
    imageRef.current.onload = () => {
      imageLoaded.current = true;
  
      // Draw the loaded image onto the offscreen canvas
      const offscreenCanvas = offscreenCanvasRef.current;
      offscreenCanvas.width = imageRef.current.width;
      offscreenCanvas.height = imageRef.current.height;
      const offscreenContext = offscreenCanvas.getContext('2d');
      offscreenContext?.drawImage(imageRef.current, 0, 0);
    };
    imageRef.current.onerror = (event) => {
      console.error('Failed to load image.', event);
      const target = event.target as HTMLImageElement;
      console.error(`Failed to load image from URL: ${target.src}`);
    };
  }, []);
  

  useEffect(() => {
    if (stream && canvasRef.current && imageLoaded.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const video = document.createElement('video');
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
      };

      const updateCanvas = (video: HTMLVideoElement, context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        if (!context) return;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = context.getImageData(0, 0, canvas.width, canvas.height);
        const length = frame.data.length / 4;

        const offscreenContext = offscreenCanvasRef.current.getContext('2d');
        const backgroundFrame = offscreenContext?.getImageData(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < length; i++) {
          const r = frame.data[i * 4];
          const g = frame.data[i * 4 + 1];
          const b = frame.data[i * 4 + 2];

          // If the pixel is green (adjust thresholds as needed)
          if (g > 100 && r < 100 && b < 100 && backgroundFrame) {
            frame.data[i * 4] = backgroundFrame.data[i * 4];
            frame.data[i * 4 + 1] = backgroundFrame.data[i * 4 + 1];
            frame.data[i * 4 + 2] = backgroundFrame.data[i * 4 + 2];
            frame.data[i * 4 + 3] = backgroundFrame.data[i * 4 + 3];
          }
        }

        context.putImageData(frame, 0, 0);

        requestAnimationFrame(() => updateCanvas(video, context, canvas));
      };

      if (context) {
        updateCanvas(video, context, canvas);
      }
    }
  }, [stream, imageLoaded.current]);

  return <canvas ref={canvasRef} width="600" height="480" style={{ display: 'block' }}></canvas>;
};

export default RemoveGreenBackground;
