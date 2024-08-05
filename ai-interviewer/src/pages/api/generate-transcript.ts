import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { messages, emotionLog, userMessages } = req.body;

    // Generate timestamp for the file name
    const fileTimestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];

    // Create the transcript content
    let transcriptContent = `Interview Transcript - ${fileTimestamp}\n\n`;

    let userMessageIndex = 0;
    messages.forEach((message: any) => {
      const speaker = message.role === 'user' ? 'User' : 'AI';
      const messageTime = new Date(message.timestamp || Date.now()).toTimeString().split(' ')[0];
      
      transcriptContent += `${messageTime} - ${speaker}: ${message.content}`;

      // Add emotion for user messages if available
      if (speaker === 'User' && userMessageIndex < userMessages.length) {
        const userMessage = userMessages[userMessageIndex];
        const relevantEmotions = emotionLog.filter(e => 
          e.timestamp >= userMessage.timestamp && 
          (userMessageIndex + 1 < userMessages.length ? e.timestamp < userMessages[userMessageIndex + 1].timestamp : true)
        );
        
        if (relevantEmotions.length > 0) {
          const latestEmotion = relevantEmotions[relevantEmotions.length - 1];
          transcriptContent += ` (${latestEmotion.emotion})`;
        }
        
        userMessageIndex++;
      }

      transcriptContent += '\n\n';
    });

    // Write the transcript to a file
    const fileName = `interview_transcript_${fileTimestamp}.txt`;
    const filePath = path.join(process.cwd(), 'public', 'transcripts', fileName);
    fs.writeFileSync(filePath, transcriptContent);

    res.status(200).json({ message: 'Transcript generated successfully', fileName });
  } catch (error) {
    console.error('Error generating transcript:', error);
    res.status(500).json({ message: 'Error generating transcript' });
  }
}