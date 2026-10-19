'use client';

import { useState, useEffect } from 'react';
import { fetchAgents, createAgent, updateAgent, deleteAgent } from '../../../lib/api';
import { 
  Users, 
  PlusCircle, 
  Trash2, 
  Star, 
  ShieldCheck, 
  Phone, 
  MessageCircle, 
  Mail, 
  Edit, 
  Upload, 
  Camera, 
  Sparkles, 
  X, 
  Check 
} from 'lucide-react';

const AGENT_PHOTO_PRESETS = [
  { label: 'Executive Male 1', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80' },
  { label: 'Executive Female 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80' },
  { label: 'Broker Male 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' },
  { label: 'Broker Female 2', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80' },
];

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    company: 'Buytora Partner Realty',
    phone: '0000000000',
    whatsapp: '0000000000',
    email: '',
    specialties: 'Waterfront Villas, Bay Residences, Luxury Rentals',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
    isSuperAgent: true,
    rating: 4.95,
    closedDeals: 24,
  });
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [editingAgent, setEditingAgent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    company: '',
    phone: '',
    whatsapp: '',
    email: '',
    specialties: '',
    photo: '',
    isSuperAgent: false,
    rating: 4.9,
    closedDeals: 10,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const data = await fetchAgents();
      setAgents(data);
    } catch (err) {
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  // Add agent submit
  const handleAddAgentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...newAgent,
        specialties: typeof newAgent.specialties === 'string'
          ? newAgent.specialties.split(',').map((s) => s.trim()).filter(Boolean)
          : newAgent.specialties,
        rating: Number(newAgent.rating) || 4.9,
        closedDeals: Number(newAgent.closedDeals) || 10,
      };
      const res = await createAgent(payload);
      if (res && res.data) {
        setAgents((prev) => [...prev, res.data]);
        setShowAddModal(false);
        setNewAgent({
          name: '',
          company: 'Buytora Partner Realty',
          phone: '0000000000',
          whatsapp: '0000000000',
          email: '',
          specialties: 'Waterfront Villas, Bay Residences, Luxury Rentals',
          photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
          isSuperAgent: true,
          rating: 4.95,
          closedDeals: 24,
        });
      }
    } catch (err) {
      alert('Failed to add agent');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (agent) => {
    setEditingAgent(agent);
    setEditFormData({
      name: agent.name || '',
      company: agent.company || '',
      phone: agent.phone || '',
      whatsapp: agent.whatsapp || '',
      email: agent.email || '',
      specialties: Array.isArray(agent.specialties) ? agent.specialties.join(', ') : (agent.specialties || ''),
      photo: agent.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
      isSuperAgent: !!agent.isSuperAgent,
      rating: agent.rating || 4.9,
      closedDeals: agent.closedDeals || 10,
    });
  };

  // Save Edit Submit
  const handleSaveEditSubmit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const agentId = editingAgent._id || editingAgent.id;
      const payload = {
        ...editFormData,
        specialties: typeof editFormData.specialties === 'string'
          ? editFormData.specialties.split(',').map((s) => s.trim()).filter(Boolean)
          : editFormData.specialties,
        rating: Number(editFormData.rating) || 4.9,
        closedDeals: Number(editFormData.closedDeals) || 0,
      };

      const res = await updateAgent(agentId, payload);
      if (res && (res.success || res.data)) {
        const updated = res.data || { ...editingAgent, ...payload };
        setAgents((prev) =>
          prev.map((a) => ((a._id === agentId || a.id === agentId) ? updated : a))
        );
        setEditingAgent(null);
      } else {
        alert('Failed to update agent profile');
      }
    } catch (err) {
      alert('Error updating agent profile');
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete agent
  const handleDelete = async (id, name) => {
    if (!confirm(`Delete agent profile for "${name}"?`)) return;
    try {
      await deleteAgent(id);
      setAgents((prev) => prev.filter((a) => (a._id !== id && a.id !== id)));
    } catch (err) {
      alert('Failed to delete agent');
    }
  };

  // Upload local photo for Add modal
  const handleAddPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) setNewAgent((prev) => ({ ...prev, photo: dataUrl }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Upload local photo for Edit modal
  const handleEditPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) setEditFormData((prev) => ({ ...prev, photo: dataUrl }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div>
      {/* Top Banner & Action */}
      <div className="admin-card" style={{ marginBottom: 24, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h3 className="admin-card-title">Real Estate Agents & Brokers Directory</h3>
            <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>
              Manage certified broker consultants, verified SuperAgents, contact links, and specialties.
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <PlusCircle size={16} />
            <span>Add New Agent</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B7280' }}>
          Loading agents...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {agents.map((agent) => (
            <div
              key={agent._id || agent.id}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: 14,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s',
              }}
            >
              {/* SuperAgent Badge */}
              {agent.isSuperAgent && (
                <div style={{ position: 'absolute', top: 16, right: 16 }}>
                  <span className="badge badge-super">
                    <Star size={11} fill="currentColor" />
                    <span>SuperAgent</span>
                  </span>
                </div>
              )}

              {/* Agent info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <img
                  src={agent.photo}
                  alt={agent.name}
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E5E7EB' }}
                />
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>
                    {agent.name}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>{agent.company}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: '0.82rem', fontWeight: 700, color: '#D97706' }}>
                    <Star size={13} fill="#D97706" />
                    <span>{agent.rating || 4.9}</span>
                    <span style={{ color: '#9CA3AF', fontWeight: 500 }}>
                      ({agent.closedDeals || 10} deals)
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 12, marginBottom: 16, fontSize: '0.84rem', color: '#4B5563', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div>Phone: <strong>{agent.phone}</strong></div>
                <div>Email: {agent.email}</div>
                <div>Specialties: {Array.isArray(agent.specialties) ? agent.specialties.join(', ') : agent.specialties}</div>
              </div>

              {/* Action Buttons: WhatsApp, Edit, Delete */}
              <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                <a
                  href={`https://wa.me/${agent.whatsapp || agent.phone?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-btn action-whatsapp"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem' }}
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp</span>
                </a>

                {/* EDIT AGENT BUTTON */}
                <button
                  type="button"
                  onClick={() => openEditModal(agent)}
                  className="admin-btn admin-btn-outline"
                  style={{ padding: '8px 14px', color: '#111827', display: 'flex', alignItems: 'center', gap: 5 }}
                  title="Edit Agent Profile"
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>

                {/* DELETE AGENT BUTTON */}
                <button
                  type="button"
                  onClick={() => handleDelete(agent._id || agent.id, agent.name)}
                  className="admin-btn admin-btn-danger"
                  style={{ padding: '8px 12px' }}
                  title="Remove Agent"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===================================================================
          EDIT AGENT MODAL
          =================================================================== */}
      {editingAgent && (
        <div className="modal-overlay" onClick={() => setEditingAgent(null)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Edit Agent Profile</h3>
                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  Updating details for {editingAgent.name}
                </span>
              </div>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setEditingAgent(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditSubmit} className="modal-body">
              {/* Profile Photo Preview & Edit */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, padding: 14, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8 }}>
                <img
                  src={editFormData.photo}
                  alt="Agent avatar"
                  style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '2px solid #7F51FF', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                    Profile Photo URL
                  </label>
                  <input
                    type="url"
                    required
                    value={editFormData.photo}
                    onChange={(e) => setEditFormData({ ...editFormData, photo: e.target.value })}
                    className="form-input"
                    style={{ height: 34, fontSize: '0.84rem', marginBottom: 6 }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <label 
                      className="admin-btn admin-btn-outline" 
                      style={{ fontSize: '0.74rem', padding: '4px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <Upload size={12} />
                      <span>Upload from Device</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleEditPhotoUpload} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>PNG, JPG or WebP</span>
                  </div>
                </div>
              </div>

              {/* Headshot Presets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#6B7280', marginRight: 4 }}>
                  Photo presets:
                </span>
                {AGENT_PHOTO_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    className="admin-preset-chip"
                    onClick={() => setEditFormData({ ...editFormData, photo: p.url })}
                  >
                    <Sparkles size={11} color="#7F51FF" />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>

              {/* Full Name & Agency */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Agency / Broker Company *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.company}
                    onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Contact Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. 18135550100"
                    value={editFormData.whatsapp}
                    onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Specialties */}
              <div className="form-group">
                <label className="form-label">Specialties (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Waterfront Villas, Bay Residences, Luxury Rentals"
                  value={editFormData.specialties}
                  onChange={(e) => setEditFormData({ ...editFormData, specialties: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Deals & Rating */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Closed Deals Count</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.closedDeals}
                    onChange={(e) => setEditFormData({ ...editFormData, closedDeals: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rating (e.g. 4.95)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="5"
                    value={editFormData.rating}
                    onChange={(e) => setEditFormData({ ...editFormData, rating: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* SuperAgent Badge Toggle */}
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="editIsSuperAgent"
                  checked={editFormData.isSuperAgent}
                  onChange={(e) => setEditFormData({ ...editFormData, isSuperAgent: e.target.checked })}
                  style={{ accentColor: '#7F51FF', width: 16, height: 16, cursor: 'pointer' }}
                />
                <label htmlFor="editIsSuperAgent" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827', cursor: 'pointer' }}>
                  Grant Verified SuperAgent Badge
                </label>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20, paddingTop: 14, borderTop: '1px solid #E5E7EB' }}>
                <button
                  type="button"
                  onClick={() => setEditingAgent(null)}
                  className="admin-btn admin-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="admin-btn admin-btn-primary"
                  style={{ minWidth: 140, justifyContent: 'center' }}
                >
                  {savingEdit ? 'Saving Changes...' : 'Save Agent Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          ADD AGENT MODAL
          =================================================================== */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Register New Agent</h3>
              <button type="button" className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAgentSubmit} className="modal-body">
              {/* Photo Preview & Presets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, padding: 14, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8 }}>
                <img
                  src={newAgent.photo}
                  alt="Agent avatar preview"
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #7F51FF', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                    Avatar Photo URL
                  </label>
                  <input
                    type="url"
                    required
                    value={newAgent.photo}
                    onChange={(e) => setNewAgent({ ...newAgent, photo: e.target.value })}
                    className="form-input"
                    style={{ height: 34, fontSize: '0.84rem', marginBottom: 6 }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <label 
                      className="admin-btn admin-btn-outline" 
                      style={{ fontSize: '0.74rem', padding: '4px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <Upload size={12} />
                      <span>Upload from Device</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAddPhotoUpload} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>PNG, JPG or WebP</span>
                  </div>
                </div>
              </div>

              {/* Headshot Presets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#6B7280', marginRight: 4 }}>
                  Photo presets:
                </span>
                {AGENT_PHOTO_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    className="admin-preset-chip"
                    onClick={() => setNewAgent({ ...newAgent, photo: p.url })}
                  >
                    <Sparkles size={11} color="#7F51FF" />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>

              {/* Name & Agency */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Vance"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Agency / Broker Company *</label>
                  <input
                    type="text"
                    required
                    value={newAgent.company}
                    onChange={(e) => setNewAgent({ ...newAgent, company: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newAgent.phone}
                    onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. 18135550100"
                    value={newAgent.whatsapp}
                    onChange={(e) => setNewAgent({ ...newAgent, whatsapp: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="agent@buytora.in"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Specialties (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Waterfront Villas, Bay Residences, Luxury Rentals"
                  value={newAgent.specialties}
                  onChange={(e) => setNewAgent({ ...newAgent, specialties: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="isSuperAgent"
                  checked={newAgent.isSuperAgent}
                  onChange={(e) => setNewAgent({ ...newAgent, isSuperAgent: e.target.checked })}
                  style={{ accentColor: '#7F51FF', width: 16, height: 16, cursor: 'pointer' }}
                />
                <label htmlFor="isSuperAgent" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827', cursor: 'pointer' }}>
                  Grant Verified SuperAgent Badge
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="admin-btn admin-btn-primary"
                style={{ width: '100%', justifyContent: 'center', height: 44, marginTop: 10 }}
              >
                {submitting ? 'Registering Agent...' : 'Add Agent Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
