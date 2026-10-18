'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  fetchFeaturedCities, 
  createFeaturedCity, 
  updateFeaturedCity, 
  deleteFeaturedCity 
} from '../../../lib/api';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  ExternalLink, 
  MapPin, 
  ArrowUpDown, 
  Check, 
  X, 
  Image as ImageIcon,
  Sparkles,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from 'lucide-react';

const PRESET_IMAGES = [
  {
    label: 'Modern Villa & Pool',
    url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=85',
  },
  {
    label: 'Tropical Timber Slats',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85',
  },
  {
    label: 'Urban Skyscraper Spire',
    url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1000&q=85',
  },
  {
    label: 'Coastal Waterfront Towers',
    url: 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?auto=format&fit=crop&w=1000&q=85',
  },
  {
    label: 'Luxury Resort Residence',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
  },
  {
    label: 'Sunny Marina Skyline',
    url: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba8?auto=format&fit=crop&w=1000&q=80',
  },
];

export default function AdminCitiesPage() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    fallbackImage: '',
    href: '',
    order: 1,
    isActive: true,
  });

  // Delete State
  const [deletingCity, setDeletingCity] = useState(null);

  const loadCities = async () => {
    try {
      setLoading(true);
      const data = await fetchFeaturedCities(true);
      setCities(data || []);
    } catch (err) {
      console.error('Failed to load cities in admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCities();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingCity(null);
    setFormData({
      name: '',
      description: '',
      image: PRESET_IMAGES[0].url,
      fallbackImage: '',
      href: '',
      order: cities.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (city) => {
    setEditingCity(city);
    setFormData({
      name: city.name || '',
      description: city.description || '',
      image: city.image || '',
      fallbackImage: city.fallbackImage || '',
      href: city.href || `/properties?search=${encodeURIComponent(city.name || '')}`,
      order: typeof city.order === 'number' ? city.order : 1,
      isActive: city.isActive !== undefined ? city.isActive : true,
    });
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim() || !formData.image.trim()) {
      alert('Please fill in city name, description, and image URL.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image.trim(),
        fallbackImage: formData.fallbackImage?.trim() || '',
        href: formData.href?.trim() || `/properties?search=${encodeURIComponent(formData.name.trim())}`,
        order: Number(formData.order) || 1,
        isActive: !!formData.isActive,
      };

      if (editingCity) {
        await updateFeaturedCity(editingCity._id, payload);
        showToast(`"${payload.name}" updated successfully!`);
      } else {
        await createFeaturedCity(payload);
        showToast(`"${payload.name}" added to Featured Cities!`);
      }

      setIsModalOpen(false);
      await loadCities();
    } catch (err) {
      console.error('Error saving city:', err);
      alert('Failed to save city. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Quick Toggle Active Status
  const handleToggleActive = async (city) => {
    const updatedStatus = !city.isActive;
    try {
      setCities((prev) =>
        prev.map((c) => (c._id === city._id ? { ...c, isActive: updatedStatus } : c))
      );
      await updateFeaturedCity(city._id, { isActive: updatedStatus });
      showToast(`${city.name} is now ${updatedStatus ? 'Visible on Homepage' : 'Hidden'}`);
    } catch (err) {
      console.error('Toggle error:', err);
      loadCities();
    }
  };

  // Quick Reorder (Move Up / Down)
  const handleMoveOrder = async (city, direction) => {
    const sorted = [...cities].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentIndex = sorted.findIndex((c) => c._id === city._id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const targetCity = sorted[targetIndex];
    const currentOrder = city.order || currentIndex + 1;
    const targetOrder = targetCity.order || targetIndex + 1;

    try {
      // Swap orders
      await updateFeaturedCity(city._id, { order: targetOrder });
      await updateFeaturedCity(targetCity._id, { order: currentOrder });
      await loadCities();
      showToast(`Reordered "${city.name}"`);
    } catch (err) {
      console.error('Reorder error:', err);
      loadCities();
    }
  };

  // Delete City
  const handleConfirmDelete = async () => {
    if (!deletingCity) return;
    try {
      await deleteFeaturedCity(deletingCity._id);
      showToast(`"${deletingCity.name}" deleted`);
      setDeletingCity(null);
      await loadCities();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete city.');
    }
  };

  // Filtered Cities list
  const filteredCities = cities.filter((city) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      city.name?.toLowerCase().includes(term) ||
      city.description?.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && city.isActive !== false) ||
      (statusFilter === 'inactive' && city.isActive === false);

    return matchesSearch && matchesStatus;
  }).sort((a, b) => (a.order || 0) - (b.order || 0));

  const totalCount = cities.length;
  const activeCount = cities.filter((c) => c.isActive !== false).length;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 60 }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: '#111827',
          color: '#FFFFFF',
          padding: '12px 24px',
          borderRadius: 8,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 9999,
          fontWeight: 600,
          fontSize: '0.92rem',
          animation: 'fadeIn 0.2s ease',
        }}>
          <Check size={18} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Actions Bar */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 12,
        padding: '24px 28px',
        border: '1px solid #E5E7EB',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#8B5CF6',
              display: 'inline-block'
            }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Homepage Showcase
            </span>
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>
            Featured Cities Management
          </h2>
          <p style={{ margin: '6px 0 0', color: '#6B7280', fontSize: '0.92rem' }}>
            Manage the prominent city cards displayed in the LocationExplorer section on the public homepage.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={loadCities}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 8,
              background: '#F3F4F6',
              color: '#374151',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              border: '1px solid #E5E7EB'
            }}
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 20px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
              transition: 'all 0.15s ease'
            }}
          >
            <PlusCircle size={18} />
            <span>Add Featured City</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        <div style={{ background: '#FFFFFF', padding: '18px 22px', borderRadius: 10, border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Total Configured</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginTop: 4 }}>{totalCount}</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px 22px', borderRadius: 10, border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#10B981', textTransform: 'uppercase' }}>Live On Homepage</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981', marginTop: 4 }}>{activeCount}</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px 22px', borderRadius: 10, border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Hidden / Drafts</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#6B7280', marginTop: 4 }}>{totalCount - activeCount}</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px 22px', borderRadius: 10, border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8B5CF6', textTransform: 'uppercase' }}>Public Section</div>
          <div style={{ marginTop: 6 }}>
            <Link
              href="/"
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#8B5CF6',
                textDecoration: 'none'
              }}
            >
              <span>Preview on Home</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 10,
        padding: '16px 20px',
        border: '1px solid #E5E7EB',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 300px' }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: 400,
          }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              placeholder="Search by city name or tagline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 8,
                border: '1px solid #D1D5DB',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'all', label: 'All Cities' },
            { id: 'active', label: 'Active Only' },
            { id: 'inactive', label: 'Hidden Only' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '7px 14px',
                borderRadius: 6,
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: statusFilter === tab.id ? '#111827' : '#F3F4F6',
                color: statusFilter === tab.id ? '#FFFFFF' : '#4B5563',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* City Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B7280' }}>
          <p>Loading featured cities...</p>
        </div>
      ) : filteredCities.length === 0 ? (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 12,
          padding: '60px 20px',
          textAlign: 'center',
          border: '1px solid #E5E7EB',
        }}>
          <MapPin size={40} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', margin: 0 }}>No cities found</h3>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '6px 0 20px' }}>
            {searchTerm ? 'Try adjusting your search criteria.' : 'Click "Add Featured City" to create your first card.'}
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: '#8B5CF6',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            Add Featured City
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
          gap: 24,
        }}>
          {filteredCities.map((city, idx) => (
            <div
              key={city._id}
              style={{
                background: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E5E7EB',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              {/* Card Image Preview Banner */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: 200,
                background: '#1F2937',
                overflow: 'hidden',
              }}>
                <img
                  src={city.image}
                  alt={city.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    if (city.fallbackImage && e.currentTarget.src !== city.fallbackImage) {
                      e.currentTarget.src = city.fallbackImage;
                    }
                  }}
                />

                {/* Dark gradient overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)',
                }} />

                {/* Order Badge */}
                <div style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  background: 'rgba(0,0,0,0.65)',
                  color: '#FFFFFF',
                  padding: '3px 9px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backdropFilter: 'blur(4px)',
                }}>
                  Order #{city.order || idx + 1}
                </div>

                {/* Status Badge */}
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: city.isActive !== false ? '#10B981' : '#6B7280',
                  color: '#FFFFFF',
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  {city.isActive !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{city.isActive !== false ? 'Active' : 'Hidden'}</span>
                </div>

                {/* Name on image bottom */}
                <div style={{
                  position: 'absolute',
                  bottom: 14,
                  left: 16,
                  right: 16,
                }}>
                  <h3 style={{
                    color: '#FFFFFF',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    margin: 0,
                    lineHeight: 1.1,
                  }}>
                    {city.name}
                  </h3>
                </div>
              </div>

              {/* Card Body Details */}
              <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <p style={{
                  color: '#4B5563',
                  fontSize: '0.9rem',
                  lineHeight: 1.45,
                  margin: '0 0 14px',
                  flex: 1,
                }}>
                  {city.description}
                </p>

                {/* Target Link */}
                <div style={{
                  background: '#F9FAFB',
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  color: '#6B7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  border: '1px solid #F3F4F6'
                }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 210 }}>
                    {city.href || `/properties?search=${encodeURIComponent(city.name)}`}
                  </span>
                  <Link
                    href={city.href || `/properties?search=${encodeURIComponent(city.name)}`}
                    target="_blank"
                    style={{ color: '#8B5CF6', display: 'flex', alignItems: 'center' }}
                    title="Open on website"
                  >
                    <ExternalLink size={13} />
                  </Link>
                </div>

                {/* Action Buttons Footer */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 14,
                  borderTop: '1px solid #F3F4F6',
                }}>
                  {/* Reorder Buttons */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      type="button"
                      title="Move up in order"
                      onClick={() => handleMoveOrder(city, 'up')}
                      disabled={idx === 0}
                      style={{
                        padding: 6,
                        borderRadius: 6,
                        border: '1px solid #E5E7EB',
                        background: '#FFFFFF',
                        color: idx === 0 ? '#D1D5DB' : '#374151',
                        cursor: idx === 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      title="Move down in order"
                      onClick={() => handleMoveOrder(city, 'down')}
                      disabled={idx === filteredCities.length - 1}
                      style={{
                        padding: 6,
                        borderRadius: 6,
                        border: '1px solid #E5E7EB',
                        background: '#FFFFFF',
                        color: idx === filteredCities.length - 1 ? '#D1D5DB' : '#374151',
                        cursor: idx === filteredCities.length - 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  {/* Toggle Active Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(city)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: '1px solid #E5E7EB',
                      background: city.isActive !== false ? '#ECFDF5' : '#F3F4F6',
                      color: city.isActive !== false ? '#065F46' : '#6B7280',
                      cursor: 'pointer',
                    }}
                  >
                    {city.isActive !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span>{city.isActive !== false ? 'Shown' : 'Hidden'}</span>
                  </button>

                  {/* Edit & Delete Buttons */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(city)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1px solid #E5E7EB',
                        background: '#FFFFFF',
                        color: '#374151',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.82rem',
                        fontWeight: 600,
                      }}
                    >
                      <Edit size={13} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingCity(city)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1px solid #FEE2E2',
                        background: '#FEF2F2',
                        color: '#EF4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Delete city"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20,
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 14,
            maxWidth: 620,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                  {editingCity ? `Edit "${editingCity.name}"` : 'Add Featured City'}
                </h3>
                <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '0.86rem' }}>
                  Configure the card image, city name, description, and search link.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#6B7280'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} style={{ padding: '24px' }}>
              {/* City Name */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  City Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tampa, Miami, Orlando, Jacksonville, Naples..."
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name: val,
                      href: prev.href || `/properties?search=${encodeURIComponent(val)}`,
                    }));
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #D1D5DB',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Tagline / Description */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  Tagline / Short Description *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Find waterfront living, lively districts & value"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #D1D5DB',
                    fontSize: '0.92rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
                <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                  Recommended: 8-12 words that fit neatly on 2 lines.
                </span>
              </div>

              {/* Image URL */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  Image URL (High-resolution, portrait aspect ratio recommended) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #D1D5DB',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />

                {/* Preset image quick picks */}
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 6 }}>
                    Or select a curated preset:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: preset.url })}
                        style={{
                          fontSize: '0.76rem',
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: formData.image === preset.url ? '1px solid #8B5CF6' : '1px solid #E5E7EB',
                          background: formData.image === preset.url ? '#EDE9FE' : '#F9FAFB',
                          color: formData.image === preset.url ? '#7C3AED' : '#4B5563',
                          cursor: 'pointer',
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              {formData.image && (
                <div style={{
                  marginBottom: 20,
                  padding: 14,
                  background: '#F9FAFB',
                  borderRadius: 10,
                  border: '1px solid #E5E7EB'
                }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 8 }}>
                    Live Homepage Card Preview:
                  </span>
                  <div style={{
                    position: 'relative',
                    width: 220,
                    height: 280,
                    borderRadius: 6,
                    overflow: 'hidden',
                    background: '#000',
                    margin: '0 auto',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  }}>
                    <img
                      src={formData.image}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: '40% 0 0',
                      background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.88) 100%)',
                    }} />
                    <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                      <div style={{ color: '#FFFFFF', fontSize: '1.2rem', fontWeight: 700 }}>
                        {formData.name || 'City Name'}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', lineHeight: 1.35, marginTop: 4 }}>
                        {formData.description || 'City description or waterfront living tagline'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Target Link & Display Order */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                    Target Website Link
                  </label>
                  <input
                    type="text"
                    placeholder="/properties?search=..."
                    value={formData.href}
                    onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #D1D5DB',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #D1D5DB',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Active Toggle Checkbox */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                background: '#F9FAFB',
                borderRadius: 8,
                marginBottom: 24,
                border: '1px solid #E5E7EB',
              }}>
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#8B5CF6' }}
                />
                <label htmlFor="isActiveCheck" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                  Active and visible in "Featured cities" section on the public homepage
                </label>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    background: '#F3F4F6',
                    color: '#4B5563',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    border: '1px solid #E5E7EB',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: saving ? 'wait' : 'pointer',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                  }}
                >
                  {saving ? 'Saving...' : editingCity ? 'Update City' : 'Add City'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingCity && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20,
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 12,
            maxWidth: 420,
            width: '100%',
            padding: 24,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            textAlign: 'center',
          }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: '#FEE2E2',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
              Delete Featured City?
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '0 0 24px', lineHeight: 1.4 }}>
              Are you sure you want to remove <strong>"{deletingCity.name}"</strong>? It will no longer appear in the homepage Featured Cities section.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={() => setDeletingCity(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  background: '#F3F4F6',
                  color: '#4B5563',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  border: '1px solid #E5E7EB',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  padding: '9px 20px',
                  borderRadius: 8,
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
