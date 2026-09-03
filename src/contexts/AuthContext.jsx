import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { USERS } from '../utils/constants';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  deleteDoc,
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('ganapathi_user');
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'collections'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCollections(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(data);
    });

    return () => unsubscribe();
  }, []);

  async function initializeUsers() {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    if (snapshot.empty) {
      for (const user of USERS) {
        await setDoc(doc(db, 'users', user.id), {
          name: user.name,
          pin: user.pin,
          role: user.role,
          createdAt: new Date().toISOString()
        });
      }
    }
  }

  function login(pin) {
    const user = USERS.find(u => u.pin === pin);
    if (user) {
      const userData = {
        id: user.id,
        name: user.name,
        role: user.role
      };
      setCurrentUser(userData);
      localStorage.setItem('ganapathi_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, error: 'Invalid PIN' };
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem('ganapathi_user');
  }

  async function addCollection(entry) {
    const docRef = await addDoc(collection(db, 'collections'), {
      ...entry,
      createdAt: serverTimestamp(),
      date: new Date().toISOString().split('T')[0]
    });
    return docRef.id;
  }

  async function updateCollection(id, updates) {
    const docRef = doc(db, 'collections', id);
    await updateDoc(docRef, updates);
  }

  async function deleteCollection(id) {
    await deleteDoc(doc(db, 'collections', id));
  }

  function getTotalCollections() {
    return collections.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  }

  function getUserCollections(userId) {
    return collections
      .filter(c => c.createdBy === userId)
      .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  }

  const value = {
    currentUser,
    users,
    collections,
    loading,
    login,
    logout,
    addCollection,
    updateCollection,
    deleteCollection,
    initializeUsers,
    getTotalCollections,
    getUserCollections,
    isManager: currentUser?.role === 'manager'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}