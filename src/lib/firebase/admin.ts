import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY);
const storageBucket =
  process.env.FIREBASE_STORAGE_BUCKET ||
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  (projectId ? `${projectId}.firebasestorage.app` : undefined);

function hasAdminConfig() {
  return Boolean(projectId && clientEmail && privateKey);
}

export const firebaseAdminConfigured = hasAdminConfig();

let adminApp: App | null = null;

export function getAdminApp() {
  if (!firebaseAdminConfigured) {
    return null;
  }

  if (adminApp) {
    return adminApp;
  }

  adminApp =
    getApps()[0] ||
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket,
    });

  return adminApp;
}

export function getAdminDb(): Firestore | null {
  const app = getAdminApp();

  return app ? getFirestore(app) : null;
}

export function getAdminAuth(): Auth | null {
  const app = getAdminApp();

  return app ? getAuth(app) : null;
}

export function getAdminStorage(): Storage | null {
  const app = getAdminApp();

  return app ? getStorage(app) : null;
}

export function getFirebaseAdminConfigStatus() {
  return {
    hasProjectId: Boolean(projectId),
    hasClientEmail: Boolean(clientEmail),
    hasPrivateKey: Boolean(privateKey),
    hasStorageBucket: Boolean(storageBucket),
    privateKeyLooksValid:
      Boolean(privateKey?.includes("-----BEGIN PRIVATE KEY-----")) &&
      Boolean(privateKey?.includes("-----END PRIVATE KEY-----")),
  };
}

function normalizePrivateKey(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  let key = value.trim();

  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  return key.replace(/\\\\n/g, "\n").replace(/\\n/g, "\n");
}
