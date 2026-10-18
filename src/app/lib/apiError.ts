import axios from "axios";

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    const message = error.response?.data?.error;
    if (typeof message === "string" && message.trim()) return message;
  }

  return fallback;
}
