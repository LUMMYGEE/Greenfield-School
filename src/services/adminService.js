import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, secondaryAuth } from '../firebase/config';

export const createAdmin = async (adminData) => {
  try {
    // Create user in Firebase Auth using secondary auth to avoid logging out current admin
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, adminData.email, adminData.password);
    
    // Sign out from secondary auth immediately
    await secondaryAuth.signOut();
    
    // Add admin data to Firestore
    await addDoc(collection(db, 'users'), {
      uid: userCredential.user.uid,
      email: adminData.email,
      name: adminData.name,
      role: 'admin',
      createdAt: new Date(),
      isActive: true
    });

    return { success: true, uid: userCredential.user.uid };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getAllAdmins = async () => {
  try {
    const q = query(collection(db, 'users'), where('role', 'in', ['admin', 'super_admin']));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateAdmin = async (adminId, updateData) => {
  try {
    const adminRef = doc(db, 'users', adminId);
    await updateDoc(adminRef, { ...updateData, updatedAt: new Date() });
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateAdminStatus = async (adminId, isActive) => {
  try {
    const adminRef = doc(db, 'users', adminId);
    await updateDoc(adminRef, { isActive, updatedAt: new Date() });
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteAdmin = async (adminId) => {
  try {
    await deleteDoc(doc(db, 'users', adminId));
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
};