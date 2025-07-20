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

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log("❌ Usage: node checkTeacherRole.js <teacher-email>");
  console.log("📝 Example: node checkTeacherRole.js teacher@school.com");
  process.exit(1);
}

const checkTeacherRole = async () => {
  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    
    console.log("👤 User Info:");
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Email Verified: ${userRecord.emailVerified}`);
    console.log(`   Disabled: ${userRecord.disabled}`);
    
    // Check custom claims (role)
    const customClaims = userRecord.customClaims || {};
    console.log("\n🔐 Custom Claims:");
    console.log(`   Role: ${customClaims.role || 'NOT SET'}`);
    
    if (customClaims.role === 'teacher') {
      console.log("✅ Teacher role is correctly set!");
    } else {
      console.log("❌ Teacher role is NOT set correctly!");
      console.log("💡 Run: node setRole.js " + userRecord.uid + " teacher");
    }
    
    // Check Firestore user document
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log("\n📄 Firestore Document:");
      console.log(`   Role: ${userData.role || 'NOT SET'}`);
      console.log(`   Name: ${userData.name || 'NOT SET'}`);
      console.log(`   Subject: ${userData.subject || 'NOT SET'}`);
      
      if (userData.role === 'teacher') {
        console.log("✅ Firestore role is correctly set!");
      } else {
        console.log("❌ Firestore role is NOT set correctly!");
      }
    } else {
      console.log("\n❌ No Firestore document found for this user!");
    }
    
  } catch (error) {
    console.error("❌ Error checking teacher role:", error.message);
  }
};

checkTeacherRole()
  .then(() => {
    console.log("\n🏁 Check completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error);
    process.exit(1);
  });