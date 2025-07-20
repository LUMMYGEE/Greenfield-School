import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc, 
  deleteDoc,
  Timestamp 
} from "firebase/firestore";
import { db } from "../firebase/config";

// Create a new exam
export const createExam = async (examData) => {
  try {
    const examsRef = collection(db, "exams");
    
    const exam = {
      ...examData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: 'active' // active, completed, cancelled
    };

    const docRef = await addDoc(examsRef, exam);
    return { id: docRef.id, ...exam };
  } catch (error) {
    console.error('Error creating exam:', error);
    throw error;
  }
};

// Get all exams
export const getAllExams = async (filters = {}) => {
  try {
    const examsRef = collection(db, "exams");
    let q = query(examsRef, orderBy("examDate", "desc"));

    // Apply filters
    if (filters.academicYear) {
      q = query(q, where("academicYear", "==", filters.academicYear));
    }
    if (filters.term) {
      q = query(q, where("term", "==", filters.term));
    }
    if (filters.examType) {
      q = query(q, where("examType", "==", filters.examType));
    }
    if (filters.status) {
      q = query(q, where("status", "==", filters.status));
    }

    const snapshot = await getDocs(q);
    const exams = [];
    
    snapshot.forEach((doc) => {
      exams.push({
        id: doc.id,
        ...doc.data(),
        examDate: doc.data().examDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });

    return exams;
  } catch (error) {
    console.error('Error fetching exams:', error);
    throw error;
  }
};

// Get exams by class
export const getExamsByClass = async (classId, filters = {}) => {
  try {
    const examsRef = collection(db, "exams");
    let q = query(
      examsRef, 
      where("classId", "==", classId),
      orderBy("examDate", "desc")
    );

    // Apply additional filters
    if (filters.academicYear) {
      q = query(q, where("academicYear", "==", filters.academicYear));
    }
    if (filters.term) {
      q = query(q, where("term", "==", filters.term));
    }
    if (filters.examType) {
      q = query(q, where("examType", "==", filters.examType));
    }

    const snapshot = await getDocs(q);
    const exams = [];
    
    snapshot.forEach((doc) => {
      exams.push({
        id: doc.id,
        ...doc.data(),
        examDate: doc.data().examDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });

    return exams;
  } catch (error) {
    console.error('Error fetching exams by class:', error);
    throw error;
  }
};

// Update exam
export const updateExam = async (examId, updateData) => {
  try {
    const examRef = doc(db, "exams", examId);
    await updateDoc(examRef, {
      ...updateData,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating exam:', error);
    throw error;
  }
};

// Delete exam
export const deleteExam = async (examId) => {
  try {
    const examRef = doc(db, "exams", examId);
    await deleteDoc(examRef);
  } catch (error) {
    console.error('Error deleting exam:', error);
    throw error;
  }
};

// Get exam types
export const getExamTypes = () => {
  return [
    'Mid-Term Exam',
    'Final Exam',
    'Quiz',
    'Test',
    'Assignment',
    'Project',
    'Practical',
    'Oral Exam'
  ];
};

// Get active exams for a student (based on their class)
export const getActiveExamsForStudent = async (studentId) => {
  try {
    // Get student data directly by document ID (since studentId is the UID)
    const studentDocRef = doc(db, "users", studentId);
    const studentDoc = await getDoc(studentDocRef);
    
    if (!studentDoc.exists()) {
      console.warn('Student not found with ID:', studentId);
      return []; // Return empty array instead of throwing error
    }
    
    const studentData = studentDoc.data();
    
    if (studentData.role !== 'student') {
      console.warn('User is not a student:', studentId);
      return [];
    }
    
    const studentClassId = studentData.classId;
    
    if (!studentClassId) {
      console.warn('Student has no class assigned:', studentId);
      return [];
    }
    
    // Get exams for the student's class
    const examsRef = collection(db, "exams");
    const q = query(
      examsRef,
      where("classId", "==", studentClassId),
      where("status", "==", "active")
    );

    const snapshot = await getDocs(q);
    const exams = [];
    
    snapshot.forEach((doc) => {
      exams.push({
        id: doc.id,
        ...doc.data(),
        examDate: doc.data().examDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });

    // Sort by examDate in JavaScript
    return exams.sort((a, b) => (b.examDate || new Date()) - (a.examDate || new Date()));
  } catch (error) {
    console.error('Error fetching active exams for student:', error);
    return []; // Return empty array instead of throwing error
  }
};

// Get upcoming exams for a student
export const getUpcomingExamsForStudent = async (studentId) => {
  try {
    const activeExams = await getActiveExamsForStudent(studentId);
    const now = new Date();
    
    return activeExams.filter(exam => exam.examDate && exam.examDate > now);
  } catch (error) {
    console.error('Error fetching upcoming exams for student:', error);
    throw error;
  }
};