// Firebase Cloud Function to set user roles
// This function can be called from the client-side to assign roles to users
import functions from "firebase-functions";
import admin from "firebase-admin";

admin.initializeApp();

export const setUserRole = functions.https.onCall(async (data, context) => {
  const { uid, role } = data;

  // Ensure only logged-in admins can assign roles
  if (!context.auth || context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can assign roles.');
  }

  // Validate role
  if (!['admin', 'student', 'teacher'].includes(role)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid role. Use admin, student, or teacher.');
  }

  // Assign role to user
  await admin.auth().setCustomUserClaims(uid, { role });

  return { message: `Role '${role}' assigned to user ${uid}` };
});
