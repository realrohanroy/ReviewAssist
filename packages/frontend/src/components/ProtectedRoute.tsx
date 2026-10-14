import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from '../pages/LoginPage';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        color: '#94a3b8'
      }}>
        <Loader2 size={32} color="#38bdf8" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '0.9rem' }}>Verifying session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
