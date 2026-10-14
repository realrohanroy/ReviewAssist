import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';
import { AdminServicesTab } from '../components/admin/AdminServicesTab';
import { AdminUsersTab } from '../components/admin/AdminUsersTab';
import { AdminReportingTab } from '../components/admin/AdminReportingTab';
import { 
  Settings, 
  Briefcase, 
  Users, 
  BarChart3, 
  ShieldAlert, 
  Sliders
} from 'lucide-react';

type AdminTab = 'settings' | 'services' | 'users' | 'reporting';

interface AdminPageProps {
  onBackToDashboard?: () => void;
}

export function AdminPage({ onBackToDashboard }: AdminPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('settings');

  if (user && user.role !== 'admin') {
    return (
      <div style={{ maxWidth: 640, margin: '4rem auto', padding: '2rem', textAlign: 'center', backgroundColor: '#1e293b', borderRadius: 12, border: '1px solid #dc262644' }}>
        <ShieldAlert size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
          Administrator Access Required
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Your current account does not have permission to view or modify system settings and user accounts.
        </p>
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Return to Dashboard
          </button>
        )}
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: typeof Settings }[] = [
    { id: 'settings', label: 'Company Settings', icon: Settings },
    { id: 'services', label: 'Service Catalogue', icon: Briefcase },
    { id: 'users', label: 'User Accounts', icon: Users },
    { id: 'reporting', label: 'Funnel & Analytics', icon: BarChart3 }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Sliders size={20} color="#38bdf8" />
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>
              Admin Console
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
            System configuration, service catalogue, user access permissions, and conversion metrics.
          </p>
        </div>

        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 8,
              border: '1px solid #475569',
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            ← Back to Dashboard
          </button>
        )}
      </div>

      {/* Tab Navigation Bar */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid #334155',
        marginBottom: '1.75rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                backgroundColor: isActive ? '#1e293b' : 'transparent',
                color: isActive ? '#38bdf8' : '#94a3b8',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'settings' && <AdminSettingsTab />}
        {activeTab === 'services' && <AdminServicesTab />}
        {activeTab === 'users' && <AdminUsersTab />}
        {activeTab === 'reporting' && <AdminReportingTab />}
      </div>
    </div>
  );
}
