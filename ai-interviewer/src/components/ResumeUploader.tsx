"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import upload from "../../public/upload.svg";
import { Button } from "./ui/button";
import { Phone } from "lucide-react";
import StreamingAvatar from "./StreamingAvatar";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

export default function ResumeUploader() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [isCallConnected, setIsCallConnected] = useState(false);

  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0] as UploadedFile;
    setUploadedFile(file);
  
    const formData = new FormData();
    formData.append('pdf', file as unknown as Blob);
  
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Failed to upload PDF');
      }
  
      const data = await response.json();
      console.log('PDF uploaded successfully:', data);
      // Store the PDF text in state
      setResumeText(data.text);
    } catch (error) {
      console.error('Error uploading PDF:', error);
    }
  }, []);

  const [resumeText, setResumeText] = useState("");
  const removeFile = () => {
    setUploadedFile(null);
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const generateQuestions = async () => {
    if (!uploadedFile || !resumeText) {
      alert('Please upload a resume first.');
      return;
    }
  
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeText,
          jobTitle,
          companyName,
          jobDescription
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }
  
      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error('Error generating questions:', error);
    }
  };

  const startCall = () => {
    // if (!uploadedFile || questions.length === 0) {
    //   alert('Please upload a resume and generate questions first.');
    //   return;
    // }
    setShowCallScreen(true);
  };

  if (showCallScreen) {
    return <StreamingAvatar />;
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-white bg-dot-pattern">
      <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl border border-gray-300">
        <div className="flex justify-between">
          <div className="w-1/2 pr-4 flex flex-col">
            <h2 className="mb-4 text-xl grow-0 font-bold text-center text-black">Add your resume below</h2>
            <div
              {...getRootProps()}
              className={`rounded-lg grow border-2 border-dashed items-center content-center text-center ${
                isDragActive ? "border-blue-500" : "border-gray-300"
              }`}
            >
              <input {...getInputProps()}/>
              <Image
                className="mx-auto h-8 w-8 items-center justify-center"
                src={upload}
                alt="Upload Icon"
                width={100}
                height={100}
              />
              <p className="cursor-pointer text-gray-600 hover:text-blue-500 active:text-blue-700">
                Drag and drop your file here <br />
                or <br />
                click to select a file
              </p>
            </div>
            {uploadedFile && (
              <div className="mt-4 text-center text-gray-600">
                Uploaded file:
                <span className="ml-2 rounded bg-sky-500 px-5 text-white">
                  {uploadedFile.name}
                </span>
                <button
                  onClick={removeFile}
                  className="ml-2 rounded bg-red-500 px-2 text-white"
                >
                  X
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-gray-600">Or</span>
          </div>
          <div className="w-1/2 pl-4">
            <h2 className="mb-4 text-xl font-bold text-center text-black">Describe the Position</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="job-title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Job Title
                </label>
                <input
                  type="text"
                  id="job-title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="mt-1 p-1 block w-full rounded-md border text-md text-black font-medium border-gray-300 shadow-sm focus:border-gray-300 focus:ring-0 bg-white"
                />
              </div>
              <div>
                <label
                  htmlFor="company-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company name
                </label>
                <input
                  type="text"
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1 p-1 block w-full rounded-md border text-md text-black font-medium border-gray-300 shadow-sm focus:border-gray-300 focus:ring-0 bg-white"
                />
              </div>
              <div>
                <label
                  htmlFor="job-description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Job Description
                </label>
                <textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="mt-1 block p-1 w-full rounded-md border text-md text-black font-medium border-gray-300 shadow-sm focus:border-gray-300 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center p-6 space-x-4">
        <Button
          className="z-50 flex items-center bg-black text-white border border-transparent hover:bg-black hover:text-white hover:border-black transition-all duration-300 transform active:scale-95 active:shadow-inner"
          onClick={generateQuestions}
        >
          Generate Questions
        </Button>
        <Button
          className="z-50 flex items-center gap-1.5 bg-black text-white border border-transparent hover:bg-black hover:text-white hover:border-black transition-all duration-300 transform active:scale-95 active:shadow-inner"
          onClick={startCall}
        >
          <span>
            <Phone
              className={"size-4 opacity-50"}
              strokeWidth={2}
              stroke={"currentColor"}
            />
          </span>
          <span>Start Call</span>
        </Button>
      </div>
      </div>
    </div>
  );
}