import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function extractJSONFromString(str: string): any {
  const jsonRegex = /{[\s\S]*}/;
  const match = str.match(jsonRegex);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (error) {
      console.error('Error parsing extracted JSON:', error);
    }
  }
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: 'Missing fileName' });
    }

    const transcriptPath = path.join(process.cwd(), 'public', 'transcripts', fileName);
    const emotionPath = path.join(process.cwd(), 'public', 'emotion_data.txt');
    
    if (!fs.existsSync(transcriptPath)) {
      return res.status(404).json({ error: 'Transcript file not found' });
    }
    if (!fs.existsSync(emotionPath)) {
      return res.status(404).json({ error: 'Emotion data file not found' });
    }

    const transcriptContent = fs.readFileSync(transcriptPath, 'utf-8');
    const emotionContent = fs.readFileSync(emotionPath, 'utf-8');

    const prompt = `
      Given the following interview transcript and emotion data, provide the following details in JSON format:
      1. Overall interviewee score out of 100.
      2. Confidence score out of 100.
      3. Strengths of the interviewee (top 3).
      4. Weaknesses of the interviewee (top 3).
      5. Question by question analysis:
      - The question that was asked
      - What the user responded
      - What would be an ideal or better answer
      - The emotions displayed during the answer
      
      Provide the output strictly as a JSON object with keys: overall_score based on the responses, confidence_score based on emotions, strengths seen from the responses, weaknesses that differ from the ideal answers, questions (where questions is an array of objects, each containing question_asked, user_response, ideal_answer, and emotions_displayed).
      Do not include any explanations or text outside of the JSON object.
      
      Transcript:
      ${transcriptContent}
      
      Emotion Data:
      ${emotionContent}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant that always responds with valid JSON." },
        { role: "user", content: prompt }
      ],
    });

    const analysis = response.choices[0].message.content?.trim();
    if (!analysis) {
      throw new Error('No analysis generated');
    }

    const interviewId = Date.now().toString();
    const reportPath = path.join(process.cwd(), 'public', `${interviewId}.json`);
    fs.writeFileSync(reportPath, analysis);

    console.log('Raw analysis:', analysis);  // Log the raw analysis for debugging

    let analysisData;
    try {
      analysisData = JSON.parse(analysis);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      analysisData = extractJSONFromString(analysis);
      if (!analysisData) {
        throw new Error('Failed to parse analysis as JSON');
      }
    }

    return res.status(200).json({ ...analysisData, interviewId });
  } catch (error) {
    console.error('Error in analysis:', error);
    return res.status(500).json({ error: 'Error in analysis', details: error.message });
  }
}