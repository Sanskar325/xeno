import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { apiService } from '../lib/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(null);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
        setFirebaseError(null);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Firebase auth state change error:', error);
      setFirebaseError(error.message);
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Generate JWT token for backend authentication
    if (result.user) {
      const firebaseToken = await result.user.getIdToken();
      const jwtResponse = await apiService.generateJWT(firebaseToken, {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || result.user.email.split('@')[0]
      });
      
      // Store JWT token in localStorage
      localStorage.setItem('jwt_token', jwtResponse.token);
    }
    
    return result;
  };

  const register = async (name, email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the user profile with the display name
    if (result.user) {
      await updateProfile(result.user, {
        displayName: name
      });
      
      // Generate JWT token for backend authentication
      const firebaseToken = await result.user.getIdToken();
      const jwtResponse = await apiService.generateJWT(firebaseToken, {
        uid: result.user.uid,
        email: result.user.email,
        name: name
      });
      
      // Store JWT token in localStorage
      localStorage.setItem('jwt_token', jwtResponse.token);
      
      // Update local user state to reflect the display name
      setUser({
        ...result.user,
        displayName: name
      });
    }
    
    return result;
  };

  const logout = async () => {
    await signOut(auth);
    // Clear JWT token from localStorage
    localStorage.removeItem('jwt_token');
  };

  const updateUserProfile = async (profileData) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, profileData);
      
      // Update local user state
      setUser({
        ...auth.currentUser,
        ...profileData
      });
    }
  };

  const updateUserPassword = async (currentPassword, newPassword) => {
    if (auth.currentUser) {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
    }
  };

  const deleteAccount = async (password) => {
    if (auth.currentUser) {
      // Re-authenticate user before deleting account
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        password
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      await deleteUser(auth.currentUser);
      
      // Clear local state
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    firebaseError,
    updateUserProfile,
    updateUserPassword,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};