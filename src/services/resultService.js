import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  setDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const RESULTS_COLLECTION = 'results';

/**
 * Create or update a student result
 */
export const createOrUpdateResult = async (resultData) => {
  try {
    // Create a unique ID based on student, exam, and session
    const resultId = `${resultData.studentId}_${resultData.examId}_${resultData.session}_${resultData.term}`;
    
    const docRef = doc(db, RESULTS_COLLECTION, resultId);
    await setDoc(docRef, {
      ...resultData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { id: resultId, ...resultData };
  } catch (error) {
    console.error('Error creating/updating result:', error);
    throw error;
  }
};

/**
 * Get results for a specific student
 */
export const getResultsByStudent = async (studentId) => {
  try {
    const q = query(
      collection(db, RESULTS_COLLECTION),
      where('studentId', '==', studentId)
    );
    const querySnapshot = await getDocs(q);
    
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
    
    // Sort by createdAt in JavaScript instead of Firestore
    return results.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error fetching student results:', error);
    throw error;
  }
};

/**
 * Get results for a specific exam
 */
export const getResultsByExam = async (examId) => {
  try {
    const q = query(
      collection(db, RESULTS_COLLECTION),
      where('examId', '==', examId),
      orderBy('totalScore', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching exam results:', error);
    throw error;
  }
};

/**
 * Get results for a specific class
 */
export const getResultsByClass = async (classId, session = null, term = null) => {
  try {
    let q = query(
      collection(db, RESULTS_COLLECTION),
      where('classId', '==', classId)
    );

    if (session) {
      q = query(q, where('session', '==', session));
    }

    if (term) {
      q = query(q, where('term', '==', term));
    }

    q = query(q, orderBy('totalScore', 'desc'));

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching class results:', error);
    throw error;
  }
};

/**
 * Get result by ID
 */
export const getResultById = async (resultId) => {
  try {
    const docRef = doc(db, RESULTS_COLLECTION, resultId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Result not found');
    }
  } catch (error) {
    console.error('Error fetching result:', error);
    throw error;
  }
};

/**
 * Update result
 */
export const updateResult = async (resultId, updateData) => {
  try {
    const docRef = doc(db, RESULTS_COLLECTION, resultId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    return { id: resultId, ...updateData };
  } catch (error) {
    console.error('Error updating result:', error);
    throw error;
  }
};

/**
 * Delete result
 */
export const deleteResult = async (resultId) => {
  try {
    await deleteDoc(doc(db, RESULTS_COLLECTION, resultId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting result:', error);
    throw error;
  }
};

/**
 * Calculate class positions for results
 */
export const calculateClassPositions = async (classId, session, term) => {
  try {
    const results = await getResultsByClass(classId, session, term);
    
    // Sort by total score in descending order
    results.sort((a, b) => b.totalScore - a.totalScore);
    
    // Update positions
    const updatePromises = results.map((result, index) => {
      const position = index + 1;
      return updateResult(result.id, { position });
    });
    
    await Promise.all(updatePromises);
    
    return results.map((result, index) => ({
      ...result,
      position: index + 1
    }));
  } catch (error) {
    console.error('Error calculating class positions:', error);
    throw error;
  }
};

/**
 * Bulk create results for multiple students
 */
export const bulkCreateResults = async (resultsData) => {
  try {
    const results = [];
    
    for (const resultData of resultsData) {
      try {
        const result = await createOrUpdateResult(resultData);
        results.push({ success: true, result, studentId: resultData.studentId });
      } catch (error) {
        results.push({ 
          success: false, 
          error: error.message, 
          studentId: resultData.studentId 
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error bulk creating results:', error);
    throw error;
  }
};

/**
 * Get result statistics for a class
 */
export const getResultStatistics = async (classId, session, term) => {
  try {
    const results = await getResultsByClass(classId, session, term);
    
    if (results.length === 0) {
      return {
        totalStudents: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0
      };
    }
    
    const totalStudents = results.length;
    const totalScores = results.reduce((sum, result) => sum + result.totalScore, 0);
    const averageScore = totalScores / totalStudents;
    const highestScore = Math.max(...results.map(r => r.totalScore));
    const lowestScore = Math.min(...results.map(r => r.totalScore));
    const passedStudents = results.filter(r => r.totalScore >= 50).length; // Assuming 50 is pass mark
    const passRate = (passedStudents / totalStudents) * 100;
    
    return {
      totalStudents,
      averageScore: Math.round(averageScore * 100) / 100,
      highestScore,
      lowestScore,
      passRate: Math.round(passRate * 100) / 100
    };
  } catch (error) {
    console.error('Error calculating result statistics:', error);
    throw error;
  }
};