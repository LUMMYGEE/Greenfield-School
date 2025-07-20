
import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { getUserRole } from "../services/userService";
import { AuthContext } from "./authContext.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = useCallback(async (uid) => {
    try {
      const userData = await getUserRole(uid);
      if (userData) {
        setUserRole(userData.role);
        setIsSuperAdmin(userData.isSuperAdmin);
      } else {
        console.warn("⚠️ No user role found for UID:", uid);
        setUserRole(null);
        setIsSuperAdmin(false);
      }
    } catch (error) {
      console.error("🚫 Error fetching user role:", error);
      setUserRole(null);
      setIsSuperAdmin(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true); // 🔄 Start loading on auth state change

      if (currentUser) {
        try {
          await currentUser.getIdToken(true); // 🔄 Refresh token
          setUser(currentUser);
          await fetchUserRole(currentUser.uid); // 🔍 Get role from Firestore
        } catch (error) {
          console.error("🔥 Auth initialization error:", error);
          setUser(null);
          setUserRole(null);
          setIsSuperAdmin(false);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setIsSuperAdmin(false);
      }

      setLoading(false); // ✅ Done loading
    });

    return () => unsubscribe();
  }, [fetchUserRole]);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("🚪 Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      isSuperAdmin,
      loading,
      logout,
      setUser,
      setUserRole,
    }}>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
