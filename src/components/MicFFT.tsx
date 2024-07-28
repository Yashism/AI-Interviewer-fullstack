"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AutoSizer } from "react-virtualized";
import "../styles/globals.css";

export default function MicFFT({
  fft,
  className,
}: {
  fft: number[];
  className?: string;
}) {
  return (
    <div className={"relative size-full"}>
      <AutoSizer>
        {({ width, height }) => (
          <motion.svg
            viewBox={`0 0 ${width} ${height}`}
            width={width}
            height={height}
            className={cn("absolute !inset-0 !size-full", className)}
          >
            {Array.from({ length: 24 }).map((_, index) => {
              const value = (fft[index] ?? 0) / 255; // Normalize value between 0 and 1
              const maxHeight = height * 0.8; // Maximum height of 80% of container
              const minHeight = height * 0.1; // Minimum height of 10% of container
              const h = Math.max(minHeight, Math.min(maxHeight * value, maxHeight));
              const yOffset = (height - h) / 2; // Center the bar vertically
              return (
                <motion.rect
                  key={`mic-fft-${index}`}
                  height={h}
                  width={2}
                  x={index * (width / 24)}
                  y={yOffset}
                  rx={1} // Rounded corners
                  ry={1} // Rounded corners
                  fill="black"
                />
              );
            })}
          </motion.svg>
        )}
      </AutoSizer>
    </div>
  );
}