import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Send, 
  Eye, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle,
  TrendingUp,
  Percent,
  CheckCircle,
  Lock
} from 'lucide-react';

interface ReportingSummary {
  totalRequests: number;
  openedRequests: number;
  googleOpenedRequests: number;
  revokedRequests: number;
  openRate: number;
  conversionRate: number;
}

export function AdminReportingTab() {
  const [data, setData] = useState<ReportingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReporting = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/reporting', { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to load operational reporting metrics.');
      }
      const json = await res.json();
      setData(json.summary || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading reporting data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReporting();
  }, []);

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
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
            backgroundColor: '#10b98122',
            border: '1px solid #10b98155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BarChart3 size={22} color="#34d399" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#f8fafc' }}>
              Operational Funnel & Conversion Analytics
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Real-time telemetry measuring request delivery, engagement, and Google review platform completion.
            </p>
          </div>
        </div>

        <button
          onClick={fetchReporting}
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
          title="Refresh analytics"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Compliance Guarantee Banner */}
      <div style={{
        padding: '1rem 1.25rem',
        borderRadius: 12,
        backgroundColor: '#064e3b33',
        border: '1px solid #05966955',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem'
      }}>
        <ShieldCheck size={24} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 600, color: '#6ee7b7' }}>
            Strict Google Anti-Gating Policy Verified
          </h4>
          <p style={{ margin: 0, fontSize: '0.825rem', color: '#a7f3d0', lineHeight: 1.5 }}>
            Under FTC guidelines and Google review policies, this platform strictly forbids rating gating. Zero client star ratings are stored in the database or used to branch user journeys. Every client is provided an identical direct path to leave their authentic feedback.
          </p>
        </div>
      </div>

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

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', backgroundColor: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Compiling telemetry metrics...</p>
        </div>
      ) : data ? (
        <>
          {/* Key Metric Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}>
            {/* Total Requests */}
            <div style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 12,
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Requests
                </span>
                <Send size={16} color="#38bdf8" />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#f8fafc' }}>
                {data.totalRequests}
              </div>
              <div style={{ marginTop: '0.4rem', fontSize: '0.775rem', color: '#64748b' }}>
                {data.revokedRequests} revoked link{data.revokedRequests === 1 ? '' : 's'}
              </div>
            </div>

            {/* Opened Requests */}
            <div style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 12,
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Client Opened
                </span>
                <Eye size={16} color="#fbbf24" />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#f8fafc' }}>
                {data.openedRequests}
              </div>
              <div style={{ marginTop: '0.4rem', fontSize: '0.775rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Percent size={13} />
                <span>{data.openRate}% landing page open rate</span>
              </div>
            </div>

            {/* Google Reviews Navigated */}
            <div style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 12,
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Google Navigated
                </span>
                <ExternalLink size={16} color="#34d399" />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#f8fafc' }}>
                {data.googleOpenedRequests}
              </div>
              <div style={{ marginTop: '0.4rem', fontSize: '0.775rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <TrendingUp size={13} />
                <span>{data.conversionRate}% end-to-end conversion</span>
              </div>
            </div>

            {/* Privacy Compliance Indicator */}
            <div style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 12,
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Rating Storage
                </span>
                <Lock size={16} color="#a5b4fc" />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#a5b4fc' }}>
                0 Bytes
              </div>
              <div style={{ marginTop: '0.4rem', fontSize: '0.775rem', color: '#94a3b8' }}>
                Zero rating logs in database
              </div>
            </div>
          </div>

          {/* Visual Funnel Representation */}
          <div style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 12,
            padding: '1.5rem'
          }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
              Review Collection Pipeline Flow
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Step 1: Created */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 500 }}>
                    1. Links Created & Dispatched
                  </span>
                  <span style={{ color: '#94a3b8' }}>{data.totalRequests} links (100%)</span>
                </div>
                <div style={{ height: 10, backgroundColor: '#0f172a', borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#0284c7' }} />
                </div>
              </div>

              {/* Step 2: Opened */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 500 }}>
                    2. Landing Page Opened by Client
                  </span>
                  <span style={{ color: '#94a3b8' }}>{data.openedRequests} links ({data.openRate}%)</span>
                </div>
                <div style={{ height: 10, backgroundColor: '#0f172a', borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, Math.max(0, data.openRate))}%`,
                    height: '100%',
                    backgroundColor: '#eab308',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              {/* Step 3: Google Destination Opened */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 500 }}>
                    3. Google Review Page Navigated
                  </span>
                  <span style={{ color: '#94a3b8' }}>{data.googleOpenedRequests} links ({data.conversionRate}%)</span>
                </div>
                <div style={{ height: 10, backgroundColor: '#0f172a', borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, Math.max(0, data.conversionRate))}%`,
                    height: '100%',
                    backgroundColor: '#10b981',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #334155',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              fontSize: '0.8rem',
              color: '#94a3b8'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="#34d399" />
                <span>Uniform Google URL path for all clients</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="#34d399" />
                <span>Zero negative review filtering or interception</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="#34d399" />
                <span>Client drafts generate on-device without storage</span>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
