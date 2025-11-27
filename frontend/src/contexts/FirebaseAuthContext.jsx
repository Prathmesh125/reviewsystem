import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, getAuthErrorMessage } from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = authAPI.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in
          setUser(firebaseUser);
          
          // Update email verification status in Firestore if it's changed
          const firestoreUserData = await authAPI.getUserData(firebaseUser.uid);
          if (firestoreUserData && firestoreUserData.emailVerified !== firebaseUser.emailVerified) {
            await authAPI.updateEmailVerificationStatus(firebaseUser.uid, firebaseUser.emailVerified);
            // Refetch user data with updated verification status
            const updatedUserData = await authAPI.getUserData(firebaseUser.uid);
            setUserData(updatedUserData);
          } else {
            setUserData(firestoreUserData);
          }
        } else {
          // User is signed out
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(getAuthErrorMessage(error));
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sign up with email and password
  const signUp = async (email, password, additionalData = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await authAPI.signUp(email, password, additionalData);
      return user;
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await authAPI.signIn(email, password);
      return user;
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await authAPI.signInWithGoogle();
      return user;
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await authAPI.signOut();
      setUser(null);
      setUserData(null);
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Send email verification
  const sendEmailVerification = async () => {
    try {
      if (user) {
        await authAPI.sendEmailVerification(user);
        return true;
      }
      throw new Error('No user logged in');
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Refresh user to check email verification status
  const refreshUser = async () => {
    try {
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          // Update Firestore document
          await authAPI.updateEmailVerificationStatus(user.uid, true);
          // Refresh user data
          const updatedUserData = await authAPI.getUserData(user.uid);
          setUserData(updatedUserData);
        }
        return user.emailVerified;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing user:', error);
      return false;
    }
  };

  // Get user role
  const getUserRole = () => {
    return userData?.role || 'CUSTOMER';
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Check if user is admin
  const isAdmin = () => {
    return userData?.role === 'SUPER_ADMIN';
  };

  // Check if user is super admin
  const isSuperAdmin = () => {
    const SUPER_ADMIN_EMAILS = [
      'millrockindustries@gmail.com',
      'admin@reviewsystem.com',
      'superadmin@reviewsystem.com'
    ];
    return SUPER_ADMIN_EMAILS.includes(user?.email);
  };

  // Check if user is business owner
  const isBusinessOwner = () => {
    return userData?.role === 'BUSINESS_OWNER';
  };

  // Get Firebase ID token for API calls
  const getIdToken = async () => {
    if (user) {
      try {
        return await user.getIdToken();
      } catch (error) {
        console.error('Error getting ID token:', error);
        return null;
      }
    }
    return null;
  };

  const value = {
    // User state
    user,
    userData,
    loading,
    error,
    
    // Auth methods
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    clearError,
    sendEmailVerification,
    refreshUser,
    
    // Utility methods
    getUserRole,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isBusinessOwner,
    getIdToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};