import { useState, useEffect, FormEvent } from 'react';
import { Plus, Tag, X, Edit2, Loader2 } from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  description?: string | null;
  reviewContext?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export function AdminServicesTab() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    reviewContext: '',
    sortOrder: 1
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/services', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleToggleActive = async (service: ServiceItem) => {
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !service.isActive })
      });
      if (res.ok) {
        fetchServices();
      }
    } catch {}
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingService) {
        await fetch(`/api/admin/services/${editingService.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData)
        });
      }

      setShowAddModal(false);
      setEditingService(null);
      setFormData({ name: '', description: '', reviewContext: '', sortOrder: services.length + 1 });
      fetchServices();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>Service Offerings</h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
            Manage services available for employee review request generation.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingService(null);
            setFormData({ name: '', description: '', reviewContext: '', sortOrder: services.length + 1 });
            setShowAddModal(true);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.55rem 0.95rem',
            backgroundColor: '#2563eb',
            border: 'none',
            borderRadius: 8,
            color: '#ffffff',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          <span>Add Service</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading services...</div>
      ) : (
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>Service Name</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>Description & Review Grounding</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc) => (
                <tr key={svc.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Tag size={14} color="#38bdf8" />
                      <span>{svc.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1', fontSize: '0.825rem' }}>
                    <div>{svc.description || <span style={{ color: '#64748b' }}>No description</span>}</div>
                    {svc.reviewContext && (
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                        Context: {svc.reviewContext}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 9999,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      backgroundColor: svc.isActive ? '#05966915' : '#ef444415',
                      color: svc.isActive ? '#34d399' : '#fca5a5',
                      border: `1px solid ${svc.isActive ? '#05966944' : '#ef444444'}`
                    }}>
                      {svc.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setEditingService(svc);
                          setFormData({
                            name: svc.name,
                            description: svc.description || '',
                            reviewContext: svc.reviewContext || '',
                            sortOrder: svc.sortOrder
                          });
                          setShowAddModal(true);
                        }}
                        style={{
                          padding: '0.35rem 0.65rem',
                          backgroundColor: '#334155',
                          border: '1px solid #475569',
                          borderRadius: 6,
                          color: '#f8fafc',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleToggleActive(svc)}
                        style={{
                          padding: '0.35rem 0.65rem',
                          backgroundColor: svc.isActive ? '#ef444415' : '#05966915',
                          border: `1px solid ${svc.isActive ? '#ef444444' : '#05966944'}`,
                          borderRadius: 6,
                          color: svc.isActive ? '#fca5a5' : '#34d399',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        {svc.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 60,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 14,
            width: '100%',
            maxWidth: 480,
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Service Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Corporate Tax Planning"
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

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of service"
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

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  AI Review Context Grounding (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.reviewContext}
                  onChange={(e) => setFormData({ ...formData, reviewContext: e.target.value })}
                  placeholder="Specific details used by AI to formulate authentic draft suggestions"
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '0.55rem 0.95rem',
                    backgroundColor: 'transparent',
                    border: '1px solid #475569',
                    borderRadius: 8,
                    color: '#cbd5e1',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.55rem 1rem',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    borderRadius: 8,
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  <span>{editingService ? 'Save Changes' : 'Create Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
