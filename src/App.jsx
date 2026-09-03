import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EntryForm from './pages/EntryForm';
import Collections from './pages/Collections';
import UserManagement from './pages/UserManagement';
import Header from './components/Header';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const { currentUser, loading, initializeUsers } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [entryMode, setEntryMode] = useState('income');
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    initializeUsers().catch((err) => console.warn('Could not seed default users:', err.message));
  }, []);

  function handleNavigate(page, mode) {
    if (page === 'entry' && mode) setEntryMode(mode);
    setActivePage(page);
  }

  useEffect(() => {
    if (currentUser) {
      setShowLogin(false);
    } else {
      setShowLogin(true);
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (showLogin || !currentUser) {
    return <Login onLogin={() => setShowLogin(false)} />;
  }

  return (
    <div className="min-h-dvh pb-40 bg-[radial-gradient(ellipse_at_top_right,rgba(255,215,0,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(255,94,98,0.06),transparent_50%)]">
      <Header activePage={activePage} onNavigate={handleNavigate} />

      <main className="max-w-lg mx-auto">
        {activePage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
        {activePage === 'entry' && <EntryForm onNavigate={handleNavigate} initialMode={entryMode} />}
        {activePage === 'collections' && <Collections />}
        {activePage === 'users' && <UserManagement />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#1a1a2e',
            color: '#fff',
            borderRadius: '16px',
            padding: '12px 16px',
            fontSize: '14px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            maxWidth: '90vw'
          },
        }}
      />
      <AppContent />
    </AuthProvider>
  );
}