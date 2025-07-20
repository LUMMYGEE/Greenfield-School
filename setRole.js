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

// Get UID and role from command line arguments
const uid = process.argv[2];
const role = process.argv[3];

if (!uid || !role) {
  console.log("❌ Usage: node setRole.js <UID> <role>");
  console.log("📝 Example: node setRole.js abc123def456 admin");
  console.log("🎯 Valid roles: admin, student, teacher, super_admin");
  process.exit(1);
}

if (!['admin', 'student', 'teacher', 'super_admin'].includes(role)) {
  console.log("❌ Invalid role. Use 'admin', 'student', 'teacher', or 'super_admin'");
  process.exit(1);
}

// Set the custom role claim
admin.auth().setCustomUserClaims(uid, { role })
  .then(() => {
    console.log(`✅ Role '${role}' set successfully for user: ${uid}`);
    console.log(`🔄 User needs to sign out and back in for changes to take effect`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error setting role:", error);
    process.exit(1);
  });
