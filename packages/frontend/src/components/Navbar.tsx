import { useAuth } from '../context/AuthContext';
import { Star, LogOut, Shield, User as UserIcon, LayoutDashboard, Sliders } from 'lucide-react';

interface NavbarProps {
  activeView?: 'dashboard' | 'admin';
  onNavigate?: (view: 'dashboard' | 'admin') => void;
}

export function Navbar({ activeView = 'dashboard', onNavigate }: NavbarProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1.5rem',
      backgroundColor: '#1e293b',
      borderBottom: '1px solid #334155',
      marginBottom: '2rem'
    }}>
      {/* Brand & Left Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div 
          onClick={() => onNavigate?.('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
        >
          <Star color="#f59e0b" fill="#f59e0b" size={24} />
          <span style={{ fontWeight: 600, fontSize: '1.1rem', color: '#f8fafc' }}>
            SME Experts <span style={{ color: '#94a3b8', fontWeight: 400 }}>| Review Assistant</span>
          </span>
        </div>

        {/* View Switcher Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => onNavigate?.('dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 6,
              border: 'none',
              backgroundColor: activeView === 'dashboard' ? '#334155' : 'transparent',
              color: activeView === 'dashboard' ? '#f8fafc' : '#94a3b8',
              fontSize: '0.85rem',
              fontWeight: activeView === 'dashboard' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <LayoutDashboard size={14} />
            <span>Dashboard</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => onNavigate?.('admin')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 6,
                border: 'none',
                backgroundColor: activeView === 'admin' ? '#0284c7' : 'transparent',
                color: activeView === 'admin' ? '#ffffff' : '#94a3b8',
                fontSize: '0.85rem',
                fontWeight: activeView === 'admin' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Sliders size={14} />
              <span>Admin Console</span>
            </button>
          )}
        </div>
      </div>

      {/* User Info & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserIcon size={16} color="#94a3b8" />
          <span style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 500 }}>
            {user.name}
          </span>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.15rem 0.5rem',
            borderRadius: 9999,
            backgroundColor: isAdmin ? '#818cf822' : '#38bdf822',
            color: isAdmin ? '#a5b4fc' : '#7dd3fc',
            border: `1px solid ${isAdmin ? '#6366f144' : '#0284c744'}`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            {isAdmin && <Shield size={10} />}
            {isAdmin ? 'Admin' : 'Employee'}
          </span>
        </div>

        <button
          onClick={logout}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.75rem',
            borderRadius: 6,
            border: '1px solid #475569',
            backgroundColor: '#334155',
            color: '#f1f5f9',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease'
          }}
          title="Sign out"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
