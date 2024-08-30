import fastify from "fastify";
import pino from "pino";
import { Post } from "./lib/schemas/post.schema";
import { connectToDatabase } from "./lib/db";
import { generateGPTResponse } from "./lib/gpt";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: false, translateTime: false, ignore: "pid,hostname" },
  },
});
const server = fastify({ logger });

server.get("/", async (request, reply) => {
  return reply.send("hello world");
});

server.post("/posts/add", async (request, reply) => {
  try {
    logger.info("Received request to add a new post");
    const { title, content, hashtags } = request.body as {
      title: string;
      content: string;
      hashtags: string[];
    };

    logger.debug({ title, content, hashtags }, "Parsed request body");

    logger.info("Creating new Post instance");

    const newPost = new Post({
      title,
      content,
      hashtags,
      postDate: new Date(),
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
    const { prompt } = request.body as { prompt: string };

    logger.debug({ prompt }, "Parsed request body");

    logger.info("Generating content using GPT");
    const generatedContent = await generateGPTResponse(prompt);

    logger.info("Creating new Post instance");
    const newPost = new Post({
      title: prompt.substring(0, 50),
      content: generatedContent,
      hashtags: [],
      postDate: new Date(),
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
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
