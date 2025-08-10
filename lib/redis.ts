import { Redis } from "@upstash/redis";

const { REDIS_URL, REDIS_TOKEN } = process.env;
if (!REDIS_URL || !REDIS_TOKEN) {
  throw new Error(
    "REDIS_URL or REDIS_TOKEN environment variable is not defined",
  );
}

if (!REDIS_URL || !REDIS_TOKEN) {
  console.warn(
    "REDIS_URL or REDIS_TOKEN environment variable is not defined, please add to enable background notifications and webhooks.",
  );
}

export const redis =
  process.env.REDIS_URL && process.env.REDIS_TOKEN
    ? new Redis({
        url: process.env.REDIS_URL,
        token: process.env.REDIS_TOKEN,
      })
    : null;
