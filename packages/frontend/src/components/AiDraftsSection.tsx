import { useState } from 'react';
import { Sparkles, Loader2, Check, RefreshCw, ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react';

interface AiDraftsSectionProps {
  token: string;
  onSelectDraft: (draft: string) => void;
}

export function AiDraftsSection({ token, onSelectDraft }: AiDraftsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [clientNotes, setClientNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDrafts = async () => {
    setLoading(true);
    setError(null);
    setSelectedIndex(null);

    try {
      const res = await fetch(`/api/public/review-requests/${token}/drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientNotes: clientNotes.trim() || undefined })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Unable to generate suggestions at this time.');
        return;
      }

      setSuggestions(data.suggestions || []);
    } catch {
      setError('Network connection error while contacting AI service.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (index: number, text: string) => {
    setSelectedIndex(index);
    onSelectDraft(text);
  };

  const cardLabels = ['Concise & Direct', 'Detailed Overview', 'Team & Service Experience'];

  return (
    <div style={{
      backgroundColor: '#1e293b',
      border: '1px solid #334155',
      borderRadius: 14,
      marginBottom: '1.75rem',
      overflow: 'hidden'
    }}>
      {/* Header Toggle */}
      <button
        type="button"
        onClick={() => {
          if (!isOpen && suggestions.length === 0) {
            fetchDrafts();
          }
          setIsOpen(!isOpen);
        }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          backgroundColor: isOpen ? '#0f172a' : 'transparent',
          border: 'none',
          color: '#f8fafc',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background-color 0.15s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: '#a855f722',
            color: '#c084fc'
          }}>
            <Sparkles size={16} />
          </div>
          <div>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
              Optional Writing Suggestions
            </span>
            <div style={{ fontSize: '0.775rem', color: '#94a3b8' }}>
              Need help putting your experience into words? Let AI draft a starting point.
            </div>
          </div>
        </div>
        <div style={{ color: '#94a3b8' }}>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expanded Section */}
      {isOpen && (
        <div style={{ padding: '1.25rem', borderTop: '1px solid #334155' }}>
          {/* Client Highlights Input */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Any specific highlights to mention? (Optional)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="e.g. Quick turnaround, proactive advice, patient support"
                style={{
                  flex: 1,
                  padding: '0.55rem 0.75rem',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={fetchDrafts}
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 0.85rem',
                  backgroundColor: '#7c3aed',
                  border: 'none',
                  borderRadius: 8,
                  color: '#ffffff',
                  fontSize: '0.825rem',
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
                <span>{loading ? 'Drafting...' : 'Generate'}</span>
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#ef444415',
              border: '1px solid #ef444444',
              color: '#fca5a5',
              padding: '0.65rem 0.85rem',
              borderRadius: 8,
              fontSize: '0.825rem',
              marginBottom: '1rem'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem 1rem',
              gap: '0.75rem',
              color: '#94a3b8'
            }}>
              <Loader2 size={24} color="#c084fc" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '0.85rem' }}>Composing suggestions grounded in your delivered services...</span>
            </div>
          )}

          {/* Suggestion Cards */}
          {!loading && suggestions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {suggestions.map((text, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelect(idx, text)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 10,
                      backgroundColor: isSelected ? '#a855f715' : '#0f172a',
                      border: `1px solid ${isSelected ? '#c084fc' : '#334155'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isSelected ? '#c084fc' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {cardLabels[idx] || `Suggestion ${idx + 1}`}
                      </span>
                      {isSelected && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#34d399', fontSize: '0.75rem', fontWeight: 500 }}>
                          <Check size={12} />
                          <span>Selected</span>
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                      "{text}"
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* AI Disclaimer */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            backgroundColor: '#0f172a',
            padding: '0.65rem 0.85rem',
            borderRadius: 8,
            fontSize: '0.75rem',
            color: '#94a3b8',
            lineHeight: 1.4
          }}>
            <Info size={14} color="#38bdf8" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>
              <strong>Editorial Notice:</strong> Suggestions are optional starting points to help you formulate your review. You can edit any phrase or write completely in your own words before publishing on Google.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
