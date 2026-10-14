import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreateRequestModal, CreatedRequestResponse } from '../components/CreateRequestModal';
import { LinkGeneratedBanner } from '../components/LinkGeneratedBanner';
import { RequestsTable, ReviewRequestItem } from '../components/RequestsTable';
import { Plus, Send, ExternalLink, RefreshCw, BarChart2 } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ReviewRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [latestCreated, setLatestCreated] = useState<CreatedRequestResponse | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/review-requests', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCreated = (newReq: CreatedRequestResponse) => {
    setLatestCreated(newReq);
    fetchRequests();
  };

  const handleRevoke = async (id: string) => {
    try {
      const res = await fetch(`/api/review-requests/${id}/revoke`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch {
      // Ignore
    }
  };

  // Stats
  const totalCount = requests.length;
  const openedCount = requests.filter((r) => r.status === 'opened' || r.status === 'drafting_started' || r.status === 'google_link_opened').length;
  const googleOpenedCount = requests.filter((r) => r.status === 'google_link_opened').length;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.75rem', fontWeight: 600 }}>
            Review Requests
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
            {user?.role === 'admin'
              ? 'Admin Overview — Managing all company review links.'
              : `Logged in as ${user?.name} — Manage and track your review request links.`}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            backgroundColor: '#2563eb',
            border: 'none',
            borderRadius: 8,
            color: '#ffffff',
            fontSize: '0.9rem',
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
          }}
        >
          <Plus size={18} />
          <span>Create Review Request</span>
        </button>
      </div>

      {/* Latest generated link notification */}
      {latestCreated && (
        <LinkGeneratedBanner
          publicUrl={latestCreated.publicUrl}
          clientReference={latestCreated.clientReference}
          onDismiss={() => setLatestCreated(null)}
        />
      )}

      {/* Quick Metrics Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 12,
          padding: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem' }}>Total Generated</span>
            <Send size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>
            {totalCount}
          </div>
        </div>

        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 12,
          padding: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem' }}>Clients Opened Link</span>
            <ExternalLink size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>
            {openedCount}
          </div>
        </div>

        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 12,
          padding: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem' }}>Navigated to Google</span>
            <BarChart2 size={16} color="#34d399" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>
            {googleOpenedCount}
          </div>
        </div>
      </div>

      {/* Requests Table Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>
          Recent Review Links
        </h3>
        <button
          onClick={fetchRequests}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.65rem',
            borderRadius: 6,
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            color: '#94a3b8',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
          title="Refresh table"
        >
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Table */}
      <RequestsTable requests={requests} onRevoke={handleRevoke} />

      {/* Create Modal */}
      <CreateRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleCreated}
      />
    </div>
  );
}
