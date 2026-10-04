import "server-only";
import { MongoClient, type Collection, type Db, type ObjectId } from "mongodb";
import type { MessageStatus } from "@/types/message";

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("The database is not configured. Set MONGODB_URI (see .env.example).");
    this.name = "DatabaseNotConfiguredError";
  }
}

export interface MessageDoc {
  _id: ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUserDoc {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  /** Bump to invalidate every existing admin session. */
  sessionVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RateLimitDoc {
  _id: string;
  count: number;
  expiresAt: Date;
}

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new DatabaseNotConfiguredError();
  // Cache on globalThis so dev hot-reloads and serverless warm starts reuse one pool.
  if (!globalThis.__mongoClientPromise) {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 10 });
    globalThis.__mongoClientPromise = client.connect().catch((error: unknown) => {
      globalThis.__mongoClientPromise = undefined; // allow retry on the next request
      throw error;
    });
  }
  return globalThis.__mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB || "sanjeev_portfolio");
}

export async function messagesCollection(): Promise<Collection<MessageDoc>> {
  return (await getDb()).collection<MessageDoc>("contact_messages");
}
export async function adminUsersCollection(): Promise<Collection<AdminUserDoc>> {
  return (await getDb()).collection<AdminUserDoc>("admin_users");
}
export async function rateLimitsCollection(): Promise<Collection<RateLimitDoc>> {
  return (await getDb()).collection<RateLimitDoc>("rate_limits");
}
