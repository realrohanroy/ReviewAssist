import { useState } from 'react';
import { Copy, Check, Ban, ExternalLink, Calendar, Tag, AlertCircle } from 'lucide-react';

export interface ReviewRequestItem {
  id: string;
  status: 'created' | 'opened' | 'drafting_started' | 'google_link_opened' | 'expired' | 'revoked';
  serviceIds: string[];
  clientReference?: string | null;
  createdAt: string;
  expiresAt: string;
  revokedAt?: string | null;
  publicUrl?: string;
  createdByUser?: { id: string; name: string };
  attributedEmployee?: { id: string; name: string };
}

interface RequestsTableProps {
  requests: ReviewRequestItem[];
  onRevoke: (id: string) => Promise<void>;
}

export function RequestsTable({ requests, onRevoke }: RequestsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleCopy = async (id: string, url?: string) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this review link? Clients will no longer be able to open it.')) {
      return;
    }
    setRevokingId(id);
    await onRevoke(id);
    setRevokingId(null);
  };

  const getStatusBadge = (status: ReviewRequestItem['status']) => {
    const config: Record<string, { label: string; bg: string; text: string; border: string }> = {
      created: { label: 'Created', bg: '#0284c715', text: '#38bdf8', border: '#0284c744' },
      opened: { label: 'Link Opened', bg: '#818cf815', text: '#a5b4fc', border: '#818cf844' },
      drafting_started: { label: 'Drafting', bg: '#eab30815', text: '#fde047', border: '#eab30844' },
      google_link_opened: { label: 'Google Visited', bg: '#10b98115', text: '#34d399', border: '#10b98144' },
      revoked: { label: 'Revoked', bg: '#ef444415', text: '#fca5a5', border: '#ef444444' },
      expired: { label: 'Expired', bg: '#64748b15', text: '#94a3b8', border: '#64748b44' }
    };

    const cfg = config[status] || config.created;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.55rem',
        borderRadius: 9999,
        fontSize: '0.75rem',
        fontWeight: 500,
        backgroundColor: cfg.bg,
        color: cfg.text,
        border: `1px solid ${cfg.border}`
      }}>
        {cfg.label}
      </span>
    );
  };

  if (requests.length === 0) {
    return (
      <div style={{
        padding: '3rem 1.5rem',
        textAlign: 'center',
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 12,
        color: '#94a3b8'
      }}>
        <AlertCircle size={32} color="#64748b" style={{ margin: '0 auto 0.75rem' }} />
        <h4 style={{ margin: '0 0 0.25rem', color: '#f8fafc', fontSize: '1rem' }}>No review requests created yet</h4>
        <p style={{ margin: 0, fontSize: '0.875rem' }}>
          Click "Create Review Request" above to generate your first link for a client.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#1e293b',
      border: '1px solid #334155',
      borderRadius: 12,
      overflow: 'hidden'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8' }}>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>Client Reference / Date</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>Services</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 500, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => {
              const isRevoked = req.status === 'revoked';
              return (
                <tr
                  key={req.id}
                  style={{
                    borderBottom: '1px solid #334155',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 500, color: '#f8fafc' }}>
                      {req.clientReference || <span style={{ color: '#64748b', fontStyle: 'italic' }}>No client ref</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                      <Calendar size={12} />
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#cbd5e1' }}>
                      <Tag size={13} color="#38bdf8" />
                      <span>{req.serviceIds.length} service{req.serviceIds.length > 1 ? 's' : ''}</span>
                    </div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    {getStatusBadge(req.status)}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      {req.publicUrl && !isRevoked && (
                        <>
                          <button
                            onClick={() => handleCopy(req.id, req.publicUrl)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.35rem 0.65rem',
                              borderRadius: 6,
                              backgroundColor: copiedId === req.id ? '#059669' : '#334155',
                              border: '1px solid #475569',
                              color: '#f8fafc',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                            title="Copy link"
                          >
                            {copiedId === req.id ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedId === req.id ? 'Copied' : 'Copy'}</span>
                          </button>

                          <a
                            href={req.publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '0.35rem',
                              borderRadius: 6,
                              backgroundColor: '#334155',
                              border: '1px solid #475569',
                              color: '#94a3b8',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                            title="Preview link"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </>
                      )}

                      {!isRevoked && (
                        <button
                          onClick={() => handleRevoke(req.id)}
                          disabled={revokingId === req.id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.35rem 0.6rem',
                            borderRadius: 6,
                            backgroundColor: '#ef444415',
                            border: '1px solid #ef444444',
                            color: '#fca5a5',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                          title="Revoke link"
                        >
                          <Ban size={12} />
                          <span>Revoke</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
