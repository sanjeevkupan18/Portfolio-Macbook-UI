import { timingSafeEqual, createHash } from "node:crypto";
import { enforceRateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, clientKey, fail, handle, ok, readJson } from "@/lib/api";
import { unlockSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const digest = (v: string) => createHash("sha256").update(v).digest();

/**
 * Lock-screen demo password check. This is a portfolio interaction, NOT real authentication:
 * it only decides whether the visitor sees the "desktop". The password stays server-side
 * (PORTFOLIO_UNLOCK_PASSWORD) and is never shipped in the client bundle.
 */
export async function POST(request: Request) {
  return handle(async () => {
    assertSameOrigin(request);
    const { password } = unlockSchema.parse(await readJson(request));
    // Rate-limit only when a database exists, so the lock screen still works without MongoDB.
    if (process.env.MONGODB_URI) await enforceRateLimit(clientKey(request, "unlock"), 20, 60);
    const expected = process.env.PORTFOLIO_UNLOCK_PASSWORD || "hello";
    const valid = timingSafeEqual(digest(password.trim().toLowerCase()), digest(expected.trim().toLowerCase()));
    return valid ? ok({ valid: true }) : fail(401, "invalid_password", "Incorrect password.");
  });
}
