// model-worker.js
import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

// Create the handler that will process all incoming messages
const handler = new WebWorkerMLCEngineHandler();

// Set up the message receiver
self.onmessage = (msg) => {
  handler.onmessage(msg);
};