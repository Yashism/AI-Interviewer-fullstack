import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { interviewId } = req.query;

  if (!interviewId) {
    return res.status(400).json({ error: 'Missing interviewId' });
  }

  try {
    const reportPath = path.join(process.cwd(), 'public', `${interviewId}.json`);

    if (!fs.existsSync(reportPath)) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

    return res.status(200).json(reportData);
  } catch (error) {
    console.error('Error fetching report:', error);
    return res.status(500).json({ error: 'Error fetching report' });
  }
}