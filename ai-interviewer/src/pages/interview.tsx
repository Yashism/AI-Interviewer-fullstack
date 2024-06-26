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
      const apiKey = "hzTh1f0x6mm1N0i1GjkbKHFWXilJ7SpsEPbarRkadr7CqjZg" || '';
      const secretKey = "dE1MTZ6dGpd7o9QVhfGLSLM36RKnmeKQ98GIh1r8RcmOEVv5lJSyuvrunGLy0tGA" || '';

      const token = (await fetchAccessToken({ apiKey, secretKey })) || '';

      setAccessToken(token);
    };

    fetchToken();
  }, []);

  return (
    <div>
        <VoiceProvider
          auth={{ type: 'accessToken', value: accessToken }}
          configId={'25eb0fea-d9e4-40da-86be-c0e01acd0efd'} // set your configId here
        >
          <ResumeUploader />
        </VoiceProvider>
    </div>
  );
};

export default Interview;
