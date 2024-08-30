import mongoose from "mongoose";
import dotenv from "dotenv";
import pino from "pino";

dotenv.config();

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: false, translateTime: false, ignore: "pid,hostname" },
  },
});

const MONGODB_URL =
  process.env.MONGODB_URL || "mongodb://localhost:27017/mydatabase";

async function connectToDatabase() {
  try {
    logger.info(`Attempting to connect to MongoDB at ${MONGODB_URL}`);
    await mongoose.connect(MONGODB_URL);
    logger.info("Connected to MongoDB");

    mongoose.connection.on("connected", () => {
      logger.info("Mongoose connected to DB");
    });

    mongoose.connection.on("error", (err) => {
      logger.error({ err }, "Mongoose connection error");
    });

    mongoose.connection.on("disconnected", () => {
      logger.info("Mongoose disconnected");
    });
  } catch (error) {
    logger.error({ error }, "Error connecting to MongoDB");
    process.exit(1);
  }
}

export { connectToDatabase };
