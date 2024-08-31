import { BskyAgent } from "@atproto/api";

const initializeAgent = async () => {
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
  const agent = await initializeAgent();
  try {
    const response = await agent.api.com.atproto.repo.createRecord({
      collection: "app.bsky.feed.post",
      repo: "duca.dev",
      record: {
        text: content,
        createdAt: new Date().toISOString(),
      },
    });

    if (response.success) {
      console.log("Post successfully sent to Bluesky");
    } else {
      console.error("Failed to send post to Bluesky", response);
    }
  } catch (error) {
    console.error("Error occurred while sending post to Bluesky", error);
  }
};
