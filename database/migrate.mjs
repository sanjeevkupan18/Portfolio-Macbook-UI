// Idempotent MongoDB "migration": creates collections (with JSON-schema validators), indexes,
// and seeds/updates the admin user from ADMIN_EMAIL + ADMIN_PASSWORD_HASH.
// Usage: npm run db:migrate   (reads .env / .env.local via --env-file-if-exists)
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}
const dbName = process.env.MONGODB_DB || "sanjeev_portfolio";

/** ADMIN_PASSWORD_HASH may be a raw bcrypt hash or (recommended) the base64 value printed by `npm run admin:hash`. */
function decodeHash(value) {
  if (!value) return null;
  const v = value.trim();
  const raw = v.startsWith("$2") ? v : Buffer.from(v, "base64").toString("utf8");
  return /^\$2[aby]\$\d{2}\$.{53}$/.test(raw) ? raw : null;
}

const validators = {
  contact_messages: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "message", "status", "createdAt", "updatedAt"],
      properties: {
        name: { bsonType: "string", maxLength: 100 },
        email: { bsonType: "string", maxLength: 254 },
        subject: { bsonType: "string", maxLength: 150 },
        message: { bsonType: "string", maxLength: 5000 },
        status: { enum: ["unread", "read", "archived"] },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  },
  admin_users: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "passwordHash", "sessionVersion", "createdAt", "updatedAt"],
      properties: {
        email: { bsonType: "string" },
        passwordHash: { bsonType: "string" },
        sessionVersion: { bsonType: "int" },
      },
    },
  },
};

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
try {
  await client.connect();
  const db = client.db(dbName);
  const existing = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name));

  for (const name of ["contact_messages", "admin_users", "rate_limits"]) {
    const validator = validators[name];
    if (!existing.has(name)) {
      await db.createCollection(name, validator ? { validator } : {});
      console.log(`+ created collection ${name}`);
    } else if (validator) {
      await db.command({ collMod: name, validator });
    }
  }

  await db.collection("contact_messages").createIndex({ createdAt: -1 });
  await db.collection("contact_messages").createIndex({ status: 1, createdAt: -1 });
  await db.collection("admin_users").createIndex({ email: 1 }, { unique: true });
  await db.collection("rate_limits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  console.log("✓ indexes ensured");

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const hash = decodeHash(process.env.ADMIN_PASSWORD_HASH);
  if (email && hash) {
    const admins = db.collection("admin_users");
    const current = await admins.findOne({ email });
    const now = new Date();
    if (!current) {
      await admins.insertOne({ email, passwordHash: hash, sessionVersion: 1, createdAt: now, updatedAt: now });
      console.log(`✓ admin user created: ${email}`);
    } else if (current.passwordHash !== hash) {
      // Changing the password invalidates existing sessions by bumping sessionVersion.
      await admins.updateOne({ email }, { $set: { passwordHash: hash, updatedAt: now }, $inc: { sessionVersion: 1 } });
      console.log(`✓ admin password updated (existing sessions signed out): ${email}`);
    } else {
      console.log(`✓ admin user already up to date: ${email}`);
    }
  } else {
    console.log("• Skipped admin seeding: set ADMIN_EMAIL and a valid ADMIN_PASSWORD_HASH (run `npm run admin:hash -- \"password\"`).");
  }
  console.log(`Done. Database: ${dbName}`);
} catch (error) {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.close();
}
