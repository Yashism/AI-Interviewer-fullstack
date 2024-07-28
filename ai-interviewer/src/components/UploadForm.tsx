import { useState } from 'react';

const UploadForm = ({ onUpload }: { onUpload: (data: any) => void }) => {
  const [transcript, setTranscript] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      if (name === 'transcript') {
        setTranscript(file || null);
      } else if (name === 'resume') {
        setResume(file || null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!transcript || !resume) {
      setError('Both transcript and resume files are required.');
      return;
    }

    const formData = new FormData();
    formData.append('transcript', transcript);
    formData.append('resume', resume);

    try {
      const response = await fetch('http://localhost:8000/api/analyze/', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Backend Response:', data);  // Print the response to debug
      onUpload(data);
    } catch (error) {
      console.error('Error uploading files:', error);
      setError('Error uploading files. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      <input type="file" name="transcript" onChange={handleFileChange} />
      <input type="file" name="resume" onChange={handleFileChange} />
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Upload and Analyze</button>
    </form>
  );
};

export default UploadForm;
