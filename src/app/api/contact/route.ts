import { ObjectId } from "mongodb";
import { assertSameOrigin, clientKey, handle, ok, readJson } from "@/lib/api";
import { messagesCollection } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Stores a contact message in MongoDB. No email is sent (by design). */
export async function POST(request: Request) {
  return handle(async () => {
    assertSameOrigin(request);
    const body = await readJson(request);

    // Honeypot: bots fill the hidden field. Pretend success and store nothing.
    if (typeof body === "object" && body !== null && "company" in body && String((body as { company: unknown }).company ?? "").length > 0) {
      return ok({ id: "ok" }, 201);
    }

    const data = contactSchema.parse(body);
    await enforceRateLimit(clientKey(request, "contact"), 5, 10 * 60);

    const now = new Date();
    const result = await (await messagesCollection()).insertOne({
      _id: new ObjectId(),
      name: data.name,
      email: data.email.toLowerCase(),
      subject: data.subject,
      message: data.message,
      status: "unread",
      createdAt: now,
      updatedAt: now,
    });
    return ok({ id: result.insertedId.toHexString() }, 201);
  });
}
