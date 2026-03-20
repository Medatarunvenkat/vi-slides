import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();
const SYSTEM_PROMPT = "You are a helpful teaching assistant.";

export async function askAI(question: string): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;

  const stripMarkdown = (text: string) => {
    return text.replace(/\*\*/g, "").replace(/#/g, "").trim();
  };

  //GROQ
  if (groqKey) {
    try {
      const groq = new Groq({ apiKey: groqKey });
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `A student asked: "${question}"` }
        ],
        max_tokens: 300
      });

      const answer = completion.choices[0].message.content;
      if (answer) return stripMarkdown(answer);
    } catch (error: any) {
      console.error("Groq error:", error.message);
    }
  }
  return "Error: No AI API keys found in .env.";
}
