import { useState } from 'react';
import GaugeCircle from '@/components/magicui/guage-circle';
import UploadForm from '@/components/UploadForm';

interface Question {
  question: string;
  answer: string;
  ideal_answer: string;
}

interface Analysis {
  overall_score: number;
  confidence_score: number;
  positives: string[];
  weaknesses: string[];
  questions: Question[];
}

const Reports: React.FC = () => {
  const [data, setData] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = (data: Analysis) => {
    setData(data);
    setError(null);
  };

  return (
    <div className="min-h-screen py-2 bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Interview Report</h1>
      {!data && <UploadForm onUpload={handleUpload} />}
      {error && <div className="text-red-500">{error}</div>}
      {data && (
        <>
          <div className="flex space-x-8">
            <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center">
              <GaugeCircle
                max={100}
                min={0}
                value={data.overall_score}
                gaugePrimaryColor="#e9e9e9"
                gaugeSecondaryColor="rgba(70, 70, 70, 0.7)"
                className="h-24 w-24"
              />
              <div className="text-center mt-2">Overall Interview</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center">
              <GaugeCircle
                max={100}
                min={0}
                value={data.confidence_score}
                gaugePrimaryColor="#e9e9e9"
                gaugeSecondaryColor="rgba(70, 70, 70, 0.7)"
                className="h-24 w-24"
              />
              <div className="text-center mt-2">Confidence Levels</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 mt-8 w-full px-8">
            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold">Positives</h2>
              <ul className="list-disc list-inside mt-2">
                {data.positives.map((positive, index) => (
                  <li key={index}>{positive}</li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold">Weaknesses</h2>
              <ul className="list-disc list-inside mt-2">
                {data.weaknesses.map((weakness, index) => (
                  <li key={index}>{weakness}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md mt-8 w-full px-8">
            <h2 className="text-2xl font-semibold">Question Analysis</h2>
            <ul className="list-disc list-inside mt-2">
              {data.questions.map((q, index) => (
                <li key={index} className="mb-4">
                  <strong>Question:</strong> {q.question}<br />
                  <strong>Answer:</strong> {q.answer}<br />
                  <strong>Ideal Answer:</strong> {q.ideal_answer}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-4 mt-8">
            <button className="px-4 py-2 bg-gray-900 text-white rounded">Download Report</button>
            <button className="px-4 py-2 bg-gray-900 text-white rounded">Go to Homepage</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
