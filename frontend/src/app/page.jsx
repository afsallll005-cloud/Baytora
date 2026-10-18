'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles, Building, Home, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import HeroSearch from '../components/HeroSearch';
import PropertyCard from '../components/PropertyCard';
import LocationExplorer from '../components/LocationExplorer';
import AppBanner from '../components/AppBanner';
import AdvertiseBanner from '../components/AdvertiseBanner';
import ContactModal from '../components/ContactModal';
import { fetchProperties } from '../lib/api';
import { initialProperties } from '../lib/mockData';
import PropertyStats from '../components/PropertyStats';
import ShowcaseBanner from '../components/ShowcaseBanner';

export default function HomePage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('buy');
  const [inquiryProperty, setInquiryProperty] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetchProperties();
        if (res && res.data && res.data.length > 0) {
          const apiIds = new Set(res.data.map(p => p._id));
          const showcaseItems = initialProperties.filter(p => !apiIds.has(p._id));
          setProperties([...showcaseItems, ...res.data]);
        } else {
          setProperties(initialProperties);
        }
      } catch (err) {
        console.error('Failed to load properties:', err);
        setProperties(initialProperties);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProperties = properties.filter((p) => {
    if (activeCategoryFilter === 'buy') return p.category === 'buy';
    if (activeCategoryFilter === 'rent') return p.category === 'rent';
    return true;
  });

  return (
    <>
      {/* 1. Hero Search Section */}
      <HeroSearch />

      {/* 2. Featured & Recent Listings (Luxterra Style) */}
      <section style={{ padding: '70px 0 90px', background: 'var(--bg-page)' }}>
        <div className="container">
          {/* Centered Header with hairline dividers matching Luxterra */}
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              marginBottom: 16,
              maxWidth: 700,
              margin: '0 auto 16px',
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
              fontSize: 'clamp(36px, 4.2vw, 56px)', 
              fontWeight: 450, 
              color: '#111112', 
              letterSpacing: '-0.06em', 
              margin: '0 auto 20px',
              lineHeight: 1.1
            }}>
              Featured listings
            </h2>

            {/* Toggle switch: [For sale] [For rent] */}
            <div style={{ 
              display: 'inline-flex', 
              background: '#FFFFFF', 
              padding: 3, 
              borderRadius: 6,
              border: '1px solid #EAEAEA',
              gap: 4
            }}>
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('buy')}
                style={{
                  padding: '7px 22px',
                  borderRadius: 4,
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: 'none',
                  background: activeCategoryFilter === 'buy' ? '#111112' : 'transparent',
                  color: activeCategoryFilter === 'buy' ? '#FFFFFF' : 'rgba(0,0,0,0.65)',
                  transition: 'all 0.15s ease',
                  letterSpacing: '-0.2px'
                }}
              >
                For sale
              </button>
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('rent')}
                style={{
                  padding: '7px 22px',
                  borderRadius: 4,
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: 'none',
                  background: activeCategoryFilter === 'rent' ? '#111112' : 'transparent',
                  color: activeCategoryFilter === 'rent' ? '#FFFFFF' : 'rgba(0,0,0,0.65)',
                  transition: 'all 0.15s ease',
                  letterSpacing: '-0.2px'
                }}
              >
                For rent
              </button>
            </div>
          </div>

          {/* Properties Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div style={{ 
                width: 40, 
                height: 40, 
                border: '3px solid var(--border-light)', 
                borderTopColor: 'var(--primary)', 
                borderRadius: '50%', 
                animation: 'spin 0.8s linear infinite', 
                margin: '0 auto 16px' 
              }}></div>
              <p>Loading curated properties...</p>
              <style jsx>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : (
            <div className="properties-grid">
              {filteredProperties.map((prop) => (
                <PropertyCard
                  key={prop._id}
                  property={prop}
                  onInquire={(p) => setInquiryProperty(p)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Location Explorer Accordion */}
      <LocationExplorer />

      {/* 5. App Download Banner */}
      {/* <AppBanner /> */}

      {/* 6. List your property CTA Banner */}
      {/* <AdvertiseBanner /> */}

      <PropertyStats/>

      {/* Architectural Villa Showcase with Scroll Zoom Animation */}
      <ShowcaseBanner />

      {/* Contact Agent Modal */}
      {inquiryProperty && (
        <ContactModal
          property={inquiryProperty}
          isOpen={!!inquiryProperty}
          onClose={() => setInquiryProperty(null)}
        />
      )}


    </>
  );
}
