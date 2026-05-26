import crypto from "node:crypto";

const encoder = new TextEncoder();

export function createGuestToken(eventId: string, guestId: string) {
  const nonce = crypto.randomBytes(18).toString("base64url");
  const issuedAt = Date.now().toString(36);
  const payload = `${eventId}.${guestId}.${issuedAt}.${nonce}`;
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

export function signPayload(payload: string) {
  const secret = process.env.QR_TOKEN_SECRET;

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("QR_TOKEN_SECRET precisa estar configurado em producao.");
  }

  return crypto.createHmac("sha256", secret || "invita-local-development-secret").update(payload).digest("base64url");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function verifyGuestToken(token: string) {
  const parts = token.split(".");

  if (parts.length < 5) {
    return { valid: false as const };
  }

  const signature = parts.at(-1);
  const payload = parts.slice(0, -1).join(".");
  const expected = signPayload(payload);

  if (!signature || !timingSafeEqual(signature, expected)) {
    return { valid: false as const };
  }

  const [eventId, guestId, issuedAt, nonce] = parts;

  return {
    valid: true as const,
    eventId,
    guestId,
    issuedAt,
    nonce,
    hash: hashToken(token),
  };
}

function timingSafeEqual(a: string, b: string) {
  const left = encoder.encode(a);
  const right = encoder.encode(b);

  if (left.byteLength !== right.byteLength) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}
