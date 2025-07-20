import { collection, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, secondaryAuth } from '../firebase/config';

export const createTeacher = async (teacherData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, teacherData.email, teacherData.password);
    
    // Sign out of secondary auth to avoid session conflicts
    await secondaryAuth.signOut();
    
    // Use setDoc with the user's UID as document ID
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: teacherData.email,
      name: teacherData.name,
      subject: teacherData.subject,
      qualification: teacherData.qualification,
      phoneNumber: teacherData.phoneNumber,
      dateHired: teacherData.dateHired,
      profileImageUrl: teacherData.profileImageUrl || '',
      role: 'teacher',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    });

    return { success: true, uid: userCredential.user.uid };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getTeacherByUid = async (uid) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().role === 'teacher') {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    throw new Error(error.message);
  }
};


export const getAllTeachers = async () => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateTeacher = async (teacherId, updateData) => {
  try {
    const teacherRef = doc(db, 'users', teacherId);
    await updateDoc(teacherRef, { ...updateData, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteTeacher = async (teacherId) => {
  try {
    await deleteDoc(doc(db, 'users', teacherId));
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
};