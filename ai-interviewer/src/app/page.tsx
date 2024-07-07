import Link from "next/link";
import { ModeToggle } from "@/app/_components/toggle";
import { getServerAuthSession } from "@/server/auth";
import { BentoDemo } from "@/components/magicui/Bentogrid"; // Import the correct component

import "../styles/globals.css";
import { authStatus } from "@/lib/auth";
import Navbar from "@/components/navigation/Navbar";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerAuthSession();
  let status = false;

  const getAuthStatus = async () => {
    status = await authStatus();
    return status;
  };
  const isAuthenticated = authStatus();
  if (!isAuthenticated) {
    redirect("/signin");
  } else {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between">
      <Navbar />
      <BentoDemo />
    </div>
  );
}
