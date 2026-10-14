import { useState, useEffect } from 'react';
import { StarRatingSelector } from '../components/StarRatingSelector';
import { AiDraftsSection } from '../components/AiDraftsSection';
import { Star, ExternalLink, Copy, Check, AlertCircle, Building2, User, Loader2, ShieldCheck } from 'lucide-react';

interface PublicContext {
  companyName: string;
  logoUrl?: string | null;
  clientIntroMessage?: string | null;
  googleReviewUrl: string;
  services: { id: string; name: string; description?: string }[];
  attributedEmployeeName?: string | null;
}

interface PublicReviewPageProps {
  token: string;
}

export function PublicReviewPage({ token }: PublicReviewPageProps) {
  const [data, setData] = useState<PublicContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [googleOpened, setGoogleOpened] = useState<boolean>(false);

  useEffect(() => {
    fetch(`/api/public/review-requests/${token}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          setErrorType(json.error || 'error');
          setErrorMessage(json.message || 'Unable to open review link.');
          return null;
        }
        return json as PublicContext;
      })
      .then((context) => {
        if (context) setData(context);
      })
      .catch(() => {
        setErrorType('network');
        setErrorMessage('Network connection error. Please verify your connection.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleCopyText = async () => {
    if (!reviewText.trim()) return;
    try {
      await navigator.clipboard.writeText(reviewText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      // Log telemetry event
      fetch(`/api/public/review-requests/${token}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'text_copied' })
      }).catch(() => {});
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleContinueToGoogle = async () => {
    if (!data?.googleReviewUrl) return;

    // Automatically copy review text to clipboard so client doesn't have to do it manually
    if (reviewText.trim()) {
      try {
        await navigator.clipboard.writeText(reviewText.trim());
        setCopied(true);
      } catch {
        // Fallback for restricted clipboard contexts
      }
    }

    // Log telemetry event
    fetch(`/api/public/review-requests/${token}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'google_link_opened' })
    }).catch(() => {});

    setGoogleOpened(true);

    // Open Google in a new tab
    window.open(data.googleReviewUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        color: '#94a3b8'
      }}>
        <Loader2 size={36} color="#38bdf8" style={{ animation: 'spin 1s linear infinite' }} />
        <span>Loading review assistant...</span>
      </div>
    );
  }

  if (errorType || !data) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}>
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 16,
          padding: '2.5rem 2rem',
          maxWidth: 480,
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: '#ef444422',
            color: '#f87171',
            marginBottom: '1rem'
          }}>
            <AlertCircle size={26} />
          </div>
          <h2 style={{ margin: '0 0 0.5rem', color: '#f8fafc', fontSize: '1.35rem' }}>
            {errorType === 'revoked' ? 'Review Link Revoked' : errorType === 'expired' ? 'Review Link Expired' : 'Link Not Found'}
          </h2>
          <p style={{ margin: '0 0 1.5rem', color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {errorMessage || 'This review link is no longer valid. If you recently worked with us, please contact your representative for a new link.'}
          </p>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Powered by SME Experts Client Review Assistant
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 640,
      margin: '0 auto',
      padding: '2rem 1.25rem 4rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Brand Header */}
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 52,
          height: 52,
          borderRadius: 14,
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          marginBottom: '0.85rem'
        }}>
          <Star color="#f59e0b" fill="#f59e0b" size={28} />
        </div>
        <h1 style={{ margin: '0 0 0.4rem', fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
          {data.companyName}
        </h1>
        <p style={{ margin: 0, fontSize: '0.925rem', color: '#94a3b8' }}>
          {data.clientIntroMessage || 'We value your genuine feedback on Google.'}
        </p>
      </header>

      {/* Service Context Card */}
      <section style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 14,
        padding: '1.25rem',
        marginBottom: '1.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '0.825rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          <Building2 size={16} />
          <span>Service Reference</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {data.services.map((svc) => (
            <div key={svc.id} style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
              {svc.name}
            </div>
          ))}
          {data.attributedEmployeeName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              <User size={14} />
              <span>Assisted by: <strong>{data.attributedEmployeeName}</strong></span>
            </div>
          )}
        </div>
      </section>

      {/* Main Review Form Card */}
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 16,
        padding: '1.75rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Star Rating Section */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{ display: 'block', textAlign: 'center', fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '1rem' }}>
            How was your experience?
          </label>
          <StarRatingSelector value={rating} onChange={setRating} />
        </div>

        {/* AI Suggestions Section */}
        <AiDraftsSection token={token} onSelectDraft={setReviewText} />

        {/* Optional Review Text Input */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}>
              Write your review (Optional)
            </label>
            {reviewText.trim() && (
              <button
                type="button"
                onClick={handleCopyText}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  color: copied ? '#34d399' : '#94a3b8',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            )}
          </div>

          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share details about the service delivered, timely communication, or overall experience..."
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 10,
              color: '#f8fafc',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
            You can compose your thoughts here, click Copy, and paste them directly into your Google review.
          </div>
        </div>

        {/* Primary Call to Action */}
        <button
          type="button"
          onClick={handleContinueToGoogle}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            padding: '0.875rem 1.25rem',
            backgroundColor: '#2563eb',
            border: 'none',
            borderRadius: 10,
            color: '#ffffff',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)'
          }}
        >
          <span>Continue to Google Reviews</span>
          <ExternalLink size={18} />
        </button>

        {googleOpened && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.35rem',
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: 8,
            backgroundColor: '#064e3b33',
            border: '1px solid #05966955',
            color: '#6ee7b7',
            fontSize: '0.85rem',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <Check size={16} color="#34d399" />
              <span>Review copied to clipboard!</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>
              On Google: tap your star rating, paste into the review box, and hit Post.
            </span>
          </div>
        )}
      </div>

      {/* Compliance / Policy Notice */}
      <footer style={{
        marginTop: '2rem',
        textAlign: 'center',
        padding: '0 1rem',
        color: '#64748b',
        fontSize: '0.775rem',
        lineHeight: 1.5
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem', color: '#94a3b8' }}>
          <ShieldCheck size={14} color="#38bdf8" />
          <span style={{ fontWeight: 500 }}>Independent & Authentic Feedback Policy</span>
        </div>
        <p style={{ margin: 0 }}>
          Your review will be submitted directly to Google under your personal Google account. We do not filter, gate, or modify your rating or review text.
        </p>
      </footer>
    </div>
  );
}
