import admin from "firebase-admin";
import { readFile } from "fs/promises";
import process from "process";

// Dynamically import the service account key
const serviceAccount = JSON.parse(
  await readFile(new URL("./serviceAccountKey.json", import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const email = process.argv[2];

if (!email) {
  console.log("❌ Usage: node getUserUID.js <email>");
  console.log("📝 Example: node getUserUID.js admin@school.com");
  process.exit(1);
}

admin.auth().getUserByEmail(email)
  .then((userRecord) => {
    console.log(`✅ User found:`);
    console.log(`📧 Email: ${userRecord.email}`);
    console.log(`🆔 UID: ${userRecord.uid}`);
    console.log(`👤 Display Name: ${userRecord.displayName || 'Not set'}`);
    console.log(`\n🚀 To set as admin, run:`);
    console.log(`node setRole.js ${userRecord.uid} admin`);
  })
  .catch((error) => {
    console.error("❌ User not found:", error.message);
    process.exit(1);
  });