// Add this button to your frontend for immediate role refresh
import { getAuth } from 'firebase/auth';

const refreshUserRole = async () => {
  const auth = getAuth();
  if (auth.currentUser) {
    try {
      await auth.currentUser.getIdToken(true); // Force token refresh
      console.log('✅ Role refreshed successfully');
      window.location.reload(); // Reload page to apply changes
    } catch (error) {
      console.error('❌ Error refreshing role:', error);
    }
  }
};

// Add this button to your UI
// <button onClick={refreshUserRole}>Refresh Role</button>