import { Schema, model } from "mongoose";

const codeVerifierSchema = new Schema({
  codeVerifier: { type: String, required: true },
  state: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // expires in 10 minutes
});

export const CodeVerifier = model("CodeVerifier", codeVerifierSchema);
