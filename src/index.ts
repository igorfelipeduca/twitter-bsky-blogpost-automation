import fastify from "fastify";
import pino from "pino";
import { Post } from "./lib/schemas/post.schema";
import { connectToDatabase } from "./lib/db";
import { generateGPTResponse } from "./lib/gpt";
import { sendTweet, initializeTwitterClient } from "./lib/twitter";
import { ApiResponseError, TwitterApi } from "twitter-api-v2";
import fastifySession from "@fastify/session";
import fastifyCookie from "@fastify/cookie";
import crypto from "crypto";
import { FastifyRequest } from "fastify";
import { CodeVerifier } from "./lib/schemas/code-verifier.schema";

declare module "fastify" {
  interface Session {
    codeVerifier?: string;
    state?: string;
    accessToken?: string;
    refreshToken?: string;
    set(key: string, value: any): void;
    [key: string]: any;
  }
}

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: false, translateTime: false, ignore: "pid,hostname" },
  },
});
const server = fastify({ logger });

server.register(fastifyCookie);
server.register(fastifySession, {
  secret: crypto.randomBytes(32).toString("hex"),
  cookie: { secure: false },
});

const client = new TwitterApi({
  clientId: process.env.TWITTER_OAUTH_CLIENT_KEY ?? "",
  clientSecret: process.env.TWITTER_OAUTH_CLIENT_SECRET ?? "",
});

server.get("/", async (request, reply) => {
  return reply.send("hello world");
});

server.post("/posts/add", async (request, reply) => {
  try {
    logger.info("Received request to add a new post");
    const { title, content, hashtags, postDate } = request.body as {
      title: string;
      content: string;
      hashtags: string[];
      postDate?: string;
    };

    logger.debug({ title, content, hashtags, postDate }, "Parsed request body");

    logger.info("Creating new Post instance");

    const newPost = new Post({
      title,
      content,
      hashtags,
      postDate: postDate ? new Date(postDate) : new Date(),
      isPosted: false,
    });

    logger.info("Attempting to save new post to database");

    const savedPost = await newPost.save();

    logger.info({ postId: savedPost._id }, "Post saved successfully");

    reply
      .code(201)
      .send({ message: "Post created successfully", post: savedPost });
    logger.info({ postId: savedPost._id }, "Response sent to client");
  } catch (error) {
    logger.error(error, "Error occurred while creating the post");
    reply.code(500).send({
      error: "An error occurred while creating the post",
      details: error as any,
    });
  }
});

server.post("/posts/create", async (request, reply) => {
  try {
    logger.info("Received request to create a new post using GPT");
    const { prompt, postDate } = request.body as {
      prompt: string;
      postDate?: string;
    };

    logger.debug({ prompt, postDate }, "Parsed request body");

    logger.info("Generating content using GPT");
    const generatedContent = await generateGPTResponse(prompt);

    logger.info("Creating new Post instance");
    const newPost = new Post({
      title: prompt.substring(0, 50),
      content: generatedContent,
      hashtags: [],
      postDate: postDate ? new Date(postDate) : new Date(),
      isPosted: false,
    });

    logger.info("Attempting to save new post to database");
    const savedPost = await newPost.save();

    logger.info({ postId: savedPost._id }, "Post saved successfully");

    reply
      .code(201)
      .send({ message: "Post created successfully", post: savedPost });

    logger.info({ postId: savedPost._id }, "Response sent to client");
  } catch (error) {
    logger.error(error, "Error occurred while creating the post");
    reply.code(500).send({
      error: "An error occurred while creating the post",
      details: error as any,
    });
  }
});

server.put("/posts/:id", async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    logger.info({ postId: id }, "Received request to edit a post");

    const { title, content, hashtags, postDate } = request.body as {
      title?: string;
      content?: string;
      hashtags?: string[];
      postDate?: string;
    };

    logger.debug({ title, content, hashtags, postDate }, "Parsed request body");

    const post = await Post.findById(id);

    if (!post) {
      logger.warn({ postId: id }, "Post not found");
      reply.code(404).send({ error: "Post not found" });
      return;
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (hashtags) post.hashtags = hashtags;
    if (postDate) post.postDate = new Date(postDate);

    logger.info("Attempting to save updated post to database");
    const updatedPost = await post.save();

    logger.info({ postId: updatedPost._id }, "Post updated successfully");

    reply
      .code(200)
      .send({ message: "Post updated successfully", post: updatedPost });

    logger.info({ postId: updatedPost._id }, "Response sent to client");
  } catch (error) {
    logger.error(error, "Error occurred while updating the post");
    reply.code(500).send({
      error: "An error occurred while updating the post",
      details: error as any,
    });
  }
});

server.post("/posts/:id/tweet", async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    logger.info({ postId: id }, "Received request to post to Twitter");

    const post = await Post.findById(id);
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;

    if (!post) {
      logger.warn({ postId: id }, "Post not found");
      reply.code(404).send({ error: "Post not found" });
      return;
    }

    if (!accessToken) {
      logger.error("No access token found in session");
      reply.code(401).send({ error: "Unauthorized" });
      return;
    }

    initializeTwitterClient();

    const tweet = `${post.title}\n\n${
      post.content?.substring(0, 240) ?? ""
    }...`;

    await sendTweet(tweet);

    post.isPosted = true;
    await post.save();

    logger.info({ postId: id }, "Updated post isPosted status to true");

    reply.code(200).send({ message: "Successfully posted to Twitter" });

    logger.info(
      { postId: id },
      "Successfully posted to Twitter and response sent to client"
    );
  } catch (error) {
    logger.error(error, "Error occurred while posting to Twitter");
    reply.code(500).send({
      error: "An error occurred while posting to Twitter",
      details: error as any,
    });
  }
});

server.get("/auth/twitter", async (request, reply) => {
  try {
    const { url, codeVerifier, state } = await client.generateOAuth2AuthLink(
      process.env.TWITTER_OAUTH_CALLBACK_URL ?? "",
      { scope: ["tweet.read", "tweet.write", "users.read"] }
    );

    await new CodeVerifier({ codeVerifier, state }).save();

    reply.redirect(url);
  } catch (error) {
    logger.error(error, "Error initiating Twitter OAuth flow");
    reply.code(500).send({
      error: "An error occurred while initiating Twitter login",
      details: error as any,
    });
  }
});

server.get("/callback", async (request: FastifyRequest, reply) => {
  try {
    const { state, code } = request.query as { state?: string; code?: string };

    logger.info({ state, code }, "Received callback parameters");

    if (!state || !code) {
      reply.code(400).send({ error: "Missing state or code" });
      return;
    }

    const codeVerifierDoc = await CodeVerifier.findOne({ state });

    if (!codeVerifierDoc) {
      reply.code(400).send({ error: "Invalid state" });
      return;
    }

    const { codeVerifier } = codeVerifierDoc;

    const { accessToken, refreshToken } = await client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: process.env.TWITTER_OAUTH_CALLBACK_URL ?? "",
    });

    request.session.accessToken = accessToken;
    request.session.refreshToken = refreshToken;

    reply.code(200).send({ accessToken, refreshToken });
  } catch (error) {
    logger.error(error, "Error completing Twitter OAuth flow");
    if (error instanceof ApiResponseError && error.code === 400) {
      reply.code(400).send({
        error: "Invalid request",
        details: "The authorization code or other parameters were invalid.",
      });
    } else {
      reply.code(500).send({
        error: "An error occurred during authentication",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
});

server.get("/posts", async (request, reply) => {
  const posts = await Post.find().sort({ postDate: -1 }).limit(10);

  reply.send(posts);
});

const start = async () => {
  try {
    await connectToDatabase();

    const port = Number(process.env.PORT) || 8000;
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`Server listening on http://localhost:${port}`);

    const checkAndPostTweets = async () => {
      try {
        const now = new Date();
        const posts = await Post.find({
          isPosted: false,
          postDate: { $lt: now },
        });

        for (const post of posts) {
          const accessToken = process.env.TWITTER_ACCESS_TOKEN;
          if (!accessToken) {
            logger.error("No access token found for automatic tweeting");
            continue;
          }

          initializeTwitterClient();

          const tweet = `${post.title}\n\n${
            post.content?.substring(0, 240) ?? ""
          }...`;

          try {
            await sendTweet(tweet);

            post.isPosted = true;
            await post.save();

            logger.info(
              { postId: post._id },
              "Automatically posted to Twitter"
            );
          } catch (error) {
            if (error instanceof ApiResponseError && error.code === 403) {
              logger.error(
                "Authentication error when posting tweet. User may need to re-authenticate."
              );
            } else {
              logger.error(error, "Error occurred while posting tweet");
            }
          }
        }
      } catch (error) {
        logger.error(error, "Error occurred during automatic post checking");
      } finally {
        setTimeout(checkAndPostTweets, 5 * 60 * 1000);
      }
    };

    checkAndPostTweets();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
