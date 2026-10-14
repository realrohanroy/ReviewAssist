import { useState, useEffect, FormEvent } from 'react';
import { Save, Check, AlertCircle, ExternalLink, Globe, Building2, Sparkles, MessageSquare } from 'lucide-react';

interface SettingsData {
  companyName: string;
  logoUrl?: string | null;
  googleReviewUrl: string;
  clientIntroMessage?: string | null;
  aiDraftingEnabled: boolean;
}

export function AdminSettingsTab() {
  const [settings, setSettings] = useState<SettingsData>({
    companyName: 'SME Experts',
    logoUrl: '',
    googleReviewUrl: 'https://g.page/r/CQggM93k8GK1EBM/review',
    clientIntroMessage: 'Thank you for choosing SME Experts. We would appreciate your genuine feedback.',
    aiDraftingEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setSettings({
            companyName: data.companyName || '',
            logoUrl: data.logoUrl || '',
            googleReviewUrl: data.googleReviewUrl || '',
            clientIntroMessage: data.clientIntroMessage || '',
            aiDraftingEnabled: data.aiDraftingEnabled ?? true
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings)
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to update settings.');
        setSaving(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Network error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 700 }}>
      {success && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#05966922',
          border: '1px solid #05966966',
          color: '#34d399',
          padding: '0.75rem 1rem',
          borderRadius: 8,
          fontSize: '0.875rem'
        }}>
          <Check size={16} />
          <span>Company settings saved successfully!</span>
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#ef444422',
          border: '1px solid #ef444455',
          color: '#fca5a5',
          padding: '0.75rem 1rem',
          borderRadius: 8,
          fontSize: '0.875rem'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Company Name */}
      <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#38bdf8' }}>
          <Building2 size={18} />
          <h4 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc' }}>Company Identity</h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Company Display Name
            </label>
            <input
              type="text"
              required
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
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

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Company Logo URL (Optional)
            </label>
            <input
              type="url"
              value={settings.logoUrl || ''}
              onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
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
      </div>

      {/* Google Review Destination */}
      <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#f59e0b' }}>
          <Globe size={18} />
          <h4 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc' }}>Official Google Review URL</h4>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
            Google Review Page URL <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="url"
              required
              value={settings.googleReviewUrl}
              onChange={(e) => setSettings({ ...settings, googleReviewUrl: e.target.value })}
              placeholder="https://g.page/r/.../review or https://search.google.com/local/writereview..."
              style={{
                flex: 1,
                padding: '0.65rem 0.75rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 8,
                color: '#f8fafc',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
            {settings.googleReviewUrl && (
              <a
                href={settings.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: 8,
                  color: '#f8fafc',
                  fontSize: '0.8rem',
                  textDecoration: 'none'
                }}
              >
                <span>Test Link</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem', display: 'block' }}>
            Must be a secure HTTPS Google URL (g.page, search.google.com, maps.google.com). Non-Google domains are rejected for security.
          </span>
        </div>
      </div>

      {/* Client Experience & AI Toggle */}
      <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#a855f7' }}>
          <MessageSquare size={18} />
          <h4 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc' }}>Client Experience & AI</h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Client Welcome Message
            </label>
            <textarea
              rows={2}
              value={settings.clientIntroMessage || ''}
              onChange={(e) => setSettings({ ...settings, clientIntroMessage: e.target.value })}
              placeholder="Thank you for choosing us. We would appreciate your genuine feedback."
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 8,
                color: '#f8fafc',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem',
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="#c084fc" />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#f8fafc' }}>
                  AI Writing Suggestions
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Enable Groq-powered draft suggestions on public client review pages.
                </div>
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.aiDraftingEnabled}
                onChange={(e) => setSettings({ ...settings, aiDraftingEnabled: e.target.checked })}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings.aiDraftingEnabled ? '#7c3aed' : '#475569',
                borderRadius: 24,
                transition: '0.2s ease'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: 18,
                  width: 18,
                  left: settings.aiDraftingEnabled ? 22 : 3,
                  bottom: 3,
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                  transition: '0.2s ease'
                }} />
              </span>
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#2563eb',
          border: 'none',
          borderRadius: 8,
          color: '#ffffff',
          fontSize: '0.95rem',
          fontWeight: 500,
          cursor: saving ? 'not-allowed' : 'pointer',
          alignSelf: 'flex-start'
        }}
      >
        <Save size={16} />
        <span>{saving ? 'Saving...' : 'Save Settings'}</span>
      </button>
    </form>
  );
}
