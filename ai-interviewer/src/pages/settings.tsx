import Link from "next/link";

import Navbar from "@/components/navigation/Navbar";

import "../styles/globals.css";
import { useState } from "react";
import GeneralSettings from "@/components/settings/general";
import Feedback from "@/components/settings/feedback";

export function Settings() {
  const [currentTab, setCurrentTab] = useState("General");

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <nav
            className="grid gap-4 text-sm text-muted-foreground"
            x-chunk="dashboard-04-chunk-0"
          >
            <Link
              onClick={() => setCurrentTab("General")}
              href="#"
              className={
                currentTab === "General" ? "font-semibold text-primary" : ""
              }
            >
              General
            </Link>

            <Link
              href="#"
              className={
                currentTab === "Feedback" ? "font-semibold text-primary" : ""
              }
              onClick={() => setCurrentTab("Feedback")}
            >
              Feedback
            </Link>
          </nav>
          <div className="grid gap-6">
            {currentTab === "General" && <GeneralSettings />}
            {currentTab === "Feedback" && <Feedback />}
          </div>
        </div>
      </main>
    </div>
  );
}
export default Settings;
