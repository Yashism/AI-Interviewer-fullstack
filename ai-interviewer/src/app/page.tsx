import Link from "next/link";
import { ModeToggle } from "@/app/_components/toggle";
import {BentoDemo} from "@/components/magicui/Bentogrid"; // Import the correct component
import "../styles/globals.css";

export default async function Home() {

  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-4 py-9">
      <header className="flex h-16 w-full items-center justify-between text-xl font-semibold bg-background px-20 py-17 md:px-6">
        <Link href="https://ai-interviewer.framer.website/" className="flex items-center gap-2" prefetch={false}>
          <div className="">AI Interviewer</div>
        </Link>
        <nav className="flex items-center space-x-4 gap-4">
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-lg font-semibold  dark:from-white dark:to-slate-900/10 transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            prefetch={false}
          >
            Dashboard
          </Link>
          <Link
            href="/interview"
            className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-lg font-semibold  dark:from-white dark:to-slate-900/10 transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            prefetch={false}
          >
            Interview
          </Link>
          <Link
            href="/settings" // Update the link to point to the correct path
            className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-lg font-semibold  dark:from-white dark:to-slate-900/10 transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            prefetch={false}
          >
            Settings
          </Link>
          <Link
            href="/help"
            className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-lg font-semibold  dark:from-white dark:to-slate-900/10 transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            prefetch={false}
          >
            Help
          </Link>
        </nav>
        <div className="flex flex-row items-center justify-between gap-5">
          <ModeToggle />
        </div>
      </header>
      <BentoDemo />
    </div>
  );
}