import { ObjectId } from "mongodb";
import { assertSameOrigin, fail, handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { messagesCollection } from "@/lib/db";
import { getStats, toDTO } from "@/lib/messages";
import { messageStatusSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  return handle(async () => {
    assertSameOrigin(request);
    await requireAdmin();
    const { id } = await params;
    if (!ObjectId.isValid(id)) return fail(400, "bad_id", "Invalid message id.");
    const { status } = messageStatusSchema.parse(await readJson(request));
    const doc = await (await messagesCollection()).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: "after" },
    );
    if (!doc) return fail(404, "not_found", "Message not found.");
    return ok({ message: toDTO(doc), stats: await getStats() });
  });
}

export async function DELETE(request: Request, { params }: Ctx) {
  return handle(async () => {
    assertSameOrigin(request);
    await requireAdmin();
    const { id } = await params;
    if (!ObjectId.isValid(id)) return fail(400, "bad_id", "Invalid message id.");
    const res = await (await messagesCollection()).deleteOne({ _id: new ObjectId(id) });
    if (res.deletedCount === 0) return fail(404, "not_found", "Message not found.");
    return ok({ id, stats: await getStats() });
  });
}
