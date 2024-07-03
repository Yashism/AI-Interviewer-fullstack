import React, { useState, useEffect } from 'react';
import { fetchAccessToken } from '@humeai/voice';
import { VoiceProvider } from '@humeai/voice-react';
import "../styles/globals.css"
import ResumeUploader from "@/components/ResumeUploader";

const Interview = () => {
  const [accessToken, setAccessToken] = useState('');

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
    <div>
        <VoiceProvider
          auth={{ type: 'accessToken', value: accessToken }}
          configId={'db67e040-5345-4f4d-8157-3406b87d853f'} // set your configId here
        >
          <ResumeUploader />
        </VoiceProvider>
    </div>
  );
};

export default Interview;
