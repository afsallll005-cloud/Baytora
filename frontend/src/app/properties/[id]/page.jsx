'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Bed, 
  Bath, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Check, 
  ArrowLeft,
  Camera,
  ExternalLink,
  Phone,
  MessageCircle,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { fetchPropertyById, submitInquiry, fetchProperties, fetchAgents } from '../../../lib/api';
import { getCurrentUser } from '../../../lib/auth';
import PropertyCard from '../../../components/PropertyCard';
import './PropertyDetail.css';

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarProperties, setSimilarProperties] = useState([]);

  // Accordion open/close states
  const [openAccordion, setOpenAccordion] = useState('details');

  // Inquiry form states
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        setLoading(true);
        const [data, agentsData, res] = await Promise.all([
          fetchPropertyById(id),
          fetchAgents().catch(() => []),
          fetchProperties().catch(() => ({ data: [] })),
        ]);

        if (data) {
          // If fresh agents list has a matching agent, merge the latest details
          if (Array.isArray(agentsData) && agentsData.length > 0 && data.agent) {
            const matched = agentsData.find(
              (a) =>
                (data.agent._id && (String(a._id) === String(data.agent._id) || String(a.id) === String(data.agent._id))) ||
                (data.agent.email && a.email?.toLowerCase() === data.agent.email?.toLowerCase()) ||
                (data.agent.name && a.name?.toLowerCase() === data.agent.name?.toLowerCase())
            );
            if (matched) {
              data.agent = {
                ...data.agent,
                ...matched,
              };
              if (matched.isSuperAgent !== undefined) {
                data.isSuperAgent = !!matched.isSuperAgent;
              }
            }
          }

          setProperty(data);
          setInquiryMessage(
            `Hi, I am interested in "${data.title}" in ${data.location?.city || 'Florida'}. Please contact me to schedule a private viewing.`
          );
        }

        if (res && res.data) {
          setSimilarProperties(res.data.filter(p => p._id !== id).slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching property detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Auto-fill logged in user details into inquiry form
    const user = getCurrentUser();
    if (user) {
      if (user.name) setInquiryName(user.name);
      if (user.email) setInquiryEmail(user.email);
    }
  }, [id]);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim()) return;

    setSubmitting(true);
    try {
      await submitInquiry({
        propertyId: property?._id,
        propertyTitle: property?.title,
        propertyRef: property?.referenceNumber,
        name: inquiryName,
        email: inquiryEmail,
        message: inquiryMessage,
        inquiryType: 'email',
      });
      setSubmitted(true);
    } catch (err) {
      alert('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="lux-detail-page">
        <div className="lux-detail-container" style={{ padding: '120px 20px', textAlign: 'center', color: '#6B7280' }}>
          <p>Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="lux-detail-page">
        <div className="lux-detail-container" style={{ padding: '100px 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, color: '#111112' }}>Property Not Found</h2>
          <p style={{ color: 'rgba(0,0,0,0.6)', margin: '14px 0 28px' }}>
            The requested listing may have expired or been removed.
          </p>
          <Link href="/properties" className="btn-primary">
            Back to All Listings
          </Link>
        </div>
      </div>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85'
      ];

  const mainImage = images[0];
  const sideImage1 = images[1] || images[0];
  const sideImage2 = images[2] || sideImage1;

  // Format Price
  const isUSD = property.currency === 'USD' || property.currency === '$';
  const currencyPrefix = isUSD ? '$' : `${property.currency || 'BHD'} `;
  const formattedPrice = property.category === 'rent'
    ? `${currencyPrefix}${property.price?.toLocaleString()}${property.pricePeriod === 'yearly' ? '/yr' : '/mo'}`
    : `${currencyPrefix}${property.price?.toLocaleString()}`;

  const areaSqft = property.areaSqft || (property.area ? Math.round(property.area * 10.764) : 680);
  const locationText = `${property.location?.city || 'Tampa'}, ${property.location?.governorate ? property.location.governorate.replace(' Governorate', '') : 'FL'}`;

  const agent = property.agent || {
    name: 'Emily Carter',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    company: 'RentelHome Verified Broker',
    rating: 4.95,
    closedDeals: 24,
    phone: '+1 (813) 555-0100',
    whatsapp: '18135550100',
    email: 'emily@rentelhome.com',
    isSuperAgent: true,
  };

  const amenities = property.amenities && property.amenities.length > 0 
    ? property.amenities 
    : ['High-end appliances', 'Outdoor kitchen', 'Walk-in pantry', 'Hardwood floors', 'Smart thermostat', 'Designer lighting', 'Rooftop terrace', 'Private pool'];

  return (
    <div className="lux-detail-page">
      <div className="lux-detail-container">
        {/* Back link */}
        <div style={{ marginBottom: 20 }}>
          <Link 
            href="/properties" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 6, 
              fontSize: '0.88rem', 
              color: 'rgba(0,0,0,0.65)',
              fontWeight: 500,
              letterSpacing: '-0.2px'
            }}
          >
            <ArrowLeft size={15} />
            <span>Back to listings</span>
          </Link>
        </div>

        {/* 1. Hero Gallery Grid (65% / 35% Split) */}
        <div className="lux-hero-gallery" id="images">
          <div className="lux-gallery-main">
            <img src={mainImage} alt={property.title} />
          </div>
          <div className="lux-gallery-side">
            <div className="lux-gallery-side-item">
              <img src={sideImage1} alt={`${property.title} view 2`} />
            </div>
            <div className="lux-gallery-side-item">
              <img src={sideImage2} alt={`${property.title} view 3`} />
              <button 
                type="button" 
                className="lux-gallery-btn"
                onClick={() => {
                  const el = document.getElementById('lux-gallery-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Camera size={14} />
                <span>Show all images ({images.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Main Content Split Layout */}
        <div className="lux-content-layout">
          {/* Left Column: Details & Accordions */}
          <div className="lux-details-col">
            {/* Header: Title, Location & Price */}
            <div>
              <div className="lux-location-tag">
                <MapPin size={15} color="#7F51FF" />
                <span>{property.location?.address || locationText}</span>
              </div>

              <div className="lux-header-row">
                <h1 className="lux-property-title">{property.title}</h1>
                <div className="lux-price-wrapper">
                  <div className="lux-price-label">Listing price</div>
                  <div className="lux-price-val">{formattedPrice}</div>
                </div>
              </div>
            </div>

            {/* Horizontal Specs Bar */}
            <div className="lux-specs-bar">
              <div className="lux-spec-cell">
                <span className="lux-spec-cell-label">Size (sq ft)</span>
                <span className="lux-spec-cell-val">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 8V4h4" />
                    <path d="M20 8V4h-4" />
                    <path d="M4 16v4h4" />
                    <path d="M20 16v4h-4" />
                  </svg>
                  <span>{areaSqft}</span>
                </span>
              </div>

              <div className="lux-spec-cell">
                <span className="lux-spec-cell-label">Beds</span>
                <span className="lux-spec-cell-val">
                  <Bed size={16} strokeWidth={2} />
                  <span>{property.bedrooms ?? 3}</span>
                </span>
              </div>

              <div className="lux-spec-cell">
                <span className="lux-spec-cell-label">Bath</span>
                <span className="lux-spec-cell-val">
                  <Bath size={16} strokeWidth={2} />
                  <span>{property.bathrooms ?? 2.5}</span>
                </span>
              </div>

              <div className="lux-spec-cell">
                <span className="lux-spec-cell-label">Type</span>
                <span className="lux-spec-cell-val">
                  <span>{property.propertyType || 'Apartment'}</span>
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="lux-section-heading">Description</h2>
              <p className="lux-description-text">
                {property.description || 
                  'A sleek contemporary retreat with high ceilings, refined finishes, and expansive windows bringing natural light throughout. Designed for those seeking premium comfort and quick access to the vibrant cultural scene.'}
              </p>
            </div>

            {/* Accordions Group */}
            <div className="lux-accordions-group">
              {/* Accordion 1: Property Details */}
              <div className="lux-accordion-item">
                <button 
                  type="button" 
                  className="lux-accordion-btn"
                  onClick={() => setOpenAccordion(openAccordion === 'details' ? '' : 'details')}
                >
                  <span className="lux-accordion-title">Property details</span>
                  {openAccordion === 'details' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openAccordion === 'details' && (
                  <div className="lux-accordion-content">
                    <ul className="lux-features-list">
                      <li className="lux-feature-bullet">{property.bedrooms} Bedrooms</li>
                      <li className="lux-feature-bullet">{property.bathrooms} Bathrooms</li>
                      <li className="lux-feature-bullet">{areaSqft} Total Square Feet</li>
                      <li className="lux-feature-bullet">Category: For {property.category}</li>
                      <li className="lux-feature-bullet">Furnishing: {property.furnished || 'Furnished'}</li>
                      <li className="lux-feature-bullet">Reference: {property.referenceNumber || 'RH-835000'}</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 2: Location & Surroundings */}
              <div className="lux-accordion-item">
                <button 
                  type="button" 
                  className="lux-accordion-btn"
                  onClick={() => setOpenAccordion(openAccordion === 'location' ? '' : 'location')}
                >
                  <span className="lux-accordion-title">Location &amp; Surroundings</span>
                  {openAccordion === 'location' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openAccordion === 'location' && (
                  <div className="lux-accordion-content">
                    <p style={{ margin: 0 }}>
                      Located in one of the most desirable walkable areas of {property.location?.city || 'the city'}, offering boutique shopping, fine dining, outdoor recreation, and quick proximity to top-rated entertainment and lifestyle venues.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Features & Amenities */}
              <div className="lux-accordion-item">
                <button 
                  type="button" 
                  className="lux-accordion-btn"
                  onClick={() => setOpenAccordion(openAccordion === 'amenities' ? '' : 'amenities')}
                >
                  <span className="lux-accordion-title">Features &amp; Amenities</span>
                  {openAccordion === 'amenities' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openAccordion === 'amenities' && (
                  <div className="lux-accordion-content">
                    <ul className="lux-features-list">
                      {amenities.map((item, i) => (
                        <li key={i} className="lux-feature-bullet">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Section */}
            <div className="lux-gallery-section" id="lux-gallery-section">
              <h2 className="lux-section-heading">Gallery</h2>
              <div className="lux-gallery-grid-2col">
                {images.map((imgUrl, i) => (
                  <div key={i} className="lux-gallery-photo">
                    <img src={imgUrl} alt={`${property.title} gallery photo ${i + 1}`} loading="lazy" />
                  </div>
                ))}
              </div>
            </div>

            {/* Location Map */}
            <div style={{ paddingTop: 10 }}>
              <h2 className="lux-section-heading">Location map</h2>
              <div className="lux-map-container">
                <iframe
                  src={`https://maps.google.com/maps?q=${
                    property.location?.coordinates?.lat && property.location?.coordinates?.lng
                      ? `${property.location.coordinates.lat},${property.location.coordinates.lng}`
                      : encodeURIComponent(`${property.location?.address ? property.location.address + ', ' : ''}${property.location?.city || 'Tampa'}, FL`)
                  }&z=14&output=embed`}
                  style={{ width: '100%', height: '100%', border: 0 }}
                  title="Property Location Map"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Contact Card Track */}
          <aside className="lux-sidebar-col" id="contact-agent-section">
            <div className="lux-contact-card">
            {/* Agent info */}
            <div className="lux-agent-row">
              <img 
                src={agent.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80'} 
                alt={agent.name} 
                className="lux-agent-photo"
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                  <h3 className="lux-agent-name" style={{ margin: 0 }}>{agent.name}</h3>
                  {agent.isSuperAgent && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      background: 'linear-gradient(135deg, #7F51FF 0%, #632DF8 100%)',
                      color: '#FFFFFF',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 12,
                      letterSpacing: '0.2px',
                    }}>
                      <Star size={10} fill="#FFFFFF" />
                      SuperAgent
                    </span>
                  )}
                </div>

                <div className="lux-agent-company" style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: 4 }}>
                  {agent.company || 'RentelHome Verified Broker'}
                </div>

                <div className="lux-agent-rating">
                  <Star size={13} fill="#EAB308" color="#EAB308" />
                  <span style={{ fontWeight: 700, color: '#111112' }}>{agent.rating ? Number(agent.rating).toFixed(1) : '4.9'}</span>
                  <span style={{ color: 'rgba(0,0,0,0.5)' }}>• {agent.closedDeals ? `${agent.closedDeals} deals` : 'Verified Broker'}</span>
                </div>
              </div>
            </div>

            {/* Quick Agent Actions: WhatsApp & Call */}
            {(agent.phone || agent.whatsapp) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                <a
                  href={`https://wa.me/${agent.whatsapp || agent.phone?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lux-quick-btn lux-whatsapp-btn"
                  title="Chat directly on WhatsApp"
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`tel:${agent.phone || ''}`}
                  className="lux-quick-btn lux-call-btn"
                  title={`Call ${agent.name}`}
                >
                  <Phone size={15} />
                  <span>Call Agent</span>
                </a>
              </div>
            )}

            {/* Form */}
            {submitted ? (
              <div style={{
                background: '#ECFDF5',
                padding: '24px',
                borderRadius: 2,
                textAlign: 'center',
                color: '#065F46'
              }}>
                <Check size={28} color="#10B981" style={{ margin: '0 auto 8px' }} />
                <h4 style={{ margin: '0 0 6px', fontWeight: 700 }}>Inquiry Sent!</h4>
                <p style={{ margin: 0, fontSize: '0.88rem' }}>
                  The agent will contact you shortly regarding <strong>{property.title}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="lux-contact-form">
                <div>
                  <label className="lux-form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Smith"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className="lux-form-input"
                  />
                </div>

                <div>
                  <label className="lux-form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    className="lux-form-input"
                  />
                </div>

                <div>
                  <label className="lux-form-label">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="lux-form-textarea"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="lux-submit-btn"
                >
                  {submitting ? 'Sending...' : 'Submit Inquiry'}
                </button>
              </form>
            )}
            </div>
          </aside>
        </div>

        {/* 3. More Listings Section (Matching Luxterra Footer Section) */}
        {similarProperties.length > 0 && (
          <div style={{ marginTop: 100, paddingTop: 60, borderTop: '1px solid #EAEAEA' }}>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
                maxWidth: 600,
                margin: '0 auto 14px',
              }}>
                <span style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '0 16px',
                  color: 'rgba(0,0,0,0.62)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  letterSpacing: '-0.2px',
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7F51FF', display: 'inline-block' }} />
                  <span>Our properties</span>
                </div>
                <span style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
              </div>

              <h2 style={{
                fontSize: 'clamp(34px, 4vw, 52px)',
                fontWeight: 450,
                color: '#111112',
                letterSpacing: '-0.06em',
                margin: 0,
              }}>
                More listings
              </h2>
            </div>

            <div className="properties-grid">
              {similarProperties.map((prop) => (
                <PropertyCard key={prop._id} property={prop} />
              ))}
            </div>
          </div>
        )}

        {/* Mobile Sticky Floating Contact Bar */}
        <div className="lux-mobile-bottom-bar">
          <div className="lux-mobile-bar-info">
            <span className="lux-mobile-bar-price">{formattedPrice}</span>
            <span className="lux-mobile-bar-agent">{agent.name}</span>
          </div>
          <div className="lux-mobile-bar-actions">
            {agent.whatsapp && (
              <a
                href={`https://wa.me/${agent.whatsapp || agent.phone?.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="lux-mobile-action-btn lux-mobile-whatsapp-btn"
                title="WhatsApp Agent"
              >
                <MessageCircle size={18} />
              </a>
            )}
            {agent.phone && (
              <a
                href={`tel:${agent.phone}`}
                className="lux-mobile-action-btn lux-mobile-call-btn"
                title="Call Agent"
              >
                <Phone size={18} />
              </a>
            )}
            <button
              type="button"
              className="lux-mobile-inquire-btn"
              onClick={() => {
                const el = document.getElementById('contact-agent-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Inquire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
