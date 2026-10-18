'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  fetchProperties, 
  deleteProperty, 
  togglePropertyStatus, 
  updateProperty,
  fetchAgents
} from '../../../lib/api';
import { 
  Search, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Eye, 
  ShieldCheck, 
  Star, 
  X, 
  Check, 
  Filter, 
  RotateCcw,
  Image as ImageIcon,
  Upload,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Camera,
  ExternalLink,
  Users
} from 'lucide-react';

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [agentsList, setAgentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Edit Modal State
  const [editingProperty, setEditingProperty] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Property Image Edit States
  const [newImageUrl, setNewImageUrl] = useState('');
  const [editingImageIdx, setEditingImageIdx] = useState(null);
  const [editUrlInput, setEditUrlInput] = useState('');

  // Delete State
  const [deletingId, setDeletingId] = useState(null);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const [res, agentsData] = await Promise.all([
        fetchProperties(),
        fetchAgents().catch(() => []),
      ]);
      if (res && res.data) {
        setProperties(res.data);
      }
      if (agentsData && Array.isArray(agentsData)) {
        setAgentsList(agentsData);
      }
    } catch (err) {
      console.error('Error fetching properties for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  // Filtered properties
  const filteredProperties = properties.filter((p) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      p.title?.toLowerCase().includes(s) ||
      p.location?.city?.toLowerCase().includes(s) ||
      p.referenceNumber?.toLowerCase().includes(s);

    const matchesCategory =
      categoryFilter === 'all' || p.category?.toLowerCase() === categoryFilter.toLowerCase();

    const matchesType =
      typeFilter === 'all' || p.propertyType?.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesType;
  });

  // Toggle Verified
  const handleToggleVerified = async (prop) => {
    const newStatus = !prop.isVerified;
    setProperties((prev) =>
      prev.map((item) => (item._id === prop._id ? { ...item, isVerified: newStatus } : item))
    );
    await togglePropertyStatus(prop._id, { isVerified: newStatus });
  };

  // Toggle Featured
  const handleToggleFeatured = async (prop) => {
    const newStatus = !prop.isFeatured;
    setProperties((prev) =>
      prev.map((item) => (item._id === prop._id ? { ...item, isFeatured: newStatus } : item))
    );
    await togglePropertyStatus(prop._id, { isFeatured: newStatus });
  };

  // Delete Property
  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteProperty(id);
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert('Failed to delete property');
    } finally {
      setDeletingId(null);
    }
  };

  // Start Editing
  const openEditModal = (prop) => {
    setEditingProperty(prop);
    setEditFormData({
      title: prop.title,
      price: prop.price,
      category: prop.category,
      propertyType: prop.propertyType,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      area: prop.area,
      furnished: prop.furnished || 'Furnished',
      location: {
        city: prop.location?.city || '',
        governorate: prop.location?.governorate || 'Florida',
        building: prop.location?.building || '',
      },
      description: prop.description || '',
      agent: prop.agent || null,
      images: Array.isArray(prop.images) && prop.images.length > 0
        ? [...prop.images]
        : (prop.images ? [prop.images] : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80']),
    });
    setNewImageUrl('');
    setEditingImageIdx(null);
    setEditUrlInput('');
  };

  // Add new image from URL
  const handleAddImage = (e) => {
    e?.preventDefault();
    if (!newImageUrl.trim()) return;
    const current = editFormData.images || [];
    setEditFormData({
      ...editFormData,
      images: [...current, newImageUrl.trim()]
    });
    setNewImageUrl('');
  };

  // Upload local image from device file
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        const current = editFormData.images || [];
        setEditFormData({
          ...editFormData,
          images: [...current, dataUrl]
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Remove image from gallery
  const handleRemoveImage = (indexToRemove) => {
    const current = editFormData.images || [];
    if (current.length <= 1) {
      if (!confirm('This is the only photo for this listing. Remove it anyway?')) return;
    }
    setEditFormData({
      ...editFormData,
      images: current.filter((_, idx) => idx !== indexToRemove)
    });
    if (editingImageIdx === indexToRemove) {
      setEditingImageIdx(null);
    }
  };

  // Set as primary cover photo (move to index 0)
  const handleSetCoverPhoto = (indexToPromote) => {
    if (indexToPromote === 0) return;
    const current = editFormData.images || [];
    const item = current[indexToPromote];
    const remaining = current.filter((_, idx) => idx !== indexToPromote);
    setEditFormData({
      ...editFormData,
      images: [item, ...remaining]
    });
  };

  // Move photo left/right
  const handleMoveImage = (from, to) => {
    const current = [...(editFormData.images || [])];
    if (to < 0 || to >= current.length) return;
    const [moved] = current.splice(from, 1);
    current.splice(to, 0, moved);
    setEditFormData({
      ...editFormData,
      images: current
    });
  };

  // Save inline URL edit
  const handleSaveInlineUrl = (index) => {
    if (!editUrlInput.trim()) return;
    const current = [...(editFormData.images || [])];
    current[index] = editUrlInput.trim();
    setEditFormData({
      ...editFormData,
      images: current
    });
    setEditingImageIdx(null);
    setEditUrlInput('');
  };

  const PRESET_PHOTOS = [
    { label: 'Villa Estate', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Penthouse Skyline', url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Modern Living', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Master Bedroom', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Infinity Pool', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Waterfront Terrace', url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80' },
  ];

  // Submit Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await updateProperty(editingProperty._id, editFormData);
      if (res && res.success) {
        const updatedItem = res.data || { ...editingProperty, ...editFormData };
        setProperties((prev) =>
          prev.map((p) => (p._id === editingProperty._id ? updatedItem : p))
        );
        setEditingProperty(null);
      } else {
        alert('Failed to update property');
      }
    } catch (err) {
      alert('Error updating property');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div>
      {/* Top action / filters bar */}
      <div className="admin-card" style={{ marginBottom: 24, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          {/* Search box */}
          <div style={{ position: 'relative', minWidth: 280, flex: 1 }}>
            <input
              type="text"
              placeholder="Search title, city, or Ref number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 36, height: 40 }}
            />
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12 }} />
          </div>

          {/* Category Filter */}
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ height: 40 }}
          >
            <option value="all">Category (All)</option>
            <option value="rent">Rent</option>
            <option value="buy">Buy</option>
            <option value="commercial">Commercial</option>
          </select>

          {/* Type Filter */}
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ height: 40 }}
          >
            <option value="all">Type (All)</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Penthouse">Penthouse</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Studio">Studio</option>
            <option value="Commercial">Commercial</option>
          </select>

          {/* Add Listing CTA */}
          <Link href="/add-property" className="admin-btn admin-btn-primary" style={{ height: 40 }}>
            <PlusCircle size={16} />
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      {/* Properties Table Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">All Property Listings</h3>
            <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>
              Showing {filteredProperties.length} of {properties.length} total properties
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B7280' }}>
            Loading properties...
          </div>
        ) : filteredProperties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
            No properties found matching your filter criteria.
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Listing</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Location</th>
                  <th>Verified</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((prop) => (
                  <tr key={prop._id}>
                    {/* Media & Title */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=120&q=80'}
                          alt=""
                          style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#111827', maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {prop.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                            Ref: <strong>{prop.referenceNumber}</strong> • {prop.bedrooms === 0 ? 'Studio' : `${prop.bedrooms} Bed`} • {prop.bathrooms} Bath • {prop.area} sqm
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className={`admin-pill admin-pill-${prop.category}`}>
                        {prop.category}
                      </span>
                    </td>

                    {/* Type */}
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{prop.propertyType}</span>
                    </td>

                    {/* Price */}
                    <td>
                      <strong style={{ color: '#EF5E4E', fontSize: '0.95rem' }}>
                        {prop.price?.toLocaleString()} {prop.currency || 'BHD'}
                      </strong>
                      {prop.category === 'rent' && (
                        <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>/{prop.pricePeriod || 'mo'}</span>
                      )}
                    </td>

                    {/* Location */}
                    <td>
                      <div style={{ fontWeight: 600 }}>{prop.location?.city}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{prop.location?.governorate}</div>
                    </td>

                    {/* Toggle Verified */}
                    <td>
                      <label className="admin-toggle" title="Toggle Verified Badge">
                        <input
                          type="checkbox"
                          checked={!!prop.isVerified}
                          onChange={() => handleToggleVerified(prop)}
                        />
                        <span className="admin-slider"></span>
                      </label>
                    </td>

                    {/* Toggle Featured */}
                    <td>
                      <label className="admin-toggle" title="Toggle Featured on Homepage">
                        <input
                          type="checkbox"
                          checked={!!prop.isFeatured}
                          onChange={() => handleToggleFeatured(prop)}
                        />
                        <span className="admin-slider"></span>
                      </label>
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Link
                          href={`/properties/${prop._id}`}
                          target="_blank"
                          className="admin-btn admin-btn-outline"
                          title="View on Live Site"
                          style={{ padding: '6px' }}
                        >
                          <Eye size={15} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => openEditModal(prop)}
                          className="admin-btn admin-btn-outline"
                          title="Edit Property"
                          style={{ padding: '6px' }}
                        >
                          <Edit size={15} color="#4F46E5" />
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === prop._id}
                          onClick={() => handleDelete(prop._id, prop.title)}
                          className="admin-btn admin-btn-danger"
                          title="Delete Listing"
                          style={{ padding: '6px' }}
                        >
                          <Trash2 size={15} />
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

      {/* EDIT PROPERTY MODAL */}
      {editingProperty && (
        <div className="modal-overlay" onClick={() => setEditingProperty(null)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: 760, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Edit Property Listing</h3>
                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  Ref: {editingProperty.referenceNumber}
                </span>
              </div>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setEditingProperty(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="modal-body">
              {/* Section 1: Listing Details */}
              <div className="form-group">
                <label className="form-label">Property Title</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Price</label>
                  <input
                    type="number"
                    required
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="form-select"
                  >
                    <option value="rent">Rent</option>
                    <option value="buy">Buy</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    value={editFormData.propertyType}
                    onChange={(e) => setEditFormData({ ...editFormData, propertyType: e.target.value })}
                    className="form-select"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Studio">Studio</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Bedrooms</label>
                  <input
                    type="number"
                    value={editFormData.bedrooms}
                    onChange={(e) => setEditFormData({ ...editFormData, bedrooms: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bathrooms</label>
                  <input
                    type="number"
                    value={editFormData.bathrooms}
                    onChange={(e) => setEditFormData({ ...editFormData, bathrooms: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Area (sqm)</label>
                  <input
                    type="number"
                    value={editFormData.area}
                    onChange={(e) => setEditFormData({ ...editFormData, area: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    value={editFormData.location?.city}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        location: { ...editFormData.location, city: e.target.value },
                      })
                    }
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Building Name</label>
                  <input
                    type="text"
                    value={editFormData.location?.building}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        location: { ...editFormData.location, building: e.target.value },
                      })
                    }
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              {/* Assigned Real Estate Agent Section */}
              <div style={{
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: '16px',
                marginBottom: 18,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: 700, color: '#111827' }}>
                    Assigned Real Estate Agent / Broker
                  </label>
                  <Link href="/admin/agents" style={{ fontSize: '0.8rem', color: '#7F51FF', fontWeight: 600 }}>
                    Manage All Agents →
                  </Link>
                </div>

                <select
                  className="form-select"
                  value={editFormData.agent?._id || editFormData.agent?.id || ''}
                  onChange={(e) => {
                    const agentId = e.target.value;
                    const selected = agentsList.find(a => String(a._id) === agentId || String(a.id) === agentId);
                    if (selected) {
                      setEditFormData({
                        ...editFormData,
                        isSuperAgent: !!selected.isSuperAgent,
                        agent: {
                          _id: String(selected._id || selected.id),
                          name: selected.name,
                          company: selected.company,
                          photo: selected.photo,
                          phone: selected.phone,
                          whatsapp: selected.whatsapp || selected.phone?.replace(/[^0-9]/g, ''),
                          email: selected.email,
                          closedDeals: selected.closedDeals,
                          rating: selected.rating,
                          isSuperAgent: !!selected.isSuperAgent,
                          specialties: selected.specialties,
                        }
                      });
                    }
                  }}
                  style={{ marginBottom: editFormData.agent ? 12 : 0 }}
                >
                  <option value="">
                    {editFormData.agent?.name ? `${editFormData.agent.name} (${editFormData.agent.company || 'Current Agent'})` : '-- Select Registered Agent --'}
                  </option>
                  {agentsList.map((a) => (
                    <option key={a._id || a.id} value={a._id || a.id}>
                      {a.name} — {a.company} ({a.phone})
                    </option>
                  ))}
                </select>

                {editFormData.agent && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: 6,
                  }}>
                    <img
                      src={editFormData.agent.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80'}
                      alt={editFormData.agent.name}
                      style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '1px solid #E5E7EB' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>
                        {editFormData.agent.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                        {editFormData.agent.company} • {editFormData.agent.phone}
                      </div>
                    </div>
                    {editFormData.agent.isSuperAgent && (
                      <span className="badge badge-super" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                        SuperAgent
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Section 2: Property Images Edit Manager */}
              <div className="admin-image-manager">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, background: '#F3E8FF', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon size={16} color="#7F51FF" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#111827' }}>
                        Property Photography Gallery ({(editFormData.images || []).length} photos)
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#6B7280' }}>
                        Photo #1 is the primary cover image. Reorder, edit URLs, or upload photos below.
                      </p>
                    </div>
                  </div>

                  <label 
                    className="admin-btn admin-btn-outline" 
                    style={{ fontSize: '0.78rem', padding: '6px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Upload size={14} />
                    <span>Upload Device File</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>

                {/* Add Photo URL Input */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <input
                    type="url"
                    placeholder="Paste image URL (https://images.unsplash.com/...)"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="form-input"
                    style={{ flex: 1, height: 38, fontSize: '0.86rem' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="admin-btn admin-btn-primary"
                    style={{ height: 38, padding: '0 16px', whiteSpace: 'nowrap', fontSize: '0.84rem' }}
                  >
                    <PlusCircle size={15} />
                    <span>Add Photo</span>
                  </button>
                </div>

                {/* 1-Click Luxury Architecture Presets */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#6B7280', marginRight: 4 }}>
                    Quick presets:
                  </span>
                  {PRESET_PHOTOS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      className="admin-preset-chip"
                      onClick={() => {
                        const current = editFormData.images || [];
                        setEditFormData({ ...editFormData, images: [...current, p.url] });
                      }}
                    >
                      <Sparkles size={11} color="#7F51FF" />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>

                {/* Images Grid */}
                {(editFormData.images || []).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', background: '#FFFFFF', border: '1px dashed #D1D5DB', borderRadius: 6, color: '#6B7280' }}>
                    <Camera size={28} color="#9CA3AF" style={{ margin: '0 auto 8px' }} />
                    <p style={{ margin: 0, fontSize: '0.86rem', fontWeight: 600 }}>No photos currently attached.</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>Paste a photo URL above or pick a quick preset to add one.</p>
                  </div>
                ) : (
                  <div className="admin-image-grid">
                    {(editFormData.images || []).map((imgUrl, idx) => {
                      const isCover = idx === 0;
                      const isEditingThis = editingImageIdx === idx;

                      return (
                        <div key={idx} className={`property-edit-img-card ${isCover ? 'is-cover' : ''}`}>
                          <div className="property-edit-img-wrap">
                            <img src={imgUrl} alt={`Photo ${idx + 1}`} />
                            {isCover && (
                              <span className="cover-tag-badge">
                                <Star size={10} fill="#ffffff" />
                                <span>Cover Photo</span>
                              </span>
                            )}
                          </div>

                          {/* Inline URL Edit Form */}
                          {isEditingThis ? (
                            <div style={{ padding: 8, background: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}>
                              <input
                                type="url"
                                value={editUrlInput}
                                onChange={(e) => setEditUrlInput(e.target.value)}
                                placeholder="New image URL"
                                style={{ width: '100%', fontSize: '0.76rem', padding: '4px 6px', marginBottom: 6, border: '1px solid #D1D5DB', borderRadius: 3 }}
                              />
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button
                                  type="button"
                                  onClick={() => handleSaveInlineUrl(idx)}
                                  style={{ flex: 1, padding: '3px 6px', fontSize: '0.72rem', background: '#7F51FF', color: 'white', border: 'none', borderRadius: 2, cursor: 'pointer', fontWeight: 600 }}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingImageIdx(null)}
                                  style={{ flex: 1, padding: '3px 6px', fontSize: '0.72rem', background: '#E5E7EB', color: '#374151', border: 'none', borderRadius: 2, cursor: 'pointer' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Make Cover Button if not cover */}
                              {!isCover && (
                                <button
                                  type="button"
                                  className="make-cover-btn"
                                  onClick={() => handleSetCoverPhoto(idx)}
                                  title="Promote to primary cover image"
                                >
                                  ★ Set as Cover
                                </button>
                              )}

                              {/* Control Bar */}
                              <div className="property-edit-img-actions">
                                <div style={{ display: 'flex', gap: 2 }}>
                                  <button
                                    type="button"
                                    className="img-action-icon-btn"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveImage(idx, idx - 1)}
                                    title="Move earlier in gallery"
                                  >
                                    <ArrowLeft size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    className="img-action-icon-btn"
                                    disabled={idx === (editFormData.images || []).length - 1}
                                    onClick={() => handleMoveImage(idx, idx + 1)}
                                    title="Move later in gallery"
                                  >
                                    <ArrowRight size={13} />
                                  </button>
                                </div>

                                <div style={{ display: 'flex', gap: 2 }}>
                                  <button
                                    type="button"
                                    className="img-action-icon-btn"
                                    onClick={() => {
                                      setEditingImageIdx(idx);
                                      setEditUrlInput(imgUrl);
                                    }}
                                    title="Edit image URL"
                                  >
                                    <Edit size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    className="img-action-icon-btn delete-btn"
                                    onClick={() => handleRemoveImage(idx)}
                                    title="Delete photo"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
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
                  {savingEdit ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
