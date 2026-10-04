import { handle, ok } from "@/lib/api";
import { getAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const admin = await getAdmin();
    return ok(admin ? { authenticated: true, email: admin.email } : { authenticated: false });
  });
}
