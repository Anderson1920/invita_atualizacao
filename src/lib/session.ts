import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import type { UserProfile, UserRole } from "@/lib/types";

export const sessionCookieName = "invita_session";

const sessionTtlSeconds = 60 * 60 * 24 * 7;
const hashKeylen = 64;

interface SessionPayload {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "blocked";
  iat: number;
  exp: number;
}

export function createSessionToken(user: UserProfile) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    iat: now,
    exp: now + sessionTtlSeconds,
  };
  const encodedPayload = base64url(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature || !timingSafeEqual(signature, sign(encodedPayload))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SessionPayload;

    if (!payload.sub || !payload.email || !payload.role || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(request: NextRequest) {
  return verifySessionToken(request.cookies.get(sessionCookieName)?.value);
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(sessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionTtlSeconds,
  });

  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const hash = await scrypt(password, salt);

  return `scrypt$${salt}$${hash}`;
}

export async function verifyPassword(password: string, storedHash: string | undefined) {
  if (!storedHash) {
    return false;
  }

  const [algorithm, salt, hash] = storedHash.split("$");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const candidate = await scrypt(password, salt);

  return timingSafeEqual(candidate, hash);
}

function scrypt(password: string, salt: string) {
  return new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, hashKeylen, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey.toString("base64url"));
    });
  });
}

function sign(value: string) {
  const secret = process.env.AUTH_SESSION_SECRET;

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SESSION_SECRET precisa estar configurado em producao.");
  }

  return crypto
    .createHmac("sha256", secret || "invita-local-session-secret")
    .update(value)
    .digest("base64url");
}

function base64url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function timingSafeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.byteLength !== right.byteLength) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}
