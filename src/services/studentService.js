import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

import { uploadStudentImage } from "./uploadService";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, secondaryAuth } from "../firebase/config";

const COLLECTION_NAME = "users";

// Cache for student data
const studentCache = {
  list: null,
  lastFetched: null,
  details: {},
};

// ✅ Add new student and invalidate cache
export const addStudent = async (studentData) => {
  try {
    console.log("[addStudent] Input studentData:", studentData);

    // ✅ Validate required fields
    if (!studentData.email || !studentData.password) {
      throw new Error("Missing email or password for student account creation");
    }

    // ✅ Upload profile image
    let profileImageUrl = null;
    if (studentData.profileImage) {
      profileImageUrl = await uploadStudentImage(
        studentData.profileImage,
        studentData.admissionNumber
      );
      console.log("[addStudent] Uploaded profile image, URL:", profileImageUrl);
    }

    // ✅ Create Firebase Auth user (secondary to avoid admin logout)
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      studentData.email,
      studentData.password
    );
    const newUser = userCredential.user;
    console.log("[addStudent] Firebase Auth user created:", newUser.uid);

    // ✅ Sign out of secondary auth session
    await secondaryAuth.signOut();

    // ✅ Prepare Firestore document
    const docRef = doc(db, COLLECTION_NAME, newUser.uid);

    const studentDoc = {
      ...studentData,
      uid: newUser.uid,
      profileImageUrl: profileImageUrl || studentData.profileImageUrl || null,
      admissionNumber: studentData.admissionNumber,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: "active",
      role: "student",
    };

    // ✅ Remove sensitive fields
    delete studentDoc.password;
    delete studentDoc.profileImage;

    console.log(
      "[addStudent] Writing to Firestore, docRef:",
      docRef.path,
      "studentDoc:",
      studentDoc
    );
console.log("[addStudent] Final studentDoc to save:", studentDoc);

    await setDoc(docRef, studentDoc);
    console.log("[addStudent] Successfully wrote student to Firestore");

    // ✅ Invalidate list cache
    studentCache.list = null;
    studentCache.lastFetched = null;

    return studentData.admissionNumber;
  } catch (error) {
    console.error("[addStudent] Error adding student:", error);
    throw error;
  }
};

// ✅ Get all students
export const getAllStudents = async (pageSize = 50) => {
  try {
    const now = Date.now();
    if (
      studentCache.list &&
      studentCache.lastFetched &&
      now - studentCache.lastFetched < 300000
    ) {
      return studentCache.list;
    }

    const q = query(
      collection(db, COLLECTION_NAME),
      where("role", "==", "student"),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );
    const querySnapshot = await getDocs(q);

    const students = querySnapshot.docs.map((doc) => doc.data());

    studentCache.list = students;
    studentCache.lastFetched = now;

    return students;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};


export const getStudentByAdmissionNumber = async (admissionNumber) => {
  try {
    const q = query(
      collection(db, "users"),
      where("admissionNumber", "==", admissionNumber),
      where("role", "==", "student")
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return docSnap.data();
    }

    return null;
  } catch (error) {
    console.error("[getStudentByAdmissionNumber] Error:", error);
    throw error;
  }
};


// ✅ Get one student by UID
export const getStudent = async (uid) => {
  try {
    if (studentCache.details[uid]) {
      return studentCache.details[uid];
    }

    const docRef = doc(db, COLLECTION_NAME, uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().role === "student") {
      const studentData = docSnap.data();
      studentCache.details[uid] = studentData;
      return studentData;
    }

    return null;
  } catch (error) {
    console.error("[getStudent] Error fetching student:", error);
    throw error;
  }
};

// ✅ Update student by UID
export const updateStudent = async (uid, updateData) => {
  try {
    let profileImageUrl = updateData.profileImageUrl;

    if (updateData.profileImage) {
      profileImageUrl = await uploadStudentImage(
        updateData.profileImage,
        updateData.admissionNumber || uid
      );
    }

    const docRef = doc(db, COLLECTION_NAME, uid);
    const updatedData = {
      ...updateData,
      profileImageUrl,
      updatedAt: serverTimestamp(),
    };

    delete updatedData.profileImage;
    await updateDoc(docRef, updatedData);

    delete studentCache.details[uid];
    studentCache.list = null;
    studentCache.lastFetched = null;

    return true;
  } catch (error) {
    console.error("[updateStudent] Error updating student:", error);
    throw error;
  }
};

// ✅ Delete student by UID
export const deleteStudent = async (uid) => {
  try {
    console.log('[deleteStudent] Attempting to delete student with UID:', uid);
    
    if (!uid) {
      throw new Error('UID is required for deletion');
    }
    
    const docRef = doc(db, COLLECTION_NAME, uid);
    console.log('[deleteStudent] Document reference created:', docRef.path);
    
    await deleteDoc(docRef);
    console.log('[deleteStudent] Document deleted successfully');

    delete studentCache.details[uid];
    studentCache.list = null;
    studentCache.lastFetched = null;

    return true;
  } catch (error) {
    console.error("[deleteStudent] Error deleting student:", error);
    throw error;
  }
};

// ✅ Clear student cache
export const clearStudentCache = () => {
  studentCache.list = null;
  studentCache.lastFetched = null;
  studentCache.details = {};
};
