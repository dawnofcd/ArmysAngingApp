/**
 * Authentication Context
 * Quản lý authentication state và user data
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { auth } from '@/firebase/config';
import { getUserData, updateUserData } from '@/utils/firestore';
import type { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (firebaseUser) {
        // Lấy user data từ Firestore
        const userData = await getUserData(firebaseUser.uid);
        if (userData) {
          // Đảm bảo user có score và lastActive
          const updates: any = {};
          if (userData.score === undefined || userData.score === null) {
            updates.score = 0;
          }
          if (!userData.lastActive) {
            updates.lastActive = Date.now();
          }
          if (Object.keys(updates).length > 0) {
            await updateUserData(firebaseUser.uid, updates);
            setUser({ ...userData, ...updates });
          } else {
          setUser(userData);
          }
        } else {
          // Tạo user mới nếu chưa có trong Firestore
          const newUser: User = {
            id: firebaseUser.uid,
            name:
              firebaseUser.displayName ||
              firebaseUser.email?.split('@')[0] ||
              'User',
            email: firebaseUser.email || '',
            role: 'user',
            completedSongs: [],
            playlist: [],
            score: 0,
            lastActive: Date.now(),
            createdAt: Date.now(),
          };
          // Lưu vào Firestore (cần import doc, setDoc)
          const { doc, setDoc } = await import('firebase/firestore');
          const { db } = await import('@/firebase/config');
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const { doc, setDoc } = await import('firebase/firestore');
    const { db } = await import('@/firebase/config');

    // Tạo user trong Firestore
    const newUser: User = {
      id: userCredential.user.uid,
      name,
      email,
      role: 'user',
      completedSongs: [],
      playlist: [],
      score: 0,
      lastActive: Date.now(),
    };
    await setDoc(doc(db, 'users', userCredential.user.uid), newUser);

    // Gửi email verification
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!firebaseUser || !firebaseUser.email) {
      throw new Error('User not authenticated');
    }

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
    await reauthenticateWithCredential(firebaseUser, credential);

    // Update password
    await updatePassword(firebaseUser, newPassword);
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    await updateUserData(userId, { role });
    if (user && user.id === userId) {
      setUser({ ...user, role });
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const { doc, setDoc, getDoc } = await import('firebase/firestore');
    const { db } = await import('@/firebase/config');

    // Kiểm tra xem user đã tồn tại chưa
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (!userDoc.exists()) {
      // Tạo user mới
      const newUser: User = {
        id: userCredential.user.uid,
        name:
          userCredential.user.displayName ||
          userCredential.user.email?.split('@')[0] ||
          'User',
        email: userCredential.user.email || '',
        role: 'user',
        completedSongs: [],
        playlist: [],
        score: 0,
        lastActive: Date.now(),
        createdAt: Date.now(),
      };
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
    } else {
      // Đảm bảo user cũ có score và lastActive
      const userData = userDoc.data();
      const updates: any = {};
      if (userData.score === undefined || userData.score === null) {
        updates.score = 0;
      }
      if (!userData.lastActive) {
        updates.lastActive = Date.now();
      }
      if (Object.keys(updates).length > 0) {
        const { updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'users', userCredential.user.uid), updates);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        login,
        register,
        logout,
        resetPassword,
        changePassword,
        updateUserRole,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
