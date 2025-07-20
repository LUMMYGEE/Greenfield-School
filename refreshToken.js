// Add this to your frontend to refresh user token
import { getAuth } from 'firebase/auth';

export const refreshUserToken = async () => {
  const auth = getAuth();
  if (auth.currentUser) {
    await auth.currentUser.getIdToken(true); // Force refresh
    window.location.reload(); // Reload to apply new role
  }
};