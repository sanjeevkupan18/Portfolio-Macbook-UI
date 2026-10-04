// Usage: npm run admin:hash -- "your-password"
// Prints a base64-encoded bcrypt hash that is safe to paste into .env files and
// hosting dashboards (raw bcrypt hashes contain "$" which dotenv-expand mangles).
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error('Usage: npm run admin:hash -- "a-strong-password-of-10+-chars"');
  process.exit(1);
}
const hash = await bcrypt.hash(password, 12);
console.log("\nADMIN_PASSWORD_HASH=" + Buffer.from(hash, "utf8").toString("base64") + "\n");
