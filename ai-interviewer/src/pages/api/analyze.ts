import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const scriptPath = path.resolve('./interview.py'); // Ensure this path is correct

  exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    try {
      console.log(`stdout: ${stdout}`); // Log the output to ensure it's correct
      const result = JSON.parse(stdout);
      res.status(200).json(result);
    } catch (err) {
      console.error(`JSON parse error: ${err}`);
      res.status(500).json({ error: 'Error parsing JSON output from script' });
    }
  });
}
