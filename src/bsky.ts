import { BskyAgent } from "@atproto/api";
import { createBskyThread } from "./lib/bsky-thread";

export const initializeBskyAgent = async () => {
  const agent = new BskyAgent({
    service: "https://bsky.social",
  });

  await agent.login({
    identifier: process.env.BSKY_HANDLE ?? "",
    password: process.env.BSKY_PASSWORD ?? "",
  });

  return agent;
};

export const sendBlueskyPost = async (content: string) => {
  const agent = await initializeBskyAgent();
  try {
    const response = await agent.api.com.atproto.repo.createRecord({
      collection: "app.bsky.feed.post",
      repo: "duca.dev",
      record: {
        text: content,
        createdAt: new Date().toISOString(),
      },
    });

    console.log({ response });

    if (response.success) {
      console.log("Post successfully sent to Bluesky");
    } else {
      console.error("Failed to send post to Bluesky", response);
    }
  } catch (error) {
    const errorMessage = (error as Error).message;
    throw new Error(errorMessage);
  }
};

export async function postBskyThread(text: string, bskyClient: BskyAgent) {
  const threadParts = createBskyThread(text);
  let rootPostUri: string | null = null;
  let rootPostCid: string | null = null;
  let previousPostUri: string | null = null;
  let previousPostCid: string | null = null;

  for (const [index, part] of threadParts.entries()) {
    console.log(`Posting part ${index + 1}/${threadParts.length}: "${part}"`);

    const record: {
      text: string;
      reply?: {
        root: { uri: string; cid: string };
        parent: { uri: string; cid: string };
      };
    } = {
      text: part,
    };

    if (rootPostUri && rootPostCid && previousPostUri && previousPostCid) {
      record.reply = {
        root: { uri: rootPostUri, cid: rootPostCid },
        parent: { uri: previousPostUri, cid: previousPostCid },
      };
      console.log(`Replying to parent post: ${previousPostUri}`);
    } else if (rootPostUri && rootPostCid) {
      // For the first reply, the parent is also the root
      record.reply = {
        root: { uri: rootPostUri, cid: rootPostCid },
        parent: { uri: rootPostUri, cid: rootPostCid },
      };
      console.log(`Replying to root post: ${rootPostUri}`);
    } else {
      console.log("This is the first post in the thread.");
    }

    console.log("Record being sent:", JSON.stringify(record, null, 2));

    const response = await bskyClient.api.com.atproto.repo.createRecord({
      collection: "app.bsky.feed.post",
      repo: "duca.dev",
      record: {
        text: record.text,
        reply: record.reply,
        createdAt: new Date().toISOString(),
      },
    });

    console.log("Response received:", response);

    const isResponseSuccessful = response.success && response.data;

    if (isResponseSuccessful) {
      const { uri, cid } = response.data;

      console.log(`Post created successfully with URI: ${uri}`);

      if (!rootPostUri || !rootPostCid) {
        rootPostUri = uri;
        rootPostCid = cid;
        console.log(`Root post set to URI: ${rootPostUri}`);
      }

      previousPostUri = uri;
      previousPostCid = cid;
    } else {
      console.error("Failed to create post in the thread", response);
      break;
    }
  }

  console.log("Thread posting complete.");
}
