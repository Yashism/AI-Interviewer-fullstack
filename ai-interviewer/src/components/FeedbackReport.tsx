import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface ReportData {
  overall_score: number;
  confidence_score: number;
  strengths: string[];
  weaknesses: string[];
  questions: {
    question_asked: string;
    user_response: string;
    ideal_answer: string;
    emotions_displayed: string;
  }[];
}

const FeedbackReport = ({ reportData }: { reportData: ReportData | null }) => {
  if (!reportData) {
    return <div>No report data available.</div>;
  }

  const { overall_score, confidence_score, strengths, weaknesses, questions } = reportData;

  return (
    <div className="mx-auto max-w-5xl rounded-lg bg-white p-8 border-none shadow-lg">
      <h1 className="mb-6 text-center text-3xl font-bold">
        Interview Feedback Report
      </h1>

      <div className="mb-8 flex justify-around items-center">
        <div className="w-32 text-center">
          <div className="mx-auto w-36 h-36">
            <CircularProgressbar
              value={overall_score || 0}
              text={`${overall_score || 0}%`}
              styles={buildStyles({
                textSize: '22px',
                pathColor: "#3e98c7",
                textColor: "#3e98c7",
              })}
            />
          </div>
          <p className="mt-2 font-semibold">Overall Score</p>
        </div>
        <div className="w-32 text-center">
          <div className="mx-auto w-36 h-36">
            <CircularProgressbar
              value={confidence_score || 0}
              text={`${confidence_score || 0}%`}
              styles={buildStyles({
                textSize: '22px',
                pathColor: "#82ca9d",
                textColor: "#82ca9d",
              })}
            />
          </div>
          <p className="mt-2 font-semibold">Confidence Score</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-8">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Strengths</h2>
          <ul className="list-disc pl-5">
            {strengths && strengths.map((strength, index) => (
              <li key={index} className="mb-2">
                {strength}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-xl font-semibold">Areas for Improvement</h2>
          <ul className="list-disc pl-5">
            {weaknesses && weaknesses.map((weakness, index) => (
              <li key={index} className="mb-2">
                {weakness}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="mb-4 text-2xl font-semibold">Question Analysis</h2>
      {questions && questions.map((q, index) => (
        <div key={index} className="mb-6 rounded-lg bg-gray-100 p-4">
          <h3 className="mb-2 font-semibold">Q: {q.question_asked}</h3>
          <p className="mb-2">
            <strong>Your Response:</strong> {q.user_response}
          </p>
          <p className="mb-2">
            <strong>Ideal Answer:</strong> {q.ideal_answer}
          </p>
          <p>
          <strong>Emotions Displayed:</strong> {
              Array.isArray(q.emotions_displayed)
                ? q.emotions_displayed.join(', ')
                : typeof q.emotions_displayed === 'string'
                  ? q.emotions_displayed.split(/[,\s]+/).join(', ')
                  : 'No emotions data'
            }
          </p>
        </div>
      ))}
    </div>
  );
};

export default FeedbackReport;