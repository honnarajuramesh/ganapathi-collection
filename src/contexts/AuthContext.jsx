import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { USERS } from '../utils/constants';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function generatePin(existingPins) {
  let pin;
  do {
    pin = String(Math.floor(100000 + Math.random() * 900000));
  } while (existingPins.includes(pin));
  return pin;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [transfers, setTransfers] = useState([]);
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

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpenses(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'transfers'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransfers(data);
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
    // Check the live roster first (so newly-created collectors can log in),
    // but always fall back to the seed list too - the live list can be
    // empty or only partially synced (offline, slow network, or still
    // mid-seed), and that must never lock existing users out.
    const user = users.find(u => u.pin === pin) || USERS.find(u => u.pin === pin);
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

  async function addCollector({ name, pin, role = 'collector' }) {
    const trimmedName = name.trim();
    const trimmedPin = pin.trim();
    if (!trimmedName) throw new Error('Name is required');
    if (!/^\d{4,8}$/.test(trimmedPin)) throw new Error('PIN must be 4-8 digits');
    if (users.some(u => u.pin === trimmedPin)) throw new Error('That PIN is already in use');

    const docRef = await addDoc(collection(db, 'users'), {
      name: trimmedName,
      pin: trimmedPin,
      role,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  }

  function suggestPin() {
    return generatePin(users.map(u => u.pin));
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

  async function addExpense(entry) {
    const docRef = await addDoc(collection(db, 'expenses'), {
      ...entry,
      capturedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async function updateExpense(id, updates) {
    const docRef = doc(db, 'expenses', id);
    await updateDoc(docRef, updates);
  }

  async function deleteExpense(id) {
    await deleteDoc(doc(db, 'expenses', id));
  }

  async function addTransfer(entry) {
    const docRef = await addDoc(collection(db, 'transfers'), {
      ...entry,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async function deleteTransfer(id) {
    await deleteDoc(doc(db, 'transfers', id));
  }

  function getTotalCollections() {
    return collections.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  }

  function getUserCollections(userId) {
    return collections
      .filter(c => c.createdBy === userId)
      .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  }

  function getTotalExpenses() {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }

  function getUserExpenses(userId) {
    return expenses
      .filter(e => e.createdBy === userId)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }

  function getUserTransfersIn(userId) {
    return transfers
      .filter(t => t.toUserId === userId)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }

  function getUserTransfersOut(userId) {
    return transfers
      .filter(t => t.fromUserId === userId)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }

  // Cash currently held by a user: what they personally collected, plus
  // anything transferred to them, minus what they spent and sent onward.
  function getUserBalance(userId) {
    return getUserCollections(userId)
      + getUserTransfersIn(userId)
      - getUserTransfersOut(userId)
      - getUserExpenses(userId);
  }

  const value = {
    currentUser,
    users,
    collections,
    expenses,
    transfers,
    loading,
    login,
    logout,
    addCollector,
    suggestPin,
    addCollection,
    updateCollection,
    deleteCollection,
    addExpense,
    updateExpense,
    deleteExpense,
    addTransfer,
    deleteTransfer,
    initializeUsers,
    getTotalCollections,
    getUserCollections,
    getTotalExpenses,
    getUserExpenses,
    getUserTransfersIn,
    getUserTransfersOut,
    getUserBalance,
    isManager: currentUser?.role === 'manager'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
