/**
 * Type definitions for Server-Sent Events (SSE)
 */

export interface SSEData {
  chunk?: string;
  done: boolean;
  fullResponse?: string;
  chat?:
    | {
        id: string;
        title: string;
      }
    | undefined;
  error?: string;
}
