'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PropertyCard from '../../components/PropertyCard';
import ContactModal from '../../components/ContactModal';
import { fetchProperties } from '../../lib/api';
import { initialProperties } from '../../lib/mockData';
import { Search, SlidersHorizontal, RotateCcw, Building2, Bed, Bath, DollarSign, Filter } from 'lucide-react';

function PropertiesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inquiryProperty, setInquiryProperty] = useState(null);

  // Filter States initialized from query params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    propertyType: searchParams.get('propertyType') || 'all',
    bedrooms: searchParams.get('bedrooms') || 'any',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    furnished: searchParams.get('furnished') || 'all',
    sort: searchParams.get('sort') || 'featured',
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      try {
        const res = await fetchProperties(filters);
        if (res && res.data && res.data.length > 0) {
          if (filters.category === 'buy' || filters.category === 'all') {
            const apiIds = new Set(res.data.map(p => p._id));
            const showcase = initialProperties
              .filter(p => !apiIds.has(p._id))
              .filter(p => filters.category === 'all' || p.category === filters.category);
            setProperties([...showcase, ...res.data]);
          } else {
            setProperties(res.data);
          }
        } else {
          setProperties(initialProperties);
        }
      } catch (err) {
        console.error('Error fetching filtered properties:', err);
        setProperties(initialProperties);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, [filters]);

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      propertyType: 'all',
      bedrooms: 'any',
      minPrice: '',
      maxPrice: '',
      furnished: 'all',
      sort: 'featured',
    });
    router.push('/properties');
  };

  return (
    <div className="container" style={{ padding: '40px 32px 90px' }}>
      {/* Header & Breadcrumb */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: '0.84rem', color: 'rgba(0,0,0,0.45)', marginBottom: 6, letterSpacing: '-0.2px' }}>
          Home / Listings {filters.category !== 'all' ? `/ ${filters.category.toUpperCase()}` : ''}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(28px, 3.2vw, 42px)', fontWeight: 450, color: '#111112', letterSpacing: '-0.05em', margin: 0, lineHeight: 1.15 }}>
              {filters.category === 'rent'
                ? 'Properties for Rent'
                : filters.category === 'buy'
                ? 'Properties for Sale'
                : filters.category === 'commercial'
                ? 'Commercial Properties'
                : 'Curated Real Estate Listings'}
            </h1>
            <p style={{ color: 'rgba(0,0,0,0.62)', fontSize: '0.92rem', marginTop: 4, letterSpacing: '-0.2px' }}>
              Showing {properties.length} curated Florida residences &amp; properties
            </p>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'rgba(0,0,0,0.62)' }}>
              Sort by:
            </span>
            <select
              className="filter-select"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              style={{ minWidth: 170, borderRadius: 2, borderColor: '#EAEAEA' }}
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="newest">Newest Listed</option>
              <option value="beds-asc">Beds (Least to Most)</option>
              <option value="beds-desc">Beds (Most to Least)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Filter Bar */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #EAEAEA',
          borderRadius: 3,
          padding: 18,
          marginBottom: 36,
          boxShadow: 'rgba(0, 0, 0, 0.04) 0px 1px 3px'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'center' }}>
          {/* Keyword search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search city, building..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="form-input"
              style={{ paddingLeft: 36, height: 42 }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 13 }} />
          </div>

          {/* Category */}
          <select
            className="filter-select"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="all">Category (All)</option>
            <option value="rent">Rent</option>
            <option value="buy">Buy</option>
            <option value="commercial">Commercial</option>
          </select>

          {/* Property Type */}
          <select
            className="filter-select"
            value={filters.propertyType}
            onChange={(e) => handleFilterChange('propertyType', e.target.value)}
          >
            <option value="all">Property Type (All)</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Penthouse">Penthouse</option>
            <option value="Studio">Studio</option>
            <option value="Commercial">Commercial</option>
          </select>

          {/* Bedrooms */}
          <select
            className="filter-select"
            value={filters.bedrooms}
            onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
          >
            <option value="any">Bedrooms (Any)</option>
            <option value="0">Studio</option>
            <option value="1">1 Bedroom</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3 Bedrooms</option>
            <option value="4+">4+ Bedrooms</option>
          </select>

          {/* Furnishing */}
          <select
            className="filter-select"
            value={filters.furnished}
            onChange={(e) => handleFilterChange('furnished', e.target.value)}
          >
            <option value="all">Furnishing (All)</option>
            <option value="Furnished">Furnished</option>
            <option value="Semi-Furnished">Semi-Furnished</option>
            <option value="Unfurnished">Unfurnished</option>
          </select>

          {/* Max Price */}
          <input
            type="number"
            placeholder="Max Price (BHD)"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="form-input"
            style={{ height: 42 }}
          />

          {/* Reset button */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn-outline"
            style={{ height: 42, justifyContent: 'center' }}
            title="Reset All Filters"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Property Listing Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <div style={{ 
            width: 44, 
            height: 44, 
            border: '3px solid var(--border-light)', 
            borderTopColor: 'var(--primary)', 
            borderRadius: '50%', 
            animation: 'spin 0.8s linear infinite', 
            margin: '0 auto 16px' 
          }}></div>
          <p>Finding listings matching your criteria...</p>
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : properties.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
          <Building2 size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 8 }}>
            No properties found
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
            Try expanding your search query or resetting filters to see all available properties.
          </p>
          <button type="button" onClick={handleResetFilters} className="btn-primary">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="properties-grid">
          {properties.map((prop) => (
            <PropertyCard
              key={prop._id}
              property={prop}
              onInquire={(p) => setInquiryProperty(p)}
            />
          ))}
        </div>
      )}

      {/* Contact Agent Modal */}
      {inquiryProperty && (
        <ContactModal
          property={inquiryProperty}
          isOpen={!!inquiryProperty}
          onClose={() => setInquiryProperty(null)}
        />
      )}
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading listings...</div>}>
      <PropertiesContent />
    </Suspense>
  );
}
