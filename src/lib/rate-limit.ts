import "server-only";
import { HttpError } from "@/lib/api";
import { rateLimitsCollection } from "@/lib/db";

/**
 * Fixed-window rate limiter backed by MongoDB (works across serverless instances).
 * The window logic lives in the update itself, so correctness does not depend on the TTL index
 * (the TTL index created by `npm run db:migrate` only cleans up old documents).
 */
export async function enforceRateLimit(key: string, limit: number, windowSeconds: number): Promise<void> {
  const col = await rateLimitsCollection();
  const now = new Date();
  const next = new Date(now.getTime() + windowSeconds * 1000);
  const live = { $gt: [{ $ifNull: ["$expiresAt", new Date(0)] }, now] };
  const doc = await col.findOneAndUpdate(
    { _id: key },
    [
      {
        $set: {
          count: { $cond: [live, { $add: [{ $ifNull: ["$count", 0] }, 1] }, 1] },
          expiresAt: { $cond: [live, "$expiresAt", next] },
        },
      },
    ],
    { upsert: true, returnDocument: "after" },
  );
  if (doc && doc.count > limit) {
    const retry = Math.max(1, Math.ceil((doc.expiresAt.getTime() - now.getTime()) / 1000));
    throw new HttpError(429, "rate_limited", `Too many attempts. Please try again in ${retry}s.`, undefined, { "Retry-After": String(retry) });
  }
}
