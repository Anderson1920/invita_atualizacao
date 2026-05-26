import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

function hasAdminConfig() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_STORAGE_BUCKET,
  );
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
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
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
