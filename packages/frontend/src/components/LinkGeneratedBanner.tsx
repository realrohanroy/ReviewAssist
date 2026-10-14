import { useState } from 'react';
import { Check, Copy, ExternalLink, Link as LinkIcon, Sparkles } from 'lucide-react';

interface LinkGeneratedBannerProps {
  publicUrl: string;
  clientReference?: string | null;
  onDismiss?: () => void;
}

export function LinkGeneratedBanner({ publicUrl, clientReference, onDismiss }: LinkGeneratedBannerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div style={{
      backgroundColor: '#064e3b22',
      border: '1px solid #05966966',
      borderRadius: 12,
      padding: '1.25rem',
      marginBottom: '2rem',
      position: 'relative',
      animation: 'fadeIn 0.2s ease-in-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 6,
            backgroundColor: '#10b98122',
            color: '#34d399'
          }}>
            <Sparkles size={16} />
          </div>
          <h4 style={{ margin: 0, fontSize: '1rem', color: '#34d399', fontWeight: 600 }}>
            Review Request Link Ready!
          </h4>
          {clientReference && (
            <span style={{
              fontSize: '0.75rem',
              color: '#94a3b8',
              backgroundColor: '#1e293b',
              padding: '0.15rem 0.5rem',
              borderRadius: 4,
              border: '1px solid #334155'
            }}>
              Ref: {clientReference}
            </span>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.2rem 0.5rem'
            }}
          >
            ✕
          </button>
        )}
      </div>

      <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
        Share this unique link with your client. They will be guided to optionally generate writing suggestions and submit directly on Google.
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: 8,
        padding: '0.5rem 0.75rem'
      }}>
        <LinkIcon size={16} color="#64748b" style={{ flexShrink: 0 }} />
        <span style={{
          flex: 1,
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          color: '#e2e8f0',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {publicUrl}
        </span>

        <button
          onClick={handleCopy}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.85rem',
            backgroundColor: copied ? '#059669' : '#2563eb',
            border: 'none',
            borderRadius: 6,
            color: '#ffffff',
            fontSize: '0.825rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            flexShrink: 0
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>

        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.45rem',
            borderRadius: 6,
            backgroundColor: '#1e293b',
            color: '#94a3b8',
            border: '1px solid #334155',
            textDecoration: 'none'
          }}
          title="Open preview in new tab"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
