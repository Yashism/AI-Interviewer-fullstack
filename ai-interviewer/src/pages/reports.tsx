import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Reports() {
  const router = useRouter();
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { file } = router.query;
    if (file) {
      fetchTranscript(file as string);
    }
  }, [router.query]);

  const fetchTranscript = async (fileName: string) => {
    try {
      const response = await fetch(`/api/get-transcript?file=${fileName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transcript');
      }
      const data = await response.text();
      setTranscript(data);
    } catch (error) {
      console.error('Error fetching transcript:', error);
      setError('Failed to load the transcript. Please try again.');
    }
  };

  if (error) {
    return <div className="container mx-auto p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Interview Report</h1>
      {transcript ? (
        <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">{transcript}</pre>
      ) : (
        <p>Loading transcript...</p>
      )}
    </div>
  );
}