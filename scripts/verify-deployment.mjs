const required = [
  ["MONGODB_URI", process.env.MONGODB_URI],
  ["ADMIN_EMAIL", process.env.ADMIN_EMAIL],
  ["ADMIN_PASSWORD_HASH", process.env.ADMIN_PASSWORD_HASH],
  ["PORTFOLIO_UNLOCK_PASSWORD", process.env.PORTFOLIO_UNLOCK_PASSWORD],
];

const missing = required.filter(([, value]) => !value?.trim()).map(([name]) => name);
const secret = process.env.ADMIN_SESSION_SECRET?.trim();
if (!secret) missing.push("ADMIN_SESSION_SECRET");
if (secret && secret.length < 32) throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters.");

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
if (!siteUrl) missing.push("NEXT_PUBLIC_SITE_URL");
else {
  let parsed;
  try {
    parsed = new URL(siteUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid URL.");
  }
  if (parsed.protocol !== "https:") throw new Error("NEXT_PUBLIC_SITE_URL must use https in production.");
}

if (missing.length > 0) throw new Error(`Missing deployment environment variables: ${missing.join(", ")}`);
console.log("Deployment environment looks ready. Secret values were not printed.");
