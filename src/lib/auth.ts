import "server-only";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { HttpError } from "@/lib/api";
import { adminUsersCollection } from "@/lib/db";

export const SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours
// Compared against when the email is unknown so response time doesn't reveal valid accounts.
const DUMMY_HASH = "$2b$12$eRaCRwEoNMgf0wL0..GVYuCThCDET2sUgnXLPue0yQjLk8rx5b0ra";

export interface AdminIdentity { id: string; email: string }

function secretKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new HttpError(503, "admin_not_configured", "Admin is not configured: set ADMIN_SESSION_SECRET (32+ characters).");
  }
  return new TextEncoder().encode(secret);
}

/** Returns the admin when credentials are valid, otherwise null. */
export async function verifyCredentials(email: string, password: string): Promise<AdminIdentity & { sessionVersion: number } | null> {
  const admins = await adminUsersCollection();
  const admin = await admins.findOne({ email: email.toLowerCase() });
  const valid = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !valid) return null;
  return { id: admin._id.toHexString(), email: admin.email, sessionVersion: admin.sessionVersion };
}

export async function createSession(admin: AdminIdentity & { sessionVersion: number }): Promise<void> {
  const token = await new SignJWT({ email: admin.email, v: admin.sessionVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(admin.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
}

/** Validates the signed cookie AND that the admin still exists with the same session version. */
export async function getAdmin(): Promise<AdminIdentity | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (!payload.sub || !ObjectId.isValid(payload.sub)) return null;
    const admin = await (await adminUsersCollection()).findOne({ _id: new ObjectId(payload.sub) });
    if (!admin || admin.sessionVersion !== payload.v) return null;
    return { id: admin._id.toHexString(), email: admin.email };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    return null; // bad / expired signature
  }
}

export async function requireAdmin(): Promise<AdminIdentity> {
  const admin = await getAdmin();
  if (!admin) throw new HttpError(401, "unauthorized", "Please sign in to continue.");
  return admin;
}
