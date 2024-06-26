import { NextApiRequest, NextApiResponse } from 'next';

const SERVER_URL = process.env.HEYGEN_API_URL;
const API_KEY = process.env.HEYGEN_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { session_id, candidate } = req.body;

      const response = await fetch(`${SERVER_URL}/v1/streaming.ice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': API_KEY as string,
        },
        body: JSON.stringify({ session_id, candidate }),
      });

      if (!response.ok) {
        throw new Error('Failed to handle ICE candidate');
      }

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
      res.status(500).json({ error: 'Failed to handle ICE candidate' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}