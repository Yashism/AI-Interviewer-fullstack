import React, { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { fetchAccessToken } from '@humeai/voice';
import { VoiceProvider } from '@humeai/voice-react';
import "../styles/globals.css"
import ResumeUploader from "@/components/ResumeUploader";
import Navbar from '@/components/navigation/Navbar';

const Interview = () => {
  const [accessToken, setAccessToken] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    const fetchToken = async () => {
      // make sure to set these environment variables
      const apiKey = "5clXGcclSBXfhERWNWBYx9GOgnPvzAruKJ3F5q6zJUbEui4j" || '';
      const secretKey = "uEVxLCKRPfMgkR6O5vNUtZ8GRLSVANAW7HwOAtiVfEu6UrwIbbMFyRa4nMiFfm09" || '';
      const token = (await fetchAccessToken({ apiKey, secretKey })) || '';

      setAccessToken(token);
    };

    fetchToken();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-grow items-center justify-center">
        <VoiceProvider
          auth={{ type: 'accessToken', value: accessToken }}
          configId={'db67e040-5345-4f4d-8157-3406b87d853f'} // set your configId here
        >
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <ResumeUploader />
          </div>
        </VoiceProvider>
      </div>
    </div>
  );
};

export default Interview;

