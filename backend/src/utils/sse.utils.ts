/**
 * Server-Sent Events (SSE) utilities
 */

import type { Response } from "express";
import type { SSEData } from "../types/sse.types";

/**
 * Sets headers for Server-Sent Events streaming
 */
export const setStreamingHeaders = (res: Response): void => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
};

/**
 * Sends a data chunk via SSE
 */
export const sendSSEChunk = (res: Response, data: Partial<SSEData>): void => {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
  if (res.flush) res.flush(); // Force immediate send
};

/**
 * Sends an error event and closes the stream
 */
export const sendSSEError = (res: Response, error: Error): void => {
  sendSSEChunk(res, { error: error.message, done: true });
  res.end();
};
