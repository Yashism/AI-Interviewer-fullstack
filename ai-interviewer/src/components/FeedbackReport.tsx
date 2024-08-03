import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface ReportData {
  overall_score: number;
  confidence_score: number;
  strengths: string[];
  weaknesses: string[];
  questions: {
    question: string;
    answer: string;
    ideal_answer: string;
    emotions: string;
  }[];
}

const FeedbackReport = ({ reportData }: { reportData: ReportData }) => {
  const { overall_score, confidence_score, strengths, weaknesses, questions } =
    reportData;

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-lg">
      <h1 className="mb-6 text-center text-3xl font-bold">
        Interview Feedback Report
      </h1>

      <div className="mb-8 flex justify-around">
        <div className="w-40">
          <CircularProgressbar
            value={overall_score}
            text={`${overall_score}%`}
            styles={buildStyles({
              textColor: "#3e98c7",
              pathColor: "#3e98c7",
            })}
          />
          <p className="mt-2 text-center font-semibold">Overall Score</p>
        </div>
        <div className="w-40">
          <CircularProgressbar
            value={confidence_score}
            text={`${confidence_score}%`}
            styles={buildStyles({
              textColor: "#82ca9d",
              pathColor: "#82ca9d",
            })}
          />
          <p className="mt-2 text-center font-semibold">Confidence Score</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-8">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Strengths</h2>
          <ul className="list-disc pl-5">
            {strengths.map((strength, index) => (
              <li key={index} className="mb-2">
                {strength}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-xl font-semibold">Areas for Improvement</h2>
          <ul className="list-disc pl-5">
            {weaknesses.map((weakness, index) => (
              <li key={index} className="mb-2">
                {weakness}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="mb-4 text-2xl font-semibold">Question Analysis</h2>
      {questions.map((q, index) => (
        <div key={index} className="mb-6 rounded-lg bg-gray-100 p-4">
          <h3 className="mb-2 font-semibold">Q: {q.question}</h3>
          <p className="mb-2">
            <strong>Your Answer:</strong> {q.answer}
          </p>
          <p className="mb-2">
            <strong>Ideal Answer:</strong> {q.ideal_answer}
          </p>
          <p>
            <strong>Emotions:</strong> {q.emotions}
          </p>
        </div>
      ))}
    </div>
  );
};

export default FeedbackReport;
