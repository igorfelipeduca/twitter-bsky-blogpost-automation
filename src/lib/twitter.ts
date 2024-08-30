import { TwitterApi } from "twitter-api-v2";
import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: false, translateTime: false, ignore: "pid,hostname" },
  },
});

let client: TwitterApi;

export function initializeTwitterClient() {
  client = new TwitterApi(process.env.TWITTER_ACCESS_TOKEN ?? "");
}

export async function sendTweet(content: string): Promise<void> {
  try {
    logger.info("Attempting to send tweet");
    await client.v2.tweet(content);
    logger.info("Tweet sent successfully");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === 401) {
      logger.error(
        { error },
        "Unauthorized: Twitter API credentials may be invalid"
      );
      throw new Error("Unauthorized: Twitter API credentials may be invalid");
    } else {
      logger.error({ error }, "Error sending tweet");
      throw error;
    }
  }
}
