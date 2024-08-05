import React, { useState, useEffect } from 'react';
import ResumeUploader from "@/components/ResumeUploader";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/router";

const Interview = () => {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded || !userId) {
    return <div>Loading...</div>;
  }

  return (
    <div>
          <ResumeUploader />
    </div>
  );
};

export default Interview;