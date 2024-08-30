import { TwitterApi } from "twitter-api-v2";
import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: false, translateTime: false, ignore: "pid,hostname" },
  },
});

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY ?? "",
  appSecret: process.env.TWITTER_API_SECRET ?? "",
  accessSecret: process.env.TWITTER_ACCESS_TOKEN ?? "",
  accessToken: process.env.TWITTER_ACCESS_SECRET ?? "",
});

export async function sendTweet(content: string): Promise<void> {
  try {
    logger.info("Attempting to send tweet");
    await client.v2.tweet(content);
    logger.info("Tweet sent successfully");
  } catch (error) {
    logger.error({ error }, "Error sending tweet");
    throw error;
  }
}
