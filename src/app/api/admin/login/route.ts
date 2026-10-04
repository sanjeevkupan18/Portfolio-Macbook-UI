import { assertSameOrigin, clientKey, fail, handle, ok, readJson } from "@/lib/api";
import { createSession, verifyCredentials } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { adminLoginSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handle(async () => {
    assertSameOrigin(request);
    const { email, password } = adminLoginSchema.parse(await readJson(request));
    await enforceRateLimit(clientKey(request, "admin-login"), 8, 15 * 60);
    const admin = await verifyCredentials(email, password);
    // One generic message for unknown email and wrong password.
    if (!admin) return fail(401, "invalid_credentials", "Incorrect email or password.");
    await createSession(admin);
    return ok({ email: admin.email });
  });
}
