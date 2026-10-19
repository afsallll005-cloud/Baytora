'use client';

import { useState, useEffect } from 'react';
import { fetchAdminStats, fetchProperties } from '../../../lib/api';
import { BarChart3, TrendingUp, DollarSign, Building, PieChart, CheckCircle2 } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsData, propsData] = await Promise.all([
          fetchAdminStats(),
          fetchProperties()
        ]);
        setStats(statsData);
        if (propsData && propsData.data) {
          setProperties(propsData.data);
        }
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B7280' }}>
        Loading platform analytics...
      </div>
    );
  }

  // Analytics computations
  const rentListings = properties.filter((p) => p.category === 'rent');
  const buyListings = properties.filter((p) => p.category === 'buy');

  const avgRentPrice = rentListings.length
    ? Math.round(rentListings.reduce((acc, p) => acc + (p.price || 0), 0) / rentListings.length)
    : 0;

  const avgBuyPrice = buyListings.length
    ? Math.round(buyListings.reduce((acc, p) => acc + (p.price || 0), 0) / buyListings.length)
    : 0;

  // Locations breakdown
  const locationCounts = {};
  properties.forEach((p) => {
    const loc = p.location?.city || 'Other';
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });

  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div>
      {/* Metrics Row */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div>
            <div className="admin-kpi-label">Average Monthly Rent</div>
            <div className="admin-kpi-val">{avgRentPrice.toLocaleString()} BHD</div>
            <div className="admin-kpi-sub">Across {rentListings.length} residential rental units</div>
          </div>
          <div className="admin-kpi-icon" style={{ background: '#DEF7EC', color: '#0E9F6E' }}>
            <DollarSign size={22} />
          </div>
        </div>

        <div className="admin-kpi-card">
          <div>
            <div className="admin-kpi-label">Average Sale Price</div>
            <div className="admin-kpi-val">{avgBuyPrice.toLocaleString()} BHD</div>
            <div className="admin-kpi-sub">Freehold apartments and luxury villas</div>
          </div>
          <div className="admin-kpi-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="admin-kpi-card">
          <div>
            <div className="admin-kpi-label">Lead Conversion Ratio</div>
            <div className="admin-kpi-val">87.5%</div>
            <div className="admin-kpi-sub">Inquiries contacted by brokers within 24h</div>
          </div>
          <div className="admin-kpi-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Top Performing Communities */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Top Communities by Inventory</h3>
            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Active Buytora listings</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {topLocations.map(([city, count]) => {
              const percent = properties.length ? Math.round((count / properties.length) * 100) : 0;
              return (
                <div key={city}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, marginBottom: 6 }}>
                    <span>{city}</span>
                    <span>{count} listings ({percent}%)</span>
                  </div>
                  <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: '#EF5E4E', borderRadius: 4 }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Property Type Breakdown */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Property Types Breakdown</h3>
            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Category distribution</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { type: 'Apartments', count: properties.filter(p => p.propertyType === 'Apartment').length, color: '#3B82F6' },
              { type: 'Villas & Compounds', count: properties.filter(p => p.propertyType === 'Villa').length, color: '#10B981' },
              { type: 'Luxury Penthouses', count: properties.filter(p => p.propertyType === 'Penthouse').length, color: '#8B5CF6' },
              { type: 'Studios', count: properties.filter(p => p.propertyType === 'Studio').length, color: '#F59E0B' },
              { type: 'Commercial Offices', count: properties.filter(p => p.propertyType === 'Commercial').length, color: '#EC4899' },
            ].map((item) => {
              const pct = properties.length ? Math.round((item.count / properties.length) * 100) : 0;
              return (
                <div key={item.type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, marginBottom: 6 }}>
                    <span>{item.type}</span>
                    <span>{item.count} units ({pct}%)</span>
                  </div>
                  <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: item.color, borderRadius: 4 }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
