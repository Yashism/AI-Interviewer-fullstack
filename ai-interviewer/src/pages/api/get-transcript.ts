import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { file } = req.query;

  if (!file || typeof file !== 'string') {
    return res.status(400).json({ message: 'File name is required' });
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'transcripts', file);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    res.status(200).send(fileContents);
  } catch (error) {
    console.error('Error reading transcript file:', error);
    res.status(500).json({ message: 'Error reading transcript file' });
  }
}