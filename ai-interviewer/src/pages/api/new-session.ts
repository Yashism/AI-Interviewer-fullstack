import { NextApiRequest, NextApiResponse } from 'next';

const SERVER_URL = process.env.HEYGEN_API_URL;
const API_KEY = process.env.HEYGEN_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const response = await fetch(`${SERVER_URL}/v1/streaming.new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': API_KEY as string,
        },
        body: JSON.stringify({
          quality: 'high',
          avatar_name: 'Tyler-incasualsuit-20220721',
          voice: {
            voice_id: 'd7bbcdd6964c47bdaae26decade4a933',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create new session');
      }

      const data = await response.json();
      res.status(200).json(data.data);
    } catch (error) {
      console.error('Error creating new session:', error);
      res.status(500).json({ error: 'Failed to create new session' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}