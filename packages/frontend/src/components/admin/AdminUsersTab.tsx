import { useState, useEffect, FormEvent } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  User as UserIcon, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  X,
  Mail,
  Lock,
  RefreshCw
} from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  isActive: boolean;
  createdAt: string;
}

export function AdminUsersTab() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  
  // New user form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as 'admin' | 'employee'
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to load user accounts.');
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: UserItem) => {
    const nextState = !user.isActive;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: nextState })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update user status.');
      }

      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: nextState } : u));
      setSuccessMsg(`User "${user.name}" has been ${nextState ? 'activated' : 'deactivated'}.`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleRoleChange = async (user: UserItem, newRole: 'admin' | 'employee') => {
    if (user.role === newRole) return;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update role.');
      }

      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      setSuccessMsg(`Updated ${user.name}'s role to ${newRole.toUpperCase()}.`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change user role');
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSavingUser(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user account.');
      }

      setUsers(prev => [data, ...prev]);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'employee' });
      setSuccessMsg(`User "${data.name}" added successfully!`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSavingUser(false);
    }
  };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner / Actions */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 12,
        padding: '1.25rem 1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            backgroundColor: '#0284c722',
            border: '1px solid #0284c755',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={22} color="#38bdf8" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#f8fafc' }}>
              User Accounts & Roles
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Manage staff permissions, assign administrator privileges, or deactivate team access.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            onClick={fetchUsers}
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: 8,
              border: '1px solid #475569',
              backgroundColor: '#334155',
              color: '#cbd5e1',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            title="Refresh list"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={() => {
              setModalError(null);
              setIsModalOpen(true);
            }}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
            }}
          >
            <UserPlus size={16} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {successMsg && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 8,
          backgroundColor: '#065f4622',
          border: '1px solid #05966955',
          color: '#34d399',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 8,
          backgroundColor: '#7f1d1d22',
          border: '1px solid #dc262655',
          color: '#f87171',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 12,
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Loading user directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <Users size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.95rem' }}>No user accounts found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a88', borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => {
                  const isAdmin = user.role === 'admin';
                  return (
                    <tr 
                      key={user.id}
                      style={{ 
                        borderBottom: idx === users.length - 1 ? 'none' : '1px solid #33415544',
                        backgroundColor: !user.isActive ? '#0f172a33' : 'transparent',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            backgroundColor: isAdmin ? '#818cf822' : '#38bdf822',
                            border: `1px solid ${isAdmin ? '#818cf855' : '#38bdf855'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isAdmin ? '#a5b4fc' : '#7dd3fc',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                          }}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: user.isActive ? '#f1f5f9' : '#94a3b8' }}>
                              {user.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: user.isActive ? '#cbd5e1' : '#64748b' }}>
                        {user.email}
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user, e.target.value as 'admin' | 'employee')}
                          disabled={!user.isActive}
                          style={{
                            padding: '0.3rem 0.6rem',
                            borderRadius: 6,
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            backgroundColor: isAdmin ? '#312e81' : '#075985',
                            color: isAdmin ? '#e0e7ff' : '#e0f2fe',
                            border: `1px solid ${isAdmin ? '#4338ca' : '#0369a1'}`,
                            cursor: user.isActive ? 'pointer' : 'not-allowed',
                            outline: 'none'
                          }}
                        >
                          <option value="employee">Employee</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 9999,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          backgroundColor: user.isActive ? '#065f4622' : '#7f1d1d22',
                          color: user.isActive ? '#34d399' : '#f87171',
                          border: `1px solid ${user.isActive ? '#05966944' : '#dc262644'}`
                        }}>
                          {user.isActive ? (
                            <>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
                              Active
                            </>
                          ) : (
                            <>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: 6,
                            border: `1px solid ${user.isActive ? '#dc262655' : '#05966955'}`,
                            backgroundColor: user.isActive ? '#7f1d1d22' : '#065f4622',
                            color: user.isActive ? '#f87171' : '#34d399',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          {user.isActive ? (
                            <>
                              <XCircle size={13} />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={13} />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 14,
            width: '100%',
            maxWidth: 480,
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <UserPlus size={20} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc' }}>
                  Add Team Member
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div style={{
                marginBottom: '1.25rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 6,
                backgroundColor: '#7f1d1d22',
                border: '1px solid #dc262655',
                color: '#f87171',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}>
                <AlertCircle size={15} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                      borderRadius: 8,
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#f8fafc',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Work Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
                  <input
                    type="email"
                    required
                    placeholder="e.g. jane@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                      borderRadius: 8,
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#f8fafc',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Temporary Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                      borderRadius: 8,
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#f8fafc',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Role & Permissions
                </label>
                <div style={{ position: 'relative' }}>
                  <Shield size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'employee' }))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                      borderRadius: 8,
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#f8fafc',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="employee">Employee (Generate Review Requests)</option>
                    <option value="admin">Administrator (Full System & Config Control)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.6rem 1rem',
                    borderRadius: 8,
                    border: '1px solid #475569',
                    backgroundColor: 'transparent',
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: savingUser ? 'not-allowed' : 'pointer',
                    opacity: savingUser ? 0.7 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  {savingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
