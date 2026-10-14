import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { PublicReviewPage } from './pages/PublicReviewPage';

export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activeView, setActiveView] = useState<'dashboard' | 'admin'>(() => {
    return window.location.pathname === '/admin' ? 'admin' : 'dashboard';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      if (window.location.pathname === '/admin') {
        setActiveView('admin');
      } else if (!window.location.pathname.startsWith('/review/')) {
        setActiveView('dashboard');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (view: 'dashboard' | 'admin') => {
    setActiveView(view);
    const targetPath = view === 'admin' ? '/admin' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
      setCurrentPath(targetPath);
    }
  };

  // Check if navigating to public review link: /review/:token
  if (currentPath.startsWith('/review/')) {
    const token = currentPath.replace('/review/', '').split('/')[0];
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc' }}>
        <PublicReviewPage token={token} />
      </div>
    );
  }

  // Internal employee and admin dashboard
  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc' }}>
        <Navbar activeView={activeView} onNavigate={handleNavigate} />
        <ProtectedRoute>
          {activeView === 'admin' ? (
            <AdminPage onBackToDashboard={() => handleNavigate('dashboard')} />
          ) : (
            <DashboardPage />
          )}
        </ProtectedRoute>
      </div>
    </AuthProvider>
  );
}

export default App;
