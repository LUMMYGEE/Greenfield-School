import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getStudentsByTeacherSubject } from './teacherStudentService';

/**
 * Create a new assignment for a specific subject
 */
export const createAssignment = async (assignmentData) => {
  try {
    const assignment = {
      ...assignmentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      submissions: [],
      status: assignmentData.status || 'draft'
    };

    const docRef = await addDoc(collection(db, 'assignments'), assignment);
    return { id: docRef.id, ...assignment };
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
};

/**
 * Get all assignments created by a teacher
 */
export const getAssignmentsByTeacher = async (teacherId) => {
  try {
    // Use simple where query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'assignments'),
      where('teacherId', '==', teacherId)
    );
    
    const querySnapshot = await getDocs(q);
    const assignments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort in JavaScript to avoid needing composite index
    return assignments.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime; // desc order
    });
  } catch (error) {
    console.error('Error fetching teacher assignments:', error);
    throw error;
  }
};

/**
 * Get assignments for a specific subject taught by a teacher
 */
export const getAssignmentsByTeacherSubject = async (teacherId, subjectName) => {
  try {
    // Get all assignments by teacher first, then filter by subject
    const allAssignments = await getAssignmentsByTeacher(teacherId);
    
    // Filter by subject name
    return allAssignments.filter(assignment => 
      assignment.subjectName === subjectName
    );
  } catch (error) {
    console.error('Error fetching assignments by teacher subject:', error);
    throw error;
  }
};

/**
 * Get assignments visible to a student based on their subjects
 */
export const getAssignmentsForStudent = async (studentId) => {
  try {
    // Get student data
    const studentDoc = await getDoc(doc(db, 'users', studentId));
    if (!studentDoc.exists()) {
      throw new Error('Student not found');
    }
    
    const studentData = studentDoc.data();
    
    if (!studentData.classId) {
      console.warn('Student has no classId assigned:', studentId);
      return [];
    }
    
    // Get class data to determine subjects
    const classDoc = await getDoc(doc(db, 'classes', studentData.classId));
    if (!classDoc.exists()) {
      console.warn('Class not found for student:', studentData.classId);
      return [];
    }
    
    const classData = classDoc.data();
    
    // Get all assignments for the student's class (without orderBy to avoid index requirement)
    const q = query(
      collection(db, 'assignments'),
      where('targetClasses', 'array-contains', studentData.classId)
    );
    
    const querySnapshot = await getDocs(q);
    const assignments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter assignments based on subjects available to the student and only show published ones
    const availableSubjects = classData.subjects?.map(s => s.subjectName) || [];
    
    const filteredAssignments = assignments.filter(assignment => {
      // Must be published
      if (assignment.status !== 'published') {
        return false;
      }
      
      // Must be for a subject the student takes
      if (!availableSubjects.includes(assignment.subjectName)) {
        return false;
      }
      
      return true;
    });
    
    // Sort in JavaScript to avoid needing composite index
    const sortedAssignments = filteredAssignments.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime; // desc order
    });
    
    return sortedAssignments;
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    throw error;
  }
};

/**
 * Get assignments for a specific subject (student view)
 */
export const getAssignmentsBySubjectForStudent = async (studentId, subjectName) => {
  try {
    const studentAssignments = await getAssignmentsForStudent(studentId);
    return studentAssignments.filter(assignment => 
      assignment.subjectName === subjectName
    );
  } catch (error) {
    console.error('Error fetching subject assignments for student:', error);
    throw error;
  }
};

/**
 * Update an assignment
 */
export const updateAssignment = async (assignmentId, updateData) => {
  try {
    const assignmentRef = doc(db, 'assignments', assignmentId);
    await updateDoc(assignmentRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating assignment:', error);
    throw error;
  }
};

/**
 * Delete an assignment
 */
export const deleteAssignment = async (assignmentId) => {
  try {
    await deleteDoc(doc(db, 'assignments', assignmentId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
};

/**
 * Submit an assignment (student)
 */
export const submitAssignment = async (assignmentId, studentId, submissionData) => {
  try {
    const assignmentRef = doc(db, 'assignments', assignmentId);
    const assignmentDoc = await getDoc(assignmentRef);
    
    if (!assignmentDoc.exists()) {
      throw new Error('Assignment not found');
    }
    
    const assignment = assignmentDoc.data();
    const submissions = assignment.submissions || [];
    
    // Check if student already submitted
    const existingSubmissionIndex = submissions.findIndex(
      sub => sub.studentId === studentId
    );
    
    // Use regular timestamp instead of serverTimestamp() inside array
    const currentTime = new Date().toISOString();
    
    const submission = {
      studentId,
      ...submissionData,
      submittedAt: currentTime,
      status: 'submitted'
    };
    
    if (existingSubmissionIndex >= 0) {
      // Update existing submission
      submissions[existingSubmissionIndex] = submission;
    } else {
      // Add new submission
      submissions.push(submission);
    }
    
    await updateDoc(assignmentRef, {
      submissions,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error submitting assignment:', error);
    throw error;
  }
};

/**
 * Grade an assignment submission
 */
export const gradeAssignment = async (assignmentId, studentId, gradeData) => {
  try {
    const assignmentRef = doc(db, 'assignments', assignmentId);
    const assignmentDoc = await getDoc(assignmentRef);
    
    if (!assignmentDoc.exists()) {
      throw new Error('Assignment not found');
    }
    
    const assignment = assignmentDoc.data();
    const submissions = assignment.submissions || [];
    
    const submissionIndex = submissions.findIndex(
      sub => sub.studentId === studentId
    );
    
    if (submissionIndex >= 0) {
      // Use regular timestamp instead of serverTimestamp() inside array
      const currentTime = new Date().toISOString();
      
      submissions[submissionIndex] = {
        ...submissions[submissionIndex],
        ...gradeData,
        gradedAt: currentTime,
        status: 'graded'
      };
      
      await updateDoc(assignmentRef, {
        submissions,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } else {
      throw new Error('Submission not found');
    }
  } catch (error) {
    console.error('Error grading assignment:', error);
    throw error;
  }
};

/**
 * Get assignment statistics for a teacher
 */
export const getAssignmentStats = async (teacherId) => {
  try {
    const assignments = await getAssignmentsByTeacher(teacherId);
    
    const stats = {
      total: assignments.length,
      published: assignments.filter(a => a.status === 'published').length,
      draft: assignments.filter(a => a.status === 'draft').length,
      totalSubmissions: 0,
      gradedSubmissions: 0
    };
    
    assignments.forEach(assignment => {
      const submissions = assignment.submissions || [];
      stats.totalSubmissions += submissions.length;
      stats.gradedSubmissions += submissions.filter(s => s.status === 'graded').length;
    });
    
    return stats;
  } catch (error) {
    console.error('Error fetching assignment stats:', error);
    throw error;
  }
};