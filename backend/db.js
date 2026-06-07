import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(), // Relies on GOOGLE_APPLICATION_CREDENTIALS in .env
    });
    console.log("✅ Firebase Admin Connected...");
  }
} catch (error) {
  console.error("❌ Firebase connection error:", error);
  process.exit(1);
}

const db = admin.firestore();

const connectDB = async () => {
  // Initialization is now synchronous, so this is just for compatibility
};

export { connectDB, db };
