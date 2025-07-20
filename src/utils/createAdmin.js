import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

// Function to create admin user
export const createAdminUser = async (email, password, name) => {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      name: name,
      role: "admin",
      createdAt: new Date(),
      status: "active"
    });

    console.log("Admin user created successfully!");
    return { success: true, userId: user.uid };
  } catch (error) {
    console.error("Error creating admin user:", error);
    return { success: false, error: error.message };
  }
};

// Quick admin creation (run this once)
export const createDefaultAdmin = async () => {
  const adminData = {
    email: "admin@greenfield.edu.ng",
    password: "admin123456", // Change this!
    name: "School Administrator"
  };

  return await createAdminUser(adminData.email, adminData.password, adminData.name);
};