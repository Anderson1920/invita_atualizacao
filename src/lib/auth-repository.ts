import { getAdminDb } from "@/lib/firebase/admin";
import { collections } from "@/lib/firebase/collections";
import { demoUsers } from "@/lib/demo-data";
import { hashPassword, verifyPassword } from "@/lib/session";
import type { UserProfile, UserRole } from "@/lib/types";

interface StoredUser extends UserProfile {
  emailLower: string;
  passwordHash?: string;
}

export function publicUser(user: StoredUser | UserProfile): UserProfile {
  const profile = { ...(user as StoredUser) } as Partial<StoredUser>;

  delete profile.passwordHash;
  delete profile.emailLower;

  return profile as UserProfile;
}

export async function createBackendUser(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  const db = getAdminDb();
  const now = new Date().toISOString();
  const emailLower = input.email.trim().toLowerCase();

  if (!db) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Firebase Admin precisa estar configurado para autenticacao em producao.");
    }

    return publicUser({
      id: `${input.role.toLowerCase()}-${Date.now()}`,
      name: input.name,
      email: input.email,
      emailLower,
      role: input.role,
      status: "active",
      createdAt: now,
      passwordHash: await hashPassword(input.password),
    });
  }

  const existing = await db.collection(collections.users).where("emailLower", "==", emailLower).limit(1).get();

  if (!existing.empty) {
    throw new Error("Este email ja esta cadastrado.");
  }

  const ref = db.collection(collections.users).doc();
  const user: StoredUser = {
    id: ref.id,
    name: input.name,
    email: input.email,
    emailLower,
    role: input.role,
    status: "active",
    createdAt: now,
    passwordHash: await hashPassword(input.password),
  };

  await ref.set(user);

  return publicUser(user);
}

export async function authenticateBackendUser(input: {
  email: string;
  password: string;
  role?: UserRole;
}) {
  const db = getAdminDb();
  const emailLower = input.email.trim().toLowerCase();

  if (!db) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Firebase Admin precisa estar configurado para autenticacao em producao.");
    }

    const demo =
      demoUsers.find((user) => user.email.toLowerCase() === emailLower) ||
      demoUsers.find((user) => user.role === input.role) ||
      demoUsers[1];

    return demo.status === "active" ? demo : null;
  }

  const snapshot = await db.collection(collections.users).where("emailLower", "==", emailLower).limit(1).get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const user = { id: doc.id, ...doc.data() } as StoredUser;

  if (user.status !== "active" || !(await verifyPassword(input.password, user.passwordHash))) {
    return null;
  }

  return publicUser(user);
}
