import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Get detailed student information by ID
 */
export const getStudentDetails = async (studentId) => {
  try {
    const studentDoc = await getDoc(doc(db, 'users', studentId));
    if (!studentDoc.exists()) {
      throw new Error('Student not found');
    }
    
    const studentData = { id: studentDoc.id, ...studentDoc.data() };
    
    // Get class information
    if (studentData.classId) {
      const classDoc = await getDoc(doc(db, 'classes', studentData.classId));
      if (classDoc.exists()) {
        const classData = classDoc.data();
        studentData.classInfo = {
          id: classDoc.id,
          name: classData.name,
          level: classData.level,
          category: classData.category,
          subjects: classData.subjects || []
        };
      }
    }
    
    return studentData;
  } catch (error) {
    console.error('Error fetching student details:', error);
    throw error;
  }
};

/**
 * Update student information
 */
export const updateStudentInfo = async (studentId, updateData) => {
  try {
    const studentRef = doc(db, 'users', studentId);
    await updateDoc(studentRef, {
      ...updateData,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
};

/**
 * Get student's assignment submissions for a specific subject
 */
export const getStudentAssignments = async (studentId, subjectName) => {
  try {
    // Get assignments for the subject
    const assignmentsQuery = query(
      collection(db, 'assignments'),
      where('subjectName', '==', subjectName)
    );
    
    const assignmentsSnapshot = await getDocs(assignmentsQuery);
    const assignments = [];
    
    assignmentsSnapshot.docs.forEach(doc => {
      const assignmentData = { id: doc.id, ...doc.data() };
      
      // Find student's submission
      const submission = assignmentData.submissions?.find(
        sub => sub.studentId === studentId
      );
      
      assignments.push({
        ...assignmentData,
        studentSubmission: submission || null,
        submissionStatus: submission ? submission.status : 'not_submitted'
      });
    });
    
    return assignments;
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    throw error;
  }
};

/**
 * Get student's grades for a specific subject
 */
export const getStudentGrades = async (studentId, subjectName) => {
  try {
    const assignments = await getStudentAssignments(studentId, subjectName);
    
    const grades = assignments
      .filter(assignment => assignment.studentSubmission?.grade !== undefined)
      .map(assignment => ({
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        maxPoints: assignment.maxPoints,
        grade: assignment.studentSubmission.grade,
        percentage: Math.round((assignment.studentSubmission.grade / assignment.maxPoints) * 100),
        gradedAt: assignment.studentSubmission.gradedAt,
        feedback: assignment.studentSubmission.feedback
      }));
    
    // Calculate overall grade
    if (grades.length > 0) {
      const totalPoints = grades.reduce((sum, grade) => sum + grade.grade, 0);
      const totalMaxPoints = grades.reduce((sum, grade) => sum + grade.maxPoints, 0);
      const overallPercentage = Math.round((totalPoints / totalMaxPoints) * 100);
      
      return {
        grades,
        summary: {
          totalAssignments: grades.length,
          totalPoints,
          totalMaxPoints,
          overallPercentage,
          letterGrade: getLetterGrade(overallPercentage)
        }
      };
    }
    
    return { grades: [], summary: null };
  } catch (error) {
    console.error('Error fetching student grades:', error);
    throw error;
  }
};

/**
 * Convert percentage to letter grade
 */
const getLetterGrade = (percentage) => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

/**
 * Get class statistics for a teacher's subject
 */
export const getClassStatistics = async (teacherId, subjectName, classId) => {
  try {
    // Get all students in the class taking this subject
    const studentsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      where('classId', '==', classId)
    );
    
    const studentsSnapshot = await getDocs(studentsQuery);
    const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get assignments for this subject
    const assignmentsQuery = query(
      collection(db, 'assignments'),
      where('teacherId', '==', teacherId),
      where('subjectName', '==', subjectName),
      where('targetClasses', 'array-contains', classId)
    );
    
    const assignmentsSnapshot = await getDocs(assignmentsQuery);
    const assignments = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Calculate statistics
    const stats = {
      totalStudents: students.length,
      totalAssignments: assignments.length,
      submissionStats: {
        submitted: 0,
        pending: 0,
        graded: 0
      },
      gradeDistribution: {
        A: 0, B: 0, C: 0, D: 0, F: 0
      }
    };
    
    // Calculate submission and grade statistics
    assignments.forEach(assignment => {
      assignment.submissions?.forEach(submission => {
        if (students.some(student => student.id === submission.studentId)) {
          stats.submissionStats.submitted++;
          
          if (submission.status === 'graded') {
            stats.submissionStats.graded++;
            
            if (submission.grade !== undefined) {
              const percentage = Math.round((submission.grade / assignment.maxPoints) * 100);
              const letterGrade = getLetterGrade(percentage);
              stats.gradeDistribution[letterGrade]++;
            }
          }
        }
      });
    });
    
    stats.submissionStats.pending = (stats.totalAssignments * stats.totalStudents) - stats.submissionStats.submitted;
    
    return stats;
  } catch (error) {
    console.error('Error fetching class statistics:', error);
    throw error;
  }
};

/**
 * Send message/notification to student (placeholder for future implementation)
 */
export const sendMessageToStudent = async (studentId, message, type = 'general') => {
  try {
    // This would integrate with a messaging system
    // For now, we'll just log it
    console.log(`Message to student ${studentId}:`, { message, type });
    
    // In a real implementation, this might:
    // 1. Create a notification document
    // 2. Send an email
    // 3. Create an in-app notification
    
    return { success: true, message: 'Message sent successfully' };
  } catch (error) {
    console.error('Error sending message to student:', error);
    throw error;
  }
};