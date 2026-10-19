'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  MessageSquare, 
  ShieldCheck, 
  Users, 
  ArrowUpRight, 
  Eye, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Phone, 
  Mail, 
  MessageCircle, 
  PlusCircle, 
  Star,
  MapPin,
  Sparkles
} from 'lucide-react';
import { fetchAdminStats } from '../../lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await fetchAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Error loading admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#6B7280' }}>
        <div style={{ 
          width: 40, 
          height: 40, 
          border: '3px solid #E5E7EB', 
          borderTopColor: '#EF5E4E', 
          borderRadius: '50%', 
          animation: 'spin 0.8s linear infinite', 
          margin: '0 auto 16px' 
        }}></div>
        <p>Loading admin statistics and records...</p>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const {
    totalProperties = 0,
    rentCount = 0,
    buyCount = 0,
    commercialCount = 0,
    verifiedCount = 0,
    featuredCount = 0,
    totalInquiries = 0,
    newInquiries = 0,
    totalAgents = 0,
    recentProperties = [],
    recentInquiries = [],
    dbStatus = 'Active'
  } = stats || {};

  const rentPercent = totalProperties ? Math.round((rentCount / totalProperties) * 100) : 0;
  const buyPercent = totalProperties ? Math.round((buyCount / totalProperties) * 100) : 0;
  const commercialPercent = totalProperties ? Math.round((commercialCount / totalProperties) * 100) : 0;

  return (
    <div>
      {/* KPI Cards Row */}
      <div className="admin-kpi-grid">
        {/* Card 1: Total Listings */}
        <div className="admin-kpi-card">
          <div>
            <div className="admin-kpi-label">Total Listings</div>
            <div className="admin-kpi-val">{totalProperties}</div>
            <div className="admin-kpi-sub">
              {rentCount} Rent • {buyCount} Sale • {commercialCount} Commercial
            </div>
          </div>
          <div className="admin-kpi-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
            <Building2 size={22} />
          </div>
        </div>

        {/* Card 2: Inquiries & Leads */}
        <div className="admin-kpi-card">
          <div>
            <div className="admin-kpi-label">Inquiries & Leads</div>
            <div className="admin-kpi-val">{totalInquiries}</div>
            <div className="admin-kpi-sub">
              <span style={{ color: '#D97706', fontWeight: 700 }}>{newInquiries} New Leads</span> requiring response
            </div>
          </div>
          <div className="admin-kpi-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <MessageSquare size={22} />
          </div>
        </div>

        {/* Card 3: Verified Properties */}
        <div className="admin-kpi-card">
          <div>
            <div className="admin-kpi-label">Verified Listings</div>
            <div className="admin-kpi-val">{verifiedCount}</div>
            <div className="admin-kpi-sub">
              {featuredCount} Promoted as Featured
            </div>
          </div>
          <div className="admin-kpi-icon" style={{ background: '#DEF7EC', color: '#0E9F6E' }}>
            <ShieldCheck size={22} />
          </div>
        </div>

        {/* Card 4: Agents */}
        <div className="admin-kpi-card">
          <div>
            <div className="admin-kpi-label">Certified Agents</div>
            <div className="admin-kpi-val">{totalAgents}</div>
            <div className="admin-kpi-sub">
              Top rated SuperAgents & partners
            </div>
          </div>
          <div className="admin-kpi-icon" style={{ background: '#FFF1F0', color: '#EF5E4E' }}>
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* Featured Cities Showcase Quick Access Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
        color: '#FFFFFF',
        borderRadius: 12,
        padding: '20px 24px',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 4px 15px rgba(67, 56, 202, 0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}>
            <MapPin size={24} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                Homepage Showcase
              </span>
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>LocationExplorer Component</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Featured Cities &amp; Destinations
            </h3>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '0.86rem' }}>
              Add, edit, or reorder the prominent destination cards shown to visitors on the website homepage.
            </p>
          </div>
        </div>

        <Link
          href="/admin/cities"
          style={{
            background: '#FFFFFF',
            color: '#4338CA',
            padding: '10px 20px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: '0.88rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'transform 0.15s ease',
          }}
        >
          <span>Manage Featured Cities</span>
          <ArrowUpRight size={16} />
        </Link>
      </div>

      {/* Homepage "At a Glance" Stats Quick Access Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #111112 0%, #1F1B2E 50%, #2D1B4E 100%)',
        color: '#FFFFFF',
        borderRadius: 12,
        padding: '20px 24px',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 4px 15px rgba(127, 81, 255, 0.15)',
        border: '1px solid rgba(127, 81, 255, 0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: 'rgba(127, 81, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#A78BFA',
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px', background: 'rgba(127, 81, 255, 0.3)', color: '#D8B4FE', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                Homepage "At A Glance"
              </span>
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>PropertyStats Component</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Dynamic Clarity &amp; Metric Counters
            </h3>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '0.86rem' }}>
              Deals completed, clients assisted, residences evaluated, and satisfaction ratings with live system auto-sync.
            </p>
          </div>
        </div>

        <Link
          href="/admin/stats"
          style={{
            background: '#7F51FF',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: '0.88rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          <span>Manage At a Glance Stats</span>
          <ArrowUpRight size={16} />
        </Link>
      </div>


      {/* Portfolio Distribution & Quick Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 28 }}>
        {/* Category Breakdown */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Inventory Composition</h3>
            <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>
              Live Portfolio Breakdown
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Rent */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, marginBottom: 6 }}>
                <span>Residential Rentals</span>
                <span>{rentCount} units ({rentPercent}%)</span>
              </div>
              <div style={{ height: 8, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${rentPercent}%`, height: '100%', background: '#10B981', borderRadius: 4 }}></div>
              </div>
            </div>

            {/* Sale */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, marginBottom: 6 }}>
                <span>Properties for Sale</span>
                <span>{buyCount} units ({buyPercent}%)</span>
              </div>
              <div style={{ height: 8, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${buyPercent}%`, height: '100%', background: '#3B82F6', borderRadius: 4 }}></div>
              </div>
            </div>

            {/* Commercial */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, marginBottom: 6 }}>
                <span>Commercial & Offices</span>
                <span>{commercialCount} units ({commercialPercent}%)</span>
              </div>
              <div style={{ height: 8, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${commercialPercent}%`, height: '100%', background: '#EC4899', borderRadius: 4 }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* System & DB Status Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">System & Database Status</h3>
            <span style={{ fontSize: '0.75rem', background: '#DEF7EC', color: '#03543F', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
              HEALTHY
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: 10, fontSize: '0.9rem' }}>
              <span style={{ color: '#6B7280' }}>Database Engine:</span>
              <strong style={{ color: '#111827' }}>{dbStatus}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: 10, fontSize: '0.9rem' }}>
              <span style={{ color: '#6B7280' }}>Express Server:</span>
              <strong style={{ color: '#10B981' }}>Online (Port 5000)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: 10, fontSize: '0.9rem' }}>
              <span style={{ color: '#6B7280' }}>Frontend Framework:</span>
              <strong style={{ color: '#111827' }}>Next.js 14 (App Router)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: '#6B7280' }}>Primary Region:</span>
              <strong style={{ color: '#111827' }}>Kingdom of Bahrain (BHD)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Inquiries Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Recent Client Inquiries & Leads</h3>
            <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>
              Prospective tenants and buyers who submitted contact forms
            </p>
          </div>
          <Link href="/admin/inquiries" className="admin-btn admin-btn-outline">
            <span>View All Leads ({totalInquiries})</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {recentInquiries.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: '#9CA3AF' }}>
            No recent inquiries.
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Contact Info</th>
                  <th>Target Listing</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentInquiries.map((inq) => (
                  <tr key={inq._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#111827' }}>{inq.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                        {new Date(inq.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inq.phone}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{inq.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {inq.propertyTitle}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Ref: {inq.propertyRef}</span>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '0.82rem' }}>
                        {inq.inquiryType || 'Email'}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-pill admin-pill-${inq.status || 'new'}`}>
                        {inq.status || 'New'}
                      </span>
                    </td>
                    <td>
                      <a
                        href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-btn admin-btn-outline"
                        style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                      >
                        <MessageCircle size={13} color="#25D366" />
                        <span>WhatsApp</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Properties Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Recent Property Inventory</h3>
            <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>
              Latest added properties across all markets
            </p>
          </div>
          <Link href="/admin/properties" className="admin-btn admin-btn-outline">
            <span>Manage All Properties ({totalProperties})</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Category</th>
                <th>Type</th>
                <th>Price</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentProperties.map((prop) => (
                <tr key={prop._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=120&q=80'}
                        alt=""
                        style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#111827', maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prop.title}
                        </div>
                        <span style={{ fontSize: '0.76rem', color: '#9CA3AF' }}>Ref: {prop.referenceNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`admin-pill admin-pill-${prop.category}`}>
                      {prop.category}
                    </span>
                  </td>
                  <td>{prop.propertyType}</td>
                  <td>
                    <strong style={{ color: '#EF5E4E' }}>
                      {prop.price?.toLocaleString()} {prop.currency || 'BHD'}
                    </strong>
                    {prop.category === 'rent' && <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>/mo</span>}
                  </td>
                  <td>{prop.location?.city}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {prop.isVerified && (
                        <span style={{ background: '#DEF7EC', color: '#03543F', padding: '2px 6px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                          VERIFIED
                        </span>
                      )}
                      {prop.isFeatured && (
                        <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                          FEATURED
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <Link
                      href={`/properties/${prop._id}`}
                      target="_blank"
                      className="admin-btn admin-btn-outline"
                      style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                    >
                      <Eye size={13} />
                      <span>View</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
