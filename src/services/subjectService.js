// src/services/subjectService.js
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase/config";

// Get all subjects for a department
export const getSubjectsByDepartment = async (department) => {
  try {
    const docRef = doc(db, "subjects", department.toLowerCase());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().subjects || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw error;
  }
};

// Add a subject to a department
export const addSubjectToDepartment = async (department, newSubject) => {
  try {
    const docRef = doc(db, "subjects", department.toLowerCase());
    const docSnap = await getDoc(docRef);
    let subjects = [];

    if (docSnap.exists()) {
      subjects = docSnap.data().subjects || [];
    }

    if (!subjects.includes(newSubject)) {
      subjects.push(newSubject);
      await updateDoc(docRef, { subjects });
    }
  } catch (error) {
    console.error("Error adding subject:", error);
    throw error;
  }
};

// Remove a subject from a department
export const removeSubjectFromDepartment = async (department, subjectToRemove) => {
  try {
    const docRef = doc(db, "subjects", department.toLowerCase());
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentSubjects = docSnap.data().subjects || [];
      const updatedSubjects = currentSubjects.filter(
        (subj) => subj !== subjectToRemove
      );

      await updateDoc(docRef, { subjects: updatedSubjects });
    }
  } catch (error) {
    console.error("Error removing subject:", error);
    throw error;
  }
};

// Get all subjects from all departments
export const getAllSubjects = async () => {
  try {
    const subjectsRef = collection(db, "subjects");
    const querySnapshot = await getDocs(subjectsRef);
    const allSubjects = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.subjects && Array.isArray(data.subjects)) {
        allSubjects.push(...data.subjects);
      }
    });
    
    // Remove duplicates, sort, and return as objects with id and name
    const uniqueSubjects = [...new Set(allSubjects)].sort();
    return uniqueSubjects.map((subject, index) => ({
      id: subject.toLowerCase().replace(/\s+/g, '_'), // Create ID from subject name
      name: subject
    }));
  } catch (error) {
    console.error("Error fetching all subjects:", error);
    throw error;
  }
};

