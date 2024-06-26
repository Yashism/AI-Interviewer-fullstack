const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");
require("dotenv").config();
const OpenAI = require("openai");

const app = express();
const port = process.env.PORT || 5000;

const openaiApiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

app.use(express.json());
app.use(fileUpload());
app.use(express.static("public"));

app.post("/api/upload", async (req, res) => {
  if (!req.files || !req.files.pdf) {
    return res.status(400).send("No file uploaded.");
  }

  const pdf = req.files.pdf;
  try {
    const pdfData = await pdfParse(pdf.data);
    const text = pdfData.text;
    res.json({ text });
  } catch (error) {
    console.error("Error parsing PDF:", error);
    res.status(500).send("Failed to parse PDF");
  }
});

app.post("/api/generate-questions", async (req, res) => {
  const { resumeText, jobTitle, companyName, jobDescription } = req.body;

  const prompt = `Generate 10 interview questions based on the following resume and job details:
  
  Resume:
  ${resumeText}
  
  Job Title: ${jobTitle}
  Company: ${companyName}
  Job Description: ${jobDescription}
  
  Sometimes only either of things would be given sometimes only resume, sometimes only job descrption and something both. Please provide a list of questions that are relevant to both the resume and the job description.`;

  console.log("Prompt:", prompt);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const questions = response.choices[0].message.content
      .split("\n")
      .filter((q) => q.trim().length > 0)
      .map((q) => q.replace(/^\d+\.\s*/, "").trim());

    res.json({ questions });

    console.log("Questions:", questions);
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).send("Failed to generate questions.");
  }
});

////////////////////////////////////////////////////////////////

let sessionInfo = null;



const getProjectId = async () => {
  const { result, error } = await client.manage.getProjects();

  if (error) {
    throw error;
  }

  return result.projects[0].project_id;
};

const getTempApiKey = async (projectId) => {
  const { result, error } = await client.manage.createProjectKey(projectId, {
    comment: "short lived",
    scopes: ["usage:write"],
    time_to_live_in_seconds: 600, // Increased TTL to 10 minutes for testing purposes
  });

  if (error) {
    throw error;
  }

  return result;
};

app.get("/key", async (req, res) => {
  try {
    const projectId = await getProjectId();
    const key = await getTempApiKey(projectId);

    res.json(key);
  } catch (error) {
    console.error('Error generating API key:', error);
    res.status(500).send('Error generating API key');
  }
});

app.post('/session/new', async (req, res) => {
  try {
    const avatar = 'Tyler-incasualsuit-20220721';
    const voice = 'd7bbcdd6964c47bdaae26decade4a933';

    const response = await fetch(`${heygen_API.serverUrl}/v1/streaming.new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': heygen_API.apiKey,
      },
      body: JSON.stringify({
        quality: 'high',
        avatar_name: avatar,
        voice: {
          voice_id: voice,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      sessionInfo = data.data;
      res.json(sessionInfo);
    } else {
      res.status(500).send('Error creating new session');
    }
  } catch (error) {
    console.error('Error creating new session:', error);
    res.status(500).send('Error processing your request');
  }
});

// New endpoint to handle Heygen task
app.post('/heygen/task', async (req, res) => {
  try {
    const { text } = req.body;
    if (!sessionInfo || !sessionInfo.session_id) {
      res.status(500).send('Session not initialized');
      return;
    }

    const response = await fetch(`${heygen_API.serverUrl}/v1/streaming.task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': heygen_API.apiKey,
      },
      body: JSON.stringify({ session_id: sessionInfo.session_id, text }),
    });

    if (response.ok) {
      res.json({ message: 'Task sent to Heygen successfully' });
    } else {
      res.status(500).send('Error sending task to Heygen');
    }
  } catch (error) {
    console.error('Error sending task to Heygen:', error);
    res.status(500).send('Error processing your request');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
