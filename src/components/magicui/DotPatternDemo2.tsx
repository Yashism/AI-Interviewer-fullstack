"use client";

import { cn } from "@/lib/utils";
import DotPattern from "@/components/magicui/dot-pattern";
import {VelocityScroll} from "./scroll-based-velocity";

export default function DotPatternDemo2() {
  return (
    <div className="relative flex items-center justify-center overflow-hidden rounded-lg bg-background md:shadow-xl h-50">
      <VelocityScroll
      text="AI Resume, Stand Out, Tailored Suggestions, Detailed Feedback, Get Hired,"
      default_velocity={0.5}
      className="font-display text-center text-4xl font-bold tracking-[-0.02em] text-black drop-shadow-sm dark:text-white md:text-7xl md:leading-[5rem]"
    />
      <DotPattern
        width={15}
        height={15}
        cx={10}
        cy={4}
        cr={1}
        className={cn(
          "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] ",
        )}
      />
    </div>
  );
};

