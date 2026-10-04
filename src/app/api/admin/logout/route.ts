import { assertSameOrigin, handle, ok } from "@/lib/api";
import { destroySession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handle(async () => {
    assertSameOrigin(request);
    await destroySession();
    return ok({});
  });
}
