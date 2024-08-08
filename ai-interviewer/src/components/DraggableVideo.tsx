import { useState, useRef, useEffect } from "react";
import { Video, VideoOff } from "lucide-react";

interface DraggableVideoProps {
  isCameraOn: boolean;
  toggleCamera: () => void;
}

export const DraggableVideo: React.FC<DraggableVideoProps> = ({
  isCameraOn,
  toggleCamera,
}) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [size, setSize] = useState({ width: 300, height: 200 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isCameraOn && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Error accessing camera:", err));
    } else if (!isCameraOn && videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }, [isCameraOn]);

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as Element).classList.contains('resizer')) {
      setIsResizing(true);
      setResizeDirection((e.target as Element).getAttribute('data-direction'));
    } else {
      setIsDragging(true);
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - size.width / 2,
        y: e.clientY - size.height / 2,
      });
    } else if (isResizing && resizeDirection) {
      const newSize = { ...size };
      const newPosition = { ...position };
      const dx = e.clientX - position.x;
      const dy = e.clientY - position.y;

      if (resizeDirection.includes('right')) newSize.width = dx;
      if (resizeDirection.includes('left')) {
        newSize.width = size.width - dx;
        newPosition.x = e.clientX;
      }
      if (resizeDirection.includes('bottom')) newSize.height = dy;
      if (resizeDirection.includes('top')) {
        newSize.height = size.height - dy;
        newPosition.y = e.clientY;
      }

      setSize(newSize);
      setPosition(newPosition);
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        borderRadius: "8px",
        backgroundColor: "transparent",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {isCameraOn && (
        <video
          ref={videoRef}
          autoPlay
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "8px",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          display: "flex",
          gap: "10px",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        {isCameraOn ? (
          <VideoOff onClick={toggleCamera} style={{ cursor: "pointer" }} />
        ) : (
          <Video onClick={toggleCamera} style={{ cursor: "pointer" }} />
        )}
      </div>
      {['top-left', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left'].map((direction) => (
        <div
          key={direction}
          className={`resizer resizer-${direction}`}
          data-direction={direction}
          onMouseDown={onMouseDown}
          style={{
            position: "absolute",
            ...(direction.includes('top') && { top: 0 }),
            ...(direction.includes('bottom') && { bottom: 0 }),
            ...(direction.includes('left') && { left: 0 }),
            ...(direction.includes('right') && { right: 0 }),
            ...(direction === 'top-left' && { cursor: 'nwse-resize' }),
            ...(direction === 'top-right' && { cursor: 'nesw-resize' }),
            ...(direction === 'bottom-left' && { cursor: 'nesw-resize' }),
            ...(direction === 'bottom-right' && { cursor: 'nwse-resize' }),
            ...((direction === 'top' || direction === 'bottom') && { left: '50%', cursor: 'ns-resize', transform: 'translateX(-50%)' }),
            ...((direction === 'left' || direction === 'right') && { top: '50%', cursor: 'ew-resize', transform: 'translateY(-50%)' }),
            width: 10,
            height: 10,
            backgroundColor: "transparent",
            zIndex: 10,
          }}
        />
      ))}
    </div>
  );
};
