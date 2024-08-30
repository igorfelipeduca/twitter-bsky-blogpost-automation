import OpenAI from "openai";
import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: false, translateTime: false, ignore: "pid,hostname" },
  },
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateGPTResponse(prompt: string): Promise<string> {
  try {
    logger.info("Generating GPT-4 response");
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    });

    if (response.choices && response.choices.length > 0) {
      const generatedText = response.choices[0].message.content?.trim() || "";
      logger.info("GPT-4 response generated successfully");
      return generatedText;
    } else {
      throw new Error("No response generated");
    }
  } catch (error) {
    logger.error({ error }, "Error generating GPT-4 response");
    throw error;
  }
}
