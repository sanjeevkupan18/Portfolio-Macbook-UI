import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const GATE_COOKIE = "admin_gate_pass";
const GATE_TTL_SECONDS = 60 * 60 * 4; // 4 hours

function expectedGatePassword(): string {
  return process.env.ADMIN_GATE_PASSWORD || "123456@Sanjeev";
}

function gateToken(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || "fallback_secret_portfolio_gate_2026";
  const expected = expectedGatePassword();
  return createHash("sha256").update(`${expected}:${secret}`).digest("hex");
}

export async function isGateUnlocked(): Promise<boolean> {
  const token = (await cookies()).get(GATE_COOKIE)?.value;
  if (!token) return false;
  const expected = gateToken();
  if (token.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function unlockGate(submittedPasscode: string): Promise<boolean> {
  const expected = expectedGatePassword();
  const subHash = createHash("sha256").update(submittedPasscode.trim()).digest();
  const expHash = createHash("sha256").update(expected.trim()).digest();

  const valid = timingSafeEqual(subHash, expHash);
  if (!valid) return false;

  (await cookies()).set(GATE_COOKIE, gateToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: GATE_TTL_SECONDS,
  });

  return true;
}

export async function lockGate(): Promise<void> {
  (await cookies()).set(GATE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}
