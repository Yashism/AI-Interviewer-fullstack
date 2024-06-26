
import { cn } from "@/lib/utils";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { CalendarIcon, FileTextIcon, InputIcon } from "@radix-ui/react-icons";
import { GaugeCircleDemo } from "@/components/magicui/guage";
import { Share2Icon } from "lucide-react";
import { CgProfile } from "react-icons/cg";
import { PiVideoConferenceDuotone } from "react-icons/pi";
import { BsStars } from "react-icons/bs";
import { FaRegFolderOpen } from "react-icons/fa";
import NumberTicker from "../magicui/number-ticker";
import DotPatternDemo2 from "@/components/magicui/DotPatternDemo2";


const features = [
  {
    Icon: CgProfile,
    name: "Profile",
    description: "Update your profile information.",
    href: "/settings",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="items-center justify-center relative items w-32 h-32 rounded-full border-2 border-gray-950/10 dark:border-gray-50/10">
        <img
          src="https://i.ibb.co/cCJNNDt/DALL-E-2023-11-07-10-12-03-3-D-illustration-of-an-animated-programmer-character-showcasing-an-oval-s.png"
          alt="Profile"
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    ),
    extraPadding: true,
  },
  {
    Icon: PiVideoConferenceDuotone,
    name: "Practice Interviews",
    description: "Practice interviews with AI.",
    href: "/interview",
    cta: "Start Practicing",
    className: "col-span-3 lg:col-span-2",
    background: (
      <GaugeCircleDemo />
    ),
    extraPadding: true,
  },
  {
    Icon: BsStars,
    name: "Enhance Your Resume",
    description: "Get detailed feedback on your resume and improve it with AI.",
    href: "/",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <DotPatternDemo2 /> 
    ),
    extraPadding: false,
  },
  {
    Icon: FaRegFolderOpen,
    name: "Job Application Tracker",
    description: "Track your job applications and interviews.",
    className: "col-span-3 lg:col-span-1",
    href: "/",
    cta: "Learn more",
    background: (
      <p className="items-center justify-center whitespace-pre-wrap text-8xl font-medium tracking-tighter text-black dark:text-white">
      <NumberTicker value={58} />
    </p>
    ),
    extraPadding: true,
  },
];

export function BentoDemo() {
  return (
    <BentoGrid className="w-1/2 py-10">
      {features.map((feature, idx) => (
        <BentoCard key={idx} {...feature} />
      ))}
    </BentoGrid>
  );
}
