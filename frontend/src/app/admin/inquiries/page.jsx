'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  fetchInquiries, 
  updateInquiryStatus, 
  deleteInquiry 
} from '../../../lib/api';
import { 
  MessageSquare, 
  MessageCircle, 
  Phone, 
  Mail, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Building, 
  Search, 
  Filter 
} from 'lucide-react';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const data = await fetchInquiries();
      setInquiries(data);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    // Optimistic UI update
    setInquiries((prev) =>
      prev.map((inq) => (inq._id === id ? { ...inq, status: newStatus } : inq))
    );
    try {
      await updateInquiryStatus(id, newStatus);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete inquiry from ${name}?`)) return;
    try {
      await deleteInquiry(id);
      setInquiries((prev) => prev.filter((inq) => inq._id !== id));
    } catch (err) {
      alert('Failed to delete inquiry');
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      inq.name?.toLowerCase().includes(s) ||
      inq.phone?.includes(s) ||
      inq.email?.toLowerCase().includes(s) ||
      inq.propertyTitle?.toLowerCase().includes(s) ||
      inq.propertyRef?.toLowerCase().includes(s);

    const matchesStatus =
      statusFilter === 'all' || inq.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const newCount = inquiries.filter((i) => i.status === 'new').length;
  const contactedCount = inquiries.filter((i) => i.status === 'contacted').length;
  const closedCount = inquiries.filter((i) => i.status === 'closed').length;

  return (
    <div>
      {/* Top Filter and Search */}
      <div className="admin-card" style={{ marginBottom: 24, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`admin-btn ${statusFilter === 'all' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
              onClick={() => setStatusFilter('all')}
            >
              All Leads ({inquiries.length})
            </button>
            <button
              type="button"
              className={`admin-btn ${statusFilter === 'new' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
              onClick={() => setStatusFilter('new')}
            >
              New Leads ({newCount})
            </button>
            <button
              type="button"
              className={`admin-btn ${statusFilter === 'contacted' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
              onClick={() => setStatusFilter('contacted')}
            >
              Contacted ({contactedCount})
            </button>
            <button
              type="button"
              className={`admin-btn ${statusFilter === 'closed' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
              onClick={() => setStatusFilter('closed')}
            >
              Closed / Dealt ({closedCount})
            </button>
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', minWidth: 260 }}>
            <input
              type="text"
              placeholder="Search by client, phone, or Ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 36, height: 38 }}
            />
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 11 }} />
          </div>
        </div>
      </div>

      {/* Inquiries Table Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Client Leads & Messages</h3>
            <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>
              Real-time enquiries submitted via listing forms, WhatsApp links, and direct consultations
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B7280' }}>
            Loading inquiries...
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
            No client inquiries found matching criteria.
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Property Interested</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map((inq) => (
                  <tr key={inq._id}>
                    {/* Client Info */}
                    <td>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>
                        {inq.name}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#4B5563', marginTop: 2 }}>
                        {inq.phone}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                        {inq.email}
                      </div>
                    </td>

                    {/* Target Property */}
                    <td>
                      <div style={{ fontWeight: 600, maxWidth: 220, color: '#1F2937' }}>
                        {inq.propertyTitle}
                      </div>
                      {inq.propertyRef && (
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 2 }}>
                          Ref: <strong style={{ color: '#EF5E4E' }}>{inq.propertyRef}</strong>
                        </div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'capitalize' }}>
                        Channel: {inq.inquiryType || 'Email Form'}
                      </div>
                    </td>

                    {/* Message */}
                    <td>
                      <p style={{ maxWidth: 300, fontSize: '0.86rem', color: '#4B5563', lineHeight: 1.4, background: '#F9FAFB', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                        "{inq.message}"
                      </p>
                    </td>

                    {/* Date */}
                    <td>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
                        {new Date(inq.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#9CA3AF' }}>
                        {new Date(inq.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td>
                      <select
                        value={inq.status || 'new'}
                        onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          outline: 'none',
                          border: '1px solid #D1D5DB',
                          background:
                            inq.status === 'new'
                              ? '#FEF3C7'
                              : inq.status === 'contacted'
                              ? '#DBEAFE'
                              : '#F3F4F6',
                          color:
                            inq.status === 'new'
                              ? '#92400E'
                              : inq.status === 'contacted'
                              ? '#1E40AF'
                              : '#374151',
                        }}
                      >
                        <option value="new">● New Lead</option>
                        <option value="contacted">● Contacted</option>
                        <option value="closed">● Closed / Dealt</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <a
                          href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(inq.name)},%20I%20am%20following%20up%20on%20your%20inquiry%20regarding%20${encodeURIComponent(inq.propertyTitle || 'our property')}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-btn action-whatsapp"
                          style={{ padding: '6px 10px', fontSize: '0.78rem', borderRadius: 6 }}
                          title="Contact via WhatsApp"
                        >
                          <MessageCircle size={14} />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={`tel:${inq.phone}`}
                          className="admin-btn admin-btn-outline"
                          style={{ padding: '6px' }}
                          title="Call Client"
                        >
                          <Phone size={14} />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDelete(inq._id, inq.name)}
                          className="admin-btn admin-btn-danger"
                          style={{ padding: '6px' }}
                          title="Delete Lead"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
