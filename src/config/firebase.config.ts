/**
 * Firebase Admin SDK initialization for FCM (Firebase Cloud Messaging).
 */
import * as admin from 'firebase-admin';
import { Logger } from '@nestjs/common';

const logger = new Logger('FirebaseConfig');

export function initializeFirebase(): void {
  if (admin.apps.length > 0) {
    logger.log('Firebase Admin already initialized');
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const rawKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
  const privateKey = rawKey?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();

  if (!projectId || !privateKey || !clientEmail) {
    const missing = [
      !projectId && 'FIREBASE_PROJECT_ID',
      !privateKey && 'FIREBASE_PRIVATE_KEY',
      !clientEmail && 'FIREBASE_CLIENT_EMAIL',
    ].filter(Boolean);
    logger.warn(
      `Firebase credentials missing or empty: ${missing.join(', ')}. FCM will be disabled.`,
    );
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail,
      }),
    });
    logger.log('Firebase Admin SDK initialized');
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin', error);
    throw error;
  }
}

export { admin as firebaseAdmin };
