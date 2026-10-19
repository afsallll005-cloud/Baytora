'use client';

import { useState, useEffect } from 'react';
import { submitInquiry } from '../lib/api';
import { getCurrentUser } from '../lib/auth';
import { CheckCircle2, Mail, Phone, User, MessageSquare } from 'lucide-react';
import './ContactModal.css';

export default function ContactModal({ property, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: property 
      ? `Hi, I found your property "${property.title}" (Ref: ${property.referenceNumber || 'N/A'}) on Buytora. Please contact me with more information.`
      : 'Hi, I would like to inquire about rental properties on Buytora.',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const user = getCurrentUser();
      if (user) {
        setFormData((prev) => ({
          ...prev,
          name: prev.name || user.name || '',
          email: prev.email || user.email || '',
          phone: prev.phone || user.phone || '',
        }));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        propertyId: property?._id,
        propertyTitle: property?.title,
        propertyRef: property?.referenceNumber,
        inquiryType: 'email',
      };

      await submitInquiry(payload);
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Email Agent</h3>
            {property && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Ref: {property.referenceNumber || 'RH-01'} • {property.location?.city}
              </p>
            )}
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ 
                width: 64, 
                height: 64, 
                background: 'var(--verified-bg)', 
                color: 'var(--verified-green)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 16px' 
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>
                Your message is on its way!
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginBottom: 24 }}>
                The agent has received your details and will call or message you back shortly.
              </p>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={onClose}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ padding: '10px 14px', background: '#FDE8E8', color: '#9B1C1C', borderRadius: 8, marginBottom: 16, fontSize: '0.88rem' }}>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Your Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Faisal Al-Zayani"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone / WhatsApp Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+973 3XXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="form-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 12, height: 46 }}
              >
                {submitting ? 'Sending...' : 'Send Message to Agent'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
