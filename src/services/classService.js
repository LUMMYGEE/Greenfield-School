import { collection,setDoc, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config'; 



// 🔹 Add a new class
export const addClass = async (classData) => {
  const docref = await addDoc(collection(db, 'classes'), {
    name: classData.name,
    level: classData.level,
    category: classData.category || null,
    classTeacherId: classData.classTeacherId || null,
    subjects: classData.subjects || [], // 👈 include subject-teacher pairs
    createdAt: serverTimestamp()
  });

  await setDoc(docref, { id: docref.id }, { merge: true });
  return docref.id;
};


export const getClassesByTeacherSubject = async (teacherId) => {
  const snapshot = await getDocs(collection(db, 'classes'));

  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(cls =>
      cls.subjects?.some(subject => subject.teacherId === teacherId)
    );
};


// 🔹 Get all classes
export const getAllClasses = async () => {
  const snapshot = await getDocs(collection(db, 'classes'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 🔹 Update a class
export const updateClass = async (id, updatedData) => {
  const ref = doc(db, 'classes', id);
  await updateDoc(ref, {
    ...updatedData,
    subjects: updatedData.subjects || [] 
  });
  
  // Update all students in this class with new class information
  const studentsQuery = query(
    collection(db, 'users'),
    where('role', '==', 'student'),
    where('classId', '==', id)
  );
  
  const studentsSnapshot = await getDocs(studentsQuery);
  
  // Update each student document with new class info
  const updatePromises = studentsSnapshot.docs.map(studentDoc => {
    const studentRef = doc(db, 'users', studentDoc.id);
    return updateDoc(studentRef, {
      className: updatedData.name,
      level: updatedData.level,
      category: updatedData.category || null
    });
  });
  
  await Promise.all(updatePromises);
};

// 🔹 Delete a class
export const deleteClass = async (id) => {
  await deleteDoc(doc(db, 'classes', id));
};

export const getStudentsByClassId = async (classId) => {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'student'),
    where('classId', '==', classId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 🔹 Update a student
export const updateStudent = async (studentId, updatedData) => {
  const ref = doc(db, 'users', studentId);
  await updateDoc(ref, updatedData);
};

// 🔹 Delete a student
export const deleteStudent = async (studentId) => {
  await deleteDoc(doc(db, 'users', studentId));
};

