import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SECRET =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.GOOGLE_CLIENT_SECRET ||
  "aasare_secure_key_2026_counselling";

function getDerivedKey(): Buffer {
  return crypto.scryptSync(SECRET, "aasare_salt_v1", 32);
}

export function encryptPayload(data: Record<string, unknown>): string {
  const key = getDerivedKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const jsonStr = JSON.stringify(data);
  let encrypted = cipher.update(jsonStr, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decryptPayload(encryptedStr: string): Record<string, unknown> | null {
  try {
    const parts = encryptedStr.split(":");
    if (parts.length !== 3) return null;

    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getDerivedKey();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  } catch (err) {
    console.error("[Decryption Error] Failed to decrypt payload:", err);
    return null;
  }
}
