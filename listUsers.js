import admin from "firebase-admin";
import { readFile } from "fs/promises";

// Dynamically import the service account key
const serviceAccount = JSON.parse(
  await readFile(new URL("./serviceAccountKey.json", import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("📋 Fetching all users...\n");

admin.auth().listUsers()
  .then((listUsersResult) => {
    listUsersResult.users.forEach((userRecord, index) => {
      const role = userRecord.customClaims?.role || 'No role set';
      console.log(`${index + 1}. ${userRecord.email || 'No email'}`);
      console.log(`   UID: ${userRecord.uid}`);
      console.log(`   Role: ${role}`);
      console.log(`   Created: ${new Date(userRecord.metadata.creationTime).toLocaleDateString()}`);
      console.log('');
    });
    
    console.log(`✅ Total users: ${listUsersResult.users.length}`);
  })
  .catch((error) => {
    console.error("❌ Error listing users:", error);
  });

  