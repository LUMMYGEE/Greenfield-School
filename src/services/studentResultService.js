import { getFirestore, doc, setDoc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();

// 1. Teacher submits result (80%)
export async function submitResult({ studentId, subjectId, term, year, testScore, examScore }) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  // Compose deterministic doc ID to prevent duplicates
  const resultId = `${studentId}_${subjectId}_${term}_${year}`;
  const ref = doc(db, 'student_results', resultId);
  // Check if already exists
  const existing = await getDoc(ref);
  if (existing.exists()) throw new Error('Result already submitted for this student/subject/term/year');
  // Write initial result
  await setDoc(ref, {
    studentId,
    subjectId,
    term,
    year,
    testScore,
    examScore,
    status: 'submitted',
  });
  return { id: resultId };
}

// 2. Admin grades result (adds adminScore, totalScore, sets status: graded, published: false)
export async function gradeResultByAdmin({ studentId, subjectId, term, year, adminScore }) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const resultId = `${studentId}_${subjectId}_${term}_${year}`;
  const ref = doc(db, 'student_results', resultId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Result not found');
  const data = snap.data();
  if (data.status !== 'submitted' && data.status !== 'graded') throw new Error('Result is not in submitted state');
  const totalScore = data.testScore + data.examScore + adminScore;
  await updateDoc(ref, {
    adminScore,
    totalScore,
    status: 'graded',
    published: false,
  });
  return { id: resultId };
}

// 3. Admin publishes result (sets published: true)
export async function publishResult({ studentId, subjectId, term, year }) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const resultId = `${studentId}_${subjectId}_${term}_${year}`;
  const ref = doc(db, 'student_results', resultId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Result not found');
  const data = snap.data();
  if (data.status !== 'graded') throw new Error('Result must be graded before publishing');
  await updateDoc(ref, { published: true });
  return { id: resultId };
}

// 4. Fetch published results for a student
export async function getPublishedResultsByStudent(studentId) {
  const q = query(
    collection(db, 'student_results'),
    where('studentId', '==', studentId),
    where('published', '==', true)
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 5. Fetch submitted results for admin review
export async function getSubmittedResults(filters = {}) {
  let q = collection(db, 'student_results');
  
  if (filters.status) {
    q = query(q, where('status', '==', filters.status));
  } else {
    // Default to submitted results for admin review
    q = query(q, where('status', '==', 'submitted'));
  }
  
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 6. Calculate grade based on total score
export function calculateGrade(totalScore, maxScore = 100) {
  const percentage = (totalScore / maxScore) * 100;
  
  if (percentage >= 90) return { grade: 'A+', gpa: 4.0 };
  if (percentage >= 80) return { grade: 'A', gpa: 3.7 };
  if (percentage >= 70) return { grade: 'B', gpa: 3.0 };
  if (percentage >= 60) return { grade: 'C', gpa: 2.0 };
  if (percentage >= 50) return { grade: 'D', gpa: 1.0 };
  return { grade: 'F', gpa: 0.0 };
}

// 7. Get published results for a student (for student portal)
export async function getStudentExamResults(studentId) {
  const q = query(
    collection(db, 'student_results'),
    where('studentId', '==', studentId),
    where('published', '==', true)
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
