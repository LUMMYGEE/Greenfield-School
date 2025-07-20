import { auth } from "../firebase/config";

// ✅ Fetch user role from Firebase Auth custom claims
export const getUserRole = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const token = await user.getIdTokenResult();
    const claims = token.claims;

    return {
      role: claims.role || null,
      isSuperAdmin: claims.role === "super_admin",
      uid: user.uid,
      email: user.email,
    };
  } catch (error) {
    console.error("Error fetching user role from token:", error);
    return null;
  }
};

// ✅ Force refresh token and fetch updated role
export const refreshUserRole = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      await user.getIdToken(true); // Force refresh
      const token = await user.getIdTokenResult();
      return {
        role: token.claims.role || null,
        isSuperAdmin: token.claims.role === "super_admin",
      };
    }
    return null;
  } catch (error) {
    console.error("Error refreshing user role:", error);
    return null;
  }
};

// ✅ Check if current user has expected role
export const checkUserRole = async (expectedRole) => {
  try {
    const userData = await getUserRole();

    if (!userData) {
      console.log("[checkUserRole] No user data found");
      return false;
    }

    const hasRole = userData.role === expectedRole;
    console.log("[checkUserRole] Role check:", {
      uid: userData.uid,
      expectedRole,
      actualRole: userData.role,
      hasRole,
    });

    return hasRole;
  } catch (error) {
    console.error("[checkUserRole] Error checking user role:", error);
    return false;
  }
};

// ✅ Get full user profile based on role
export const getUserProfile = async () => {
  try {
    const userData = await getUserRole();
    if (!userData) return null;

    const uid = userData.uid;

    switch (userData.role) {
      case "student": {
        const { getStudent } = await import("./studentService");
        return await getStudent(uid);
      }

      case "teacher": {
        const { getTeacherByUid } = await import("./teacherService");
        return await getTeacherByUid(uid);
      }

      case "admin":
      case "super_admin": {
        const { getAdminProfile } = await import("./adminService");
        return await getAdminProfile(uid);
      }
      default:
        return userData;
    }
  } catch (error) {
    console.error("[getUserProfile] Error fetching profile:", error);
    throw error;
  }
};

// ✅ Verify role and ensure profile completeness
export const verifyUserProfile = async () => {
  try {
    const userData = await getUserRole();
    if (!userData) {
      console.error("[verifyUserProfile] No user data found.");
      return {
        isValid: false,
        error: "User not authenticated or no role assigned",
      };
    }

    switch (userData.role) {
      case "student": {
        const { verifyStudentProfile } = await import("./studentService");
        const isStudentValid = await verifyStudentProfile(userData.uid);
        return {
          isValid: isStudentValid,
          error: isStudentValid ? null : "Student profile incomplete",
        };
      }
      default:
        return { isValid: true, error: null };
    }
  } catch (error) {
    console.error("[verifyUserProfile] Error:", error);
    return { isValid: false, error: error.message };
  }
};
