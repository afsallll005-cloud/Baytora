'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createProperty } from '../../lib/api';
import { getCurrentUser } from '../../lib/auth';
import { 
  PlusCircle, 
  CheckCircle2, 
  Building, 
  MapPin, 
  DollarSign, 
  Bed, 
  Bath, 
  Maximize, 
  ArrowRight,
  Navigation,
  Compass,
  Crosshair,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
  Home,
  Check
} from 'lucide-react';
import './AddProperty.css';

const commonAmenities = [
  'Central A/C',
  'Balcony',
  'Shared Pool',
  'Shared Gym',
  'Covered Parking',
  'View of Water',
  'View of Landmark',
  'Maids Room',
  'Pets Allowed',
  'Built in Wardrobes',
  'Walk-in Closet',
  'Built in Kitchen Appliances'
];

const CITY_PRESETS = [
  { city: 'Tampa', state: 'Florida', lat: 27.9506, lng: -82.4572 },
  { city: 'Miami', state: 'Florida', lat: 25.7617, lng: -80.1918 },
  { city: 'Orlando', state: 'Florida', lat: 28.5383, lng: -81.3792 },
  { city: 'Jacksonville', state: 'Florida', lat: 30.3322, lng: -81.6557 },
  { city: 'Fort Lauderdale', state: 'Florida', lat: 26.1224, lng: -80.1373 },
  { city: 'Naples', state: 'Florida', lat: 26.1420, lng: -81.7948 },
  { city: 'St. Petersburg', state: 'Florida', lat: 27.7676, lng: -82.6403 },
  { city: 'Al Juffair', state: 'Capital Governorate', lat: 26.2167, lng: 50.6000 },
];

export default function AddPropertyPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'rent',
    propertyType: 'Apartment',
    price: '',
    pricePeriod: 'monthly',
    currency: 'USD',
    bedrooms: 2,
    bathrooms: 2,
    area: '',
    location: {
      governorate: 'Florida',
      city: 'Tampa',
      building: '',
      address: '',
      coordinates: {
        lat: 27.9506,
        lng: -82.4572,
      },
    },
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Central A/C', 'Balcony', 'Shared Pool', 'Shared Gym', 'Covered Parking'],
    furnished: 'Furnished',
    agent: {
      name: 'Owner / Agent',
      phone: '+1 (813) 555-0100',
      whatsapp: '18135550100',
      email: 'agent@baytora.com',
      company: 'Baytora Partner Broker',
    }
  });

  // Map Marked Area States
  const [mapMode, setMapMode] = useState('interactive'); // 'interactive' or 'satellite'
  const [pinPercent, setPinPercent] = useState({ x: 50, y: 50 });
  const [zoomLevel, setZoomLevel] = useState(14);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdId, setCreatedId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setFormData((prev) => ({
        ...prev,
        agent: {
          ...prev.agent,
          name: user.name || prev.agent.name,
          email: user.email || prev.agent.email,
          phone: user.phone || prev.agent.phone,
          company: user.role === 'agent' ? 'Baytora Verified Broker' : 'Verified Owner / Client',
        }
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value }
      }));
    } else if (name.startsWith('agent.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        agent: { ...prev.agent, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleToggleAmenity = (amenity) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists 
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  const handleAddImage = () => {
    if (imageUrlInput.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrlInput.trim()]
      }));
      setImageUrlInput('');
    }
  };

  // Click on interactive map to position marker
  const handleMapStageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const pctX = Math.max(6, Math.min(94, (clickX / rect.width) * 100));
    const pctY = Math.max(10, Math.min(92, (clickY / rect.height) * 100));
    setPinPercent({ x: pctX, y: pctY });

    // Derive subtle coordinate shift based on click offset from center
    const currentLat = formData.location.coordinates?.lat || 27.9506;
    const currentLng = formData.location.coordinates?.lng || -82.4572;

    const span = 0.08 * (14 / zoomLevel);
    const offsetLng = ((pctX - 50) / 100) * span;
    const offsetLat = ((50 - pctY) / 100) * span;

    const newLat = parseFloat((currentLat + offsetLat).toFixed(5));
    const newLng = parseFloat((currentLng + offsetLng).toFixed(5));

    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: { lat: newLat, lng: newLng }
      }
    }));
    setLocationMessage(`Pinned location: ${newLat}, ${newLng}`);
    setTimeout(() => setLocationMessage(''), 3000);
  };

  // City preset selection
  const handleSelectCityPreset = (preset) => {
    setPinPercent({ x: 50, y: 50 });
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        city: preset.city,
        governorate: preset.state,
        coordinates: { lat: preset.lat, lng: preset.lng }
      }
    }));
    setLocationMessage(`Location set to ${preset.city}, ${preset.state}`);
    setTimeout(() => setLocationMessage(''), 2500);
  };

  // GPS Device Locate
  const handleDetectGPS = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(5));
        const lng = parseFloat(pos.coords.longitude.toFixed(5));
        setPinPercent({ x: 50, y: 50 });
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: { lat, lng }
          }
        }));
        setIsLocating(false);
        setLocationMessage(`Marked at your device coordinates: ${lat}, ${lng}`);
        setTimeout(() => setLocationMessage(''), 3500);
      },
      (err) => {
        setIsLocating(false);
        alert('Could not retrieve your location. Please check browser GPS permissions.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Direct numeric coordinate adjustment
  const handleCoordinateInput = (field, val) => {
    const num = parseFloat(val);
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: {
          ...prev.location.coordinates,
          [field]: isNaN(num) ? 0 : num
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await createProperty(formData);
      if (res && res.data) {
        setCreatedId(res.data._id);
        setSuccess(true);
      } else {
        throw new Error(res.message || 'Failed to list property');
      }
    } catch (err) {
      setError(err.message || 'Failed to list property. Check required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentLat = formData.location.coordinates?.lat || 27.9506;
  const currentLng = formData.location.coordinates?.lng || -82.4572;

  return (
    <div className="container" style={{ padding: '40px 20px 80px', maxWidth: 880 }}>
      {/* Page Title */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h1 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#111112', letterSpacing: '-0.5px', marginBottom: 8 }}>
          List Your Property on Baytora
        </h1>
        <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: '1rem', letterSpacing: '-0.2px' }}>
          Reach thousands of qualified buyers, tenants, and investors across Florida & international hubs.
        </p>
      </div>

      {success ? (
        <div style={{ background: '#FFFFFF', border: '1px solid #EAEAEA', borderRadius: 4, padding: 48, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111112', marginBottom: 10 }}>
            Property Listed Successfully!
          </h2>
          <p style={{ color: 'rgba(0,0,0,0.6)', maxWidth: 480, margin: '0 auto 28px' }}>
            Your property and its marked location coordinates ({currentLat}, {currentLng}) have been recorded and are now live on the marketplace.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={() => router.push(`/properties/${createdId}`)}
            >
              <span>View Property Listing</span>
              <ArrowRight size={16} />
            </button>
            <button 
              type="button" 
              className="btn-outline" 
              onClick={() => { setSuccess(false); setFormData({ ...formData, title: '' }); }}
            >
              Add Another Listing
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ background: '#FFFFFF', border: '1px solid #EAEAEA', borderRadius: 4, padding: '36px 32px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          {error && (
            <div style={{ padding: '12px 16px', background: '#FDE8E8', color: '#9B1C1C', borderRadius: 3, marginBottom: 24, fontSize: '0.92rem', fontWeight: 500 }}>
              {error}
            </div>
          )}

          {/* Section 1: Overview */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111112', marginBottom: 16, borderBottom: '1px solid #EAEAEA', paddingBottom: 10, letterSpacing: '-0.3px' }}>
              1. General Information
            </h3>

            <div className="form-group">
              <label className="form-label">Property Title *</label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Modern Waterfront Residence with Panoramic Bay Views"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} className="form-select">
                  <option value="rent">For Rent</option>
                  <option value="buy">For Sale (Buy)</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Property Type *</label>
                <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="form-select">
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Duplex">Duplex</option>
                  <option value="Studio">Studio</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Description *</label>
              <textarea
                name="description"
                required
                rows={4}
                placeholder="Describe key selling points, interior architecture, terrace views, nearby amenities, and private parking..."
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
              />
            </div>
          </div>

          {/* Section 2: Pricing & Specs */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111112', marginBottom: 16, borderBottom: '1px solid #EAEAEA', paddingBottom: 10, letterSpacing: '-0.3px' }}>
              2. Pricing & Dimensions
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Price *</label>
                <input
                  type="number"
                  name="price"
                  required
                  placeholder="e.g. 850000"
                  value={formData.price}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Period</label>
                <select name="pricePeriod" value={formData.pricePeriod} onChange={handleChange} className="form-select">
                  <option value="monthly">/ Month</option>
                  <option value="yearly">/ Year</option>
                  <option value="weekly">/ Week</option>
                  <option value="daily">/ Day</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Currency</label>
                <select name="currency" value={formData.currency} onChange={handleChange} className="form-select">
                  <option value="USD">USD ($)</option>
                  <option value="BHD">BHD</option>
                  <option value="AED">AED</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Bedrooms</label>
                <select name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="form-select">
                  <option value={0}>Studio (0)</option>
                  <option value={1}>1 Bed</option>
                  <option value={2}>2 Beds</option>
                  <option value={3}>3 Beds</option>
                  <option value={4}>4 Beds</option>
                  <option value={5}>5+ Beds</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Bathrooms</label>
                <select name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="form-select">
                  <option value={1}>1 Bath</option>
                  <option value={2}>2 Baths</option>
                  <option value={3}>3 Baths</option>
                  <option value={4}>4 Baths</option>
                  <option value={5}>5+ Baths</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Area (sqm) *</label>
                <input
                  type="number"
                  name="area"
                  required
                  placeholder="e.g. 240"
                  value={formData.area}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Furnishing</label>
                <select name="furnished" value={formData.furnished} onChange={handleChange} className="form-select">
                  <option value="Furnished">Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Location & Marked Area */}
          <div style={{ marginBottom: 36 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111112', marginBottom: 16, borderBottom: '1px solid #EAEAEA', paddingBottom: 10, letterSpacing: '-0.3px' }}>
              3. Location & Marked Map Area
            </h3>

            {/* Address Form Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">State / Governorate *</label>
                <input
                  type="text"
                  name="location.governorate"
                  required
                  placeholder="e.g. Florida"
                  value={formData.location.governorate}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">City / Community *</label>
                <input
                  type="text"
                  name="location.city"
                  required
                  placeholder="e.g. Tampa, Miami, Orlando"
                  value={formData.location.city}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Building / Community Name</label>
                <input
                  type="text"
                  name="location.building"
                  placeholder="e.g. The Pearl Residences, Tower B"
                  value={formData.location.building}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Street / Block / Address</label>
                <input
                  type="text"
                  name="location.address"
                  placeholder="e.g. 105 Bayshore Blvd, Suite 14A"
                  value={formData.location.address}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* LOCATION MARKED AREA COMPONENT */}
            <div className="location-marker-card">
              {/* Card Header */}
              <div className="marker-card-header">
                <div className="marker-title-group">
                  <div className="marker-icon-badge">
                    <MapPin size={18} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="marker-card-title">Location Marked Area</h4>
                    <p className="marker-card-subtitle">
                      Click anywhere on the map surface to drop the marker pin on your exact property coordinates.
                    </p>
                  </div>
                </div>

                <div className="marker-status-chip">
                  <Check size={12} strokeWidth={3} />
                  <span>Marked: {currentLat}, {currentLng}</span>
                </div>
              </div>

              {/* Toolbar Controls */}
              <div className="marker-toolbar">
                {/* City Preset Chips */}
                <div className="marker-city-presets">
                  <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700, color: 'rgba(0,0,0,0.45)', marginRight: 4 }}>
                    Quick presets:
                  </span>
                  {CITY_PRESETS.map((preset) => {
                    const isSelected = formData.location.city.toLowerCase() === preset.city.toLowerCase();
                    return (
                      <button
                        key={preset.city}
                        type="button"
                        className={`preset-chip-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => handleSelectCityPreset(preset)}
                      >
                        {preset.city}
                      </button>
                    );
                  })}
                </div>

                {/* Actions: GPS & Mode Toggle */}
                <div className="marker-action-buttons">
                  <button
                    type="button"
                    className="marker-action-btn marker-locate-btn"
                    onClick={handleDetectGPS}
                    disabled={isLocating}
                    title="Mark location using device GPS"
                  >
                    <Navigation size={14} className={isLocating ? 'spin' : ''} />
                    <span>{isLocating ? 'Detecting...' : 'Mark Current GPS'}</span>
                  </button>

                  <button
                    type="button"
                    className={`marker-action-btn ${mapMode === 'interactive' ? 'active' : ''}`}
                    onClick={() => setMapMode('interactive')}
                    title="Interactive click-to-pin canvas"
                  >
                    <Crosshair size={14} />
                    <span>Interactive Pin Map</span>
                  </button>

                  <button
                    type="button"
                    className={`marker-action-btn ${mapMode === 'satellite' ? 'active' : ''}`}
                    onClick={() => setMapMode('satellite')}
                    title="Live Google Satellite & Street View"
                  >
                    <Layers size={14} />
                    <span>Satellite View</span>
                  </button>
                </div>
              </div>

              {/* Interactive Map Stage */}
              {mapMode === 'interactive' ? (
                <div 
                  className="marker-map-stage"
                  onClick={handleMapStageClick}
                  title="Click to reposition property pin"
                >
                  {/* Subtle Grid Pattern */}
                  <div className="marker-grid-canvas" />

                  {/* Dark Map Vector Styling Backdrop */}
                  <div 
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(ellipse at center, #27282c 0%, #17181a 100%)',
                      opacity: 0.95
                    }}
                  />

                  {/* Visual Roads & Waterway Accents */}
                  <svg 
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.28 }}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M0,190 Q220,120 440,240 T880,180" stroke="#7F51FF" strokeWidth="2.5" fill="none" />
                    <path d="M0,80 Q300,160 600,60 T900,140" stroke="#ffffff" strokeWidth="1" fill="none" />
                    <path d="M0,280 Q250,220 520,310 T900,260" stroke="#ffffff" strokeWidth="1" fill="none" />
                    <circle cx="50%" cy="50%" r="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" fill="none" />
                    <circle cx="50%" cy="50%" r="160" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" fill="none" />
                  </svg>

                  {/* Overlay Crosshairs through Pin */}
                  <div className="crosshair-h" style={{ top: `${pinPercent.y}%` }} />
                  <div className="crosshair-v" style={{ left: `${pinPercent.x}%` }} />

                  {/* Floating Hint Banner */}
                  <div className="marker-map-hint">
                    <span className="hint-dot" />
                    <span>
                      {locationMessage || 'Click anywhere to reposition marker on exact parcel'}
                    </span>
                  </div>

                  {/* Zoom Controls */}
                  <div className="marker-map-controls" onClick={(e) => e.stopPropagation()}>
                    <button 
                      type="button" 
                      className="map-control-btn"
                      onClick={() => setZoomLevel(prev => Math.min(18, prev + 1))}
                      title="Zoom In"
                    >
                      <ZoomIn size={15} />
                    </button>
                    <button 
                      type="button" 
                      className="map-control-btn"
                      onClick={() => setZoomLevel(prev => Math.max(8, prev - 1))}
                      title="Zoom Out"
                    >
                      <ZoomOut size={15} />
                    </button>
                  </div>

                  {/* Animated Pin Marker Drop */}
                  <div 
                    className="marked-pin-wrapper"
                    style={{ left: `${pinPercent.x}%`, top: `${pinPercent.y}%` }}
                  >
                    <div className="marked-pin-bubble">
                      <div className="marked-pin-icon">
                        <Home size={18} strokeWidth={2.4} />
                      </div>
                    </div>
                    <div className="marked-pin-pulse" />
                    <div className="marked-pin-tooltip">
                      📍 {formData.location.city || 'Property'}: {currentLat}, {currentLng}
                    </div>
                  </div>
                </div>
              ) : (
                /* Satellite / Live Map Embed Stage */
                <div className="marker-map-stage" style={{ cursor: 'default' }}>
                  <iframe
                    className="marker-embed-iframe"
                    src={`https://maps.google.com/maps?q=${currentLat},${currentLng}&z=${zoomLevel}&output=embed`}
                    title="Live Location Map Embed"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Coordinates Bottom Fine-Tuning Bar */}
              <div className="marker-footer-bar">
                <div className="coord-group">
                  <label className="coord-label">Latitude</label>
                  <div className="coord-input-wrap">
                    <input
                      type="number"
                      step="0.00001"
                      value={currentLat}
                      onChange={(e) => handleCoordinateInput('lat', e.target.value)}
                      className="coord-input"
                    />
                    <span className="coord-suffix">°N</span>
                  </div>
                </div>

                <div className="coord-group">
                  <label className="coord-label">Longitude</label>
                  <div className="coord-input-wrap">
                    <input
                      type="number"
                      step="0.00001"
                      value={currentLng}
                      onChange={(e) => handleCoordinateInput('lng', e.target.value)}
                      className="coord-input"
                    />
                    <span className="coord-suffix">°W</span>
                  </div>
                </div>

                <div className="coord-group" style={{ textAlign: 'right' }}>
                  <label className="coord-label" style={{ display: 'block', marginBottom: 6 }}>
                    Zoom Factor
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111112' }}>
                      Level {zoomLevel}x
                    </span>
                    <button
                      type="button"
                      onClick={() => { setPinPercent({ x: 50, y: 50 }); setZoomLevel(14); }}
                      style={{
                        padding: '5px 10px',
                        background: '#f7f7f8',
                        border: '1px solid #e7e7e9',
                        borderRadius: 2,
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Reset Center
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Amenities */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111112', marginBottom: 16, borderBottom: '1px solid #EAEAEA', paddingBottom: 10, letterSpacing: '-0.3px' }}>
              4. Amenities & Features
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
              {commonAmenities.map((amenity) => {
                const checked = formData.amenities.includes(amenity);
                return (
                  <label 
                    key={amenity}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      background: checked ? '#F6F3FF' : '#F7F7F8',
                      border: checked ? '1px solid #7F51FF' : '1px solid #E7E7E9',
                      borderRadius: 2,
                      fontSize: '0.86rem',
                      fontWeight: 500,
                      color: checked ? '#7F51FF' : '#111112',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleAmenity(amenity)}
                      style={{ accentColor: '#7F51FF' }}
                    />
                    <span>{amenity}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 5: Media Photos */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111112', marginBottom: 16, borderBottom: '1px solid #EAEAEA', paddingBottom: 10, letterSpacing: '-0.3px' }}>
              5. Media & High-Res Photography
            </h3>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <input
                type="url"
                placeholder="Paste image URL (https://...)"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              <button 
                type="button" 
                className="btn-outline" 
                onClick={handleAddImage}
                style={{ whiteSpace: 'nowrap' }}
              >
                Add Image
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
              {formData.images.map((img, i) => (
                <div key={i} style={{ position: 'relative', height: 85, borderRadius: 3, overflow: 'hidden', border: '1px solid #EAEAEA' }}>
                  <img src={img} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ borderTop: '1px solid #EAEAEA', paddingTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 14 }}>
            <button
              type="button"
              className="btn-outline"
              onClick={() => router.push('/properties')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ minWidth: 200, justifyContent: 'center' }}
            >
              <PlusCircle size={18} />
              <span>{submitting ? 'Publishing Listing...' : 'Publish Property Listing'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
