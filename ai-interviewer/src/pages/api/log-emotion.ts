// pages/api/log-emotion.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { emotion } = req.body;
      const timestamp = new Date().toISOString();
      const logEntry = `${timestamp}: ${emotion}\n`;
      
      const filePath = path.join(process.cwd(), 'emotion_log.txt');
      
      // Append to the file
      fs.appendFileSync(filePath, logEntry);
      
      res.status(200).json({ message: 'Emotion logged successfully' });
    } catch (error) {
      console.error('Error logging emotion:', error);
      res.status(500).json({ error: 'Failed to log emotion' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}