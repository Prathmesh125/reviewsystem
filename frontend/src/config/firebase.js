// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  connectAuthEmulator,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';

// Firebase config object - Replace with your actual config from Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Auth functions
export const authAPI = {
  // Email/Password Sign Up
  signUp: async (email, password, userData = {}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile with display name
      if (userData.name) {
        await updateProfile(user, {
          displayName: userData.name
        });
      }
      
      // Send email verification
      await sendEmailVerification(user, {
        url: `${window.location.origin}/dashboard`, // Redirect URL after verification
        handleCodeInApp: false
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: userData.name || '',
        role: userData.role || 'CUSTOMER',
        emailVerified: false, // Track verification status
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Email/Password Sign In
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // Google Sign In
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user document exists, if not create one
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          name: user.displayName || '',
          role: 'CUSTOMER',
          provider: 'google',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Sign Out
  signOut: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  },

  // Get user document from Firestore
  getUserData: async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      throw error;
    }
  },

  // Auth state observer
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  },

  // Send email verification
  sendEmailVerification: async (user) => {
    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/dashboard`,
        handleCodeInApp: false
      });
    } catch (error) {
      throw error;
    }
  },

  // Update email verification status in Firestore
  updateEmailVerificationStatus: async (uid, isVerified) => {
    try {
      await setDoc(doc(db, 'users', uid), {
        emailVerified: isVerified,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      throw error;
    }
  }
};

// Error handling helper
export const getAuthErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No user found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.';
    default:
      return error.message || 'An error occurred during authentication.';
  }
};

export default app;