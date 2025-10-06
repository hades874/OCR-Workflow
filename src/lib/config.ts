// @ts-nocheck
// This approach is heavily inspired by https://env.t3.gg/
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_N8N_WEBSOCKET_URL: z.string().url(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsedEnv.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment variables.");
}

export const env = parsedEnv.data;
