import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai("gpt-3.5-turbo"),
    messages,
    system: "You are an interviewer conducting a job interview. Keep your responses professional and engaging. You will ask me a question and I will respond. First introduce yourself and ask me a question.",
  });

  for await (const part of result.textStream) {
    console.log(part);
  }

  return result.toAIStreamResponse();
}
