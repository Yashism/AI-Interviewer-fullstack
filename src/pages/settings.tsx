import Link from "next/link";
import "../styles/globals.css";
import { useRouter } from 'next/router';
import Navbar from "@/components/navigation/Navbar";
import ProfileSettings from "@/pages/settings/ProfileSettings";
import { useState } from "react";
import ApiSettings from "./settings/Apisettings";
import InterviewSettings from "./settings/InterviewSettings";

export function Settings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(router.query.tab || 'profile');
  const renderContent = () => {
    switch(activeTab) {
      case "profile" :
      return <ProfileSettings/>
      case 'api':
        return <ApiSettings/>;
        case 'interview':
        return <InterviewSettings/>;
        default:
          return <ProfileSettings />;
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-white flex-col dark:bg-black">
      <Navbar />
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10  dark:bg-black">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <nav className="grid gap-4 text-sm text-muted-foreground">
        <Link href="/settings?tab=profile" onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? "font-semibold text-primary" : ""}>
              Profile
            </Link>
            <Link href="/settings?tab=interview" onClick={() => setActiveTab('interview')} className={activeTab === 'interview' ? "font-semibold text-primary" : ""}>
              Interview Settings
            </Link>
            <Link href="/settings?tab=api" onClick={() => setActiveTab('api')} className={activeTab === 'api' ? "font-semibold text-primary" : ""}>
              Api-Integrations
            </Link>
            <Link href="/help">Support</Link>
        </nav>
          <div className="grid gap-6">
          {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
export default Settings;
