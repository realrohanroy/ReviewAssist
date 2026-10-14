import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { Star, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@smeexperts.com');
  const [password, setPassword] = useState('Admin@12345');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await login(email, password);
    setSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Invalid credentials');
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 16,
        padding: '2rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            marginBottom: '0.75rem'
          }}>
            <Star color="#f59e0b" fill="#f59e0b" size={26} />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, color: '#f8fafc' }}>
            Client Review Assistant
          </h1>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
            Internal employee and administrative sign in
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#ef44441a',
            border: '1px solid #ef444444',
            color: '#fca5a5',
            padding: '0.75rem',
            borderRadius: 8,
            fontSize: '0.875rem',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.4rem' }}>
              Work Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem 0.65rem 2.5rem',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 8,
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
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem 0.65rem 2.5rem',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  color: '#f8fafc',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              backgroundColor: '#2563eb',
              border: 'none',
              borderRadius: 8,
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 500,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.75 : 1,
              marginTop: '0.5rem',
              transition: 'background-color 0.15s ease'
            }}
          >
            {submitting && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid #334155',
          fontSize: '0.75rem',
          color: '#64748b',
          textAlign: 'center'
        }}>
          Initial demo seed credentials: <code>admin@smeexperts.com</code> / <code>Admin@12345</code>
        </div>
      </div>
    </div>
  );
}
