"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAdmin = void 0;
exports.initializeFirebase = initializeFirebase;
const admin = __importStar(require("firebase-admin"));
exports.firebaseAdmin = admin;
const common_1 = require("@nestjs/common");
const logger = new common_1.Logger('FirebaseConfig');
function initializeFirebase() {
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
        logger.warn(`Firebase credentials missing or empty: ${missing.join(', ')}. FCM will be disabled.`);
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
    }
    catch (error) {
        logger.error('Failed to initialize Firebase Admin', error);
        throw error;
    }
}
//# sourceMappingURL=firebase.config.js.map