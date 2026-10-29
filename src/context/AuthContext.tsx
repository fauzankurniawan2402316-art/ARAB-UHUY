import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsAdminCredentials: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'maharah_admin_session';
const ADMIN_USERNAME = 'FAUZANKRN';
const ADMIN_PASSWORD = '#Fauzan220306';
const ADMIN_GOOGLE_EMAIL = 'fauzan.kurniawan.2402316@students.um.ac.id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check saved admin credentials session or Google Auth
  useEffect(() => {
    const savedAdminSession = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (savedAdminSession) {
      try {
        const parsed = JSON.parse(savedAdminSession);
        if (parsed && parsed.userId === 'admin-fauzankrn') {
          setUserProfile(parsed);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error('Failed to parse admin session', e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        // Fetch or create profile in Firestore
        const isEmailAdmin = firebaseUser.email === ADMIN_GOOGLE_EMAIL;
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const snapshot = await getDoc(userDocRef);
          if (snapshot.exists()) {
            const data = snapshot.data();
            setUserProfile({
              userId: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Santri Maharah',
              photoURL: firebaseUser.photoURL || undefined,
              role: isEmailAdmin ? 'admin' : (data.role || 'student'),
              createdAt: data.createdAt || new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              isAdminAccount: isEmailAdmin || data.role === 'admin',
            });
          } else {
            const newProfile: UserProfile = {
              userId: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Santri Maharah',
              photoURL: firebaseUser.photoURL || undefined,
              role: isEmailAdmin ? 'admin' : 'student',
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              isAdminAccount: isEmailAdmin,
            };
            await setDoc(userDocRef, {
              userId: newProfile.userId,
              email: newProfile.email,
              displayName: newProfile.displayName,
              role: newProfile.role,
              createdAt: newProfile.createdAt,
              lastLoginAt: newProfile.lastLoginAt,
            });
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.warn('Firestore user doc sync error:', err);
          // Fallback in-memory profile so user is not blocked
          setUserProfile({
            userId: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Santri Maharah',
            photoURL: firebaseUser.photoURL || undefined,
            role: isEmailAdmin ? 'admin' : 'student',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            isAdminAccount: isEmailAdmin,
          });
        }
      } else {
        // Only clear if not in custom admin session
        const currentSavedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
        if (!currentSavedAdmin) {
          setUserProfile(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      const result = await signInWithPopup(auth, googleProvider);
      const isEmailAdmin = result.user.email === ADMIN_GOOGLE_EMAIL;
      
      const userDocRef = doc(db, 'users', result.user.uid);
      try {
        await setDoc(userDocRef, {
          userId: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || 'Santri Maharah',
          role: isEmailAdmin ? 'admin' : 'student',
          lastLoginAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${result.user.uid}`);
      }

      setUserProfile({
        userId: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || 'Santri Maharah',
        photoURL: result.user.photoURL || undefined,
        role: isEmailAdmin ? 'admin' : 'student',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isAdminAccount: isEmailAdmin,
      });
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsAdminCredentials = async (username: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (username.trim() === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
      const adminProfile: UserProfile = {
        userId: 'admin-fauzankrn',
        email: 'fauzan.kurniawan.2402316@students.um.ac.id',
        displayName: 'FAUZANKRN (Super Admin)',
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isAdminAccount: true,
      };

      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminProfile));
      setUserProfile(adminProfile);
      return { success: true };
    }
    return {
      success: false,
      error: 'Username atau password admin tidak valid. Harap periksa kembali huruf besar/kecil.',
    };
  };

  const logout = async () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setUserProfile(null);
    setCurrentUser(null);
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut warning:', e);
    }
  };

  const isAdmin = userProfile?.role === 'admin' || userProfile?.isAdminAccount === true;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        isLoading,
        loginWithGoogle,
        loginAsAdminCredentials,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
