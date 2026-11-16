import { assertSameOrigin, clientKey, fail, handle, ok, readJson } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import { isGateUnlocked, lockGate, unlockGate } from "@/lib/gate";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const gateSchema = z.object({
  passcode: z.string().min(1, "Passcode is required"),
});

export async function GET() {
  return handle(async () => {
    const unlocked = await isGateUnlocked();
    return ok({ unlocked });
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    assertSameOrigin(request);
    const body = await readJson(request);
    const parsed = gateSchema.safeParse(body);
    if (!parsed.success) {
      return fail(400, "invalid_input", "Passcode is required.");
    }

    if (process.env.MONGODB_URI) {
      await enforceRateLimit(clientKey(request, "admin-gate"), 10, 15 * 60);
    }

    const success = await unlockGate(parsed.data.passcode);
    if (!success) {
      return fail(401, "invalid_passcode", "Incorrect administrator passcode. Access denied.");
    }

    return ok({ unlocked: true });
  });
}

export async function DELETE() {
  return handle(async () => {
    await lockGate();
    return ok({ locked: true });
  });
}
