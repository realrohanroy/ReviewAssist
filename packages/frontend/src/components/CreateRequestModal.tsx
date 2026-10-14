import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Check, Loader2, Send } from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  description?: string;
}

interface EmployeeItem {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface CreatedRequestResponse {
  id: string;
  publicUrl: string;
  token: string;
  clientReference?: string | null;
  serviceIds: string[];
}

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: CreatedRequestResponse) => void;
}

export function CreateRequestModal({ isOpen, onClose, onSuccess }: CreateRequestModalProps) {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [attributedEmployeeId, setAttributedEmployeeId] = useState<string>('');
  const [clientReference, setClientReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
        if (data.length > 0 && selectedServices.length === 0) {
          setSelectedServices([data[0].id]);
        }
      })
      .catch(() => {});

    fetch('/api/services/employees')
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data);
        if (user && !attributedEmployeeId) {
          setAttributedEmployeeId(user.id);
        }
      })
      .catch(() => {});
  }, [isOpen, user]);

  if (!isOpen) return null;

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      setError('Please select at least one service delivered to the client.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/review-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          serviceIds: selectedServices,
          attributedEmployeeId: attributedEmployeeId || user?.id,
          clientReference: clientReference.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create review request.');
        setLoading(false);
        return;
      }

      onSuccess(data);
      onClose();
    } catch {
      setError('Network error creating review link.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 16,
        width: '100%',
        maxWidth: 520,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={18} color="#38bdf8" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc', fontWeight: 600 }}>
              Create Review Request Link
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{
              backgroundColor: '#ef444422',
              border: '1px solid #ef444455',
              color: '#fca5a5',
              padding: '0.65rem 0.85rem',
              borderRadius: 8,
              fontSize: '0.85rem'
            }}>
              {error}
            </div>
          )}

          {/* Service Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0', marginBottom: '0.5rem' }}>
              Delivered Services <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 180, overflowY: 'auto' }}>
              {services.map((svc) => {
                const isSelected = selectedServices.includes(svc.id);
                return (
                  <div
                    key={svc.id}
                    onClick={() => toggleService(svc.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 8,
                      border: `1px solid ${isSelected ? '#38bdf8' : '#334155'}`,
                      backgroundColor: isSelected ? '#0284c715' : '#0f172a',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: isSelected ? '#38bdf8' : '#e2e8f0' }}>
                        {svc.name}
                      </div>
                      {svc.description && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                          {svc.description}
                        </div>
                      )}
                    </div>
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: `1px solid ${isSelected ? '#38bdf8' : '#64748b'}`,
                      backgroundColor: isSelected ? '#38bdf8' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0f172a'
                    }}>
                      {isSelected && <Check size={14} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attributed Team Member */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0', marginBottom: '0.4rem' }}>
              Attributed Team Member (Optional)
            </label>
            <select
              value={attributedEmployeeId}
              onChange={(e) => setAttributedEmployeeId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 8,
                color: '#f8fafc',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            >
              <option value="">Default (Yourself - {user?.name})</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
          </div>

          {/* Client Reference */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0', marginBottom: '0.4rem' }}>
              Client Reference (Optional, Internal Only)
            </label>
            <input
              type="text"
              value={clientReference}
              onChange={(e) => setClientReference(e.target.value)}
              placeholder="e.g. Acme Corp / Project Alpha"
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
            <span style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
              Not visible to client. Used to organize and identify requests in your dashboard.
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.6rem 1rem',
                backgroundColor: 'transparent',
                border: '1px solid #475569',
                borderRadius: 8,
                color: '#cbd5e1',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                backgroundColor: '#2563eb',
                border: 'none',
                borderRadius: 8,
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1
              }}
            >
              {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              <span>{loading ? 'Generating...' : 'Generate Review Link'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
