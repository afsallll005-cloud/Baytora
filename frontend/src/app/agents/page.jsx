'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Star, MessageCircle, Phone, Search, Award, CheckCircle } from 'lucide-react';
import { fetchAgents } from '../../lib/api';

const mockAgents = [
  {
    id: 1,
    name: "Tariq Al-Mansoor",
    company: "Elite Gulf Real Estate",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    phone: "+973 3944 5511",
    whatsapp: "97339445511",
    email: "tariq@elitehomes-bh.com",
    speaks: ["English", "Arabic", "French"],
    specialties: ["Luxury Penthouses", "Waterfront Homes", "Reef Island", "Amwaj"],
    closedDeals: 74,
    rating: 4.95,
    isSuperAgent: true,
  },
  {
    id: 2,
    name: "Zainab Al-Majid",
    company: "Luxe Realty International",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    phone: "+973 3922 8833",
    whatsapp: "97339228833",
    email: "zainab@luxebahrain.com",
    speaks: ["English", "Arabic"],
    specialties: ["Seef Commercial", "Diplomatic Residences", "Penthouses"],
    closedDeals: 89,
    rating: 4.90,
    isSuperAgent: true,
  },
  {
    id: 3,
    name: "Ahmed Hassan",
    company: "Prime Villas & Estates",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    phone: "+973 3655 4400",
    whatsapp: "97336554400",
    email: "ahmed@primevillas.bh",
    speaks: ["English", "Arabic", "Hindi"],
    specialties: ["Saar Compounds", "Janabiya Villas", "Expat Housing"],
    closedDeals: 112,
    rating: 4.98,
    isSuperAgent: true,
  },
  {
    id: 4,
    name: "Mariam Al-Kuwari",
    company: "Oasis Realty Partners",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    phone: "+973 3811 9922",
    whatsapp: "97338119922",
    email: "mariam@oasisbh.com",
    speaks: ["English", "Arabic"],
    specialties: ["Juffair Apartments", "Busaiteen Studios", "Short-term Rentals"],
    closedDeals: 58,
    rating: 4.88,
    isSuperAgent: false,
  }
];

export default function AgentsPage() {
  const [agents, setAgents] = useState(mockAgents);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlySuperAgents, setOnlySuperAgents] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAgents();
        if (data && Array.isArray(data) && data.length > 0) {
          setAgents(data);
        }
      } catch (e) {
        console.warn('Could not load agents from API, using fallback:', e);
      }
    }
    load();
  }, []);

  const filteredAgents = agents.filter((agent) => {
    const specialtiesList = Array.isArray(agent.specialties) ? agent.specialties : [];
    const matchesSearch =
      agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialtiesList.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSuper = onlySuperAgents ? agent.isSuperAgent : true;
    return matchesSearch && matchesSuper;
  });

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 40px' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.6px', marginBottom: 12 }}>
          Find Real Estate Agents in Bahrain
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Connect with certified SuperAgents and top-performing property consultants with proven track records in your target neighborhood.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div style={{ 
        maxWidth: 780, 
        margin: '0 auto 40px', 
        background: '#FFFFFF', 
        border: '1px solid var(--border-light)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <Search size={18} color="var(--primary)" />
          <input
            type="text"
            placeholder="Search by agent name, agency, or location (e.g. Saar, Reef Island)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.96rem' }}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <input 
            type="checkbox" 
            checked={onlySuperAgents} 
            onChange={(e) => setOnlySuperAgents(e.target.checked)}
            style={{ accentColor: 'var(--primary)', width: 16, height: 16 }}
          />
          <span>SuperAgents only</span>
        </label>
      </div>

      {/* Agents Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 28 }}>
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-xl)',
              padding: 24,
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'center',
              position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
            }}
          >
            {/* SuperAgent Badge */}
            {agent.isSuperAgent && (
              <div style={{ position: 'absolute', top: 16, right: 16 }}>
                <span className="badge badge-super">
                  <Star size={11} fill="currentColor" />
                  <span>SuperAgent</span>
                </span>
              </div>
            )}

            {/* Avatar */}
            <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto 16px' }}>
              <img
                src={agent.photo}
                alt={agent.name}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)' }}
              />
              <div style={{ position: 'absolute', bottom: 2, right: 2, background: 'var(--verified-green)', color: 'white', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                <CheckCircle size={12} strokeWidth={3} />
              </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              {agent.name}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 500, marginBottom: 12 }}>
              {agent.company}
            </p>

            {/* Metrics */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, padding: '10px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Rating</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
                  <Star size={14} fill="#D97706" color="#D97706" />
                  <span>{agent.rating}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Deals</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {agent.closedDeals} closed
                </div>
              </div>
            </div>

            {/* Specialties */}
            <div style={{ marginBottom: 20, textAlign: 'left' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Specialties:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {agent.specialties.map((s, idx) => (
                  <span key={idx} style={{ background: 'var(--bg-page)', padding: '3px 8px', borderRadius: 4, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 'auto' }}>
              <a
                href={`https://wa.me/${agent.whatsapp}?text=Hi%20${encodeURIComponent(agent.name)},%20I%20found%20you%20on%20Baytora.`}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn action-whatsapp"
                style={{ justifyContent: 'center', height: 40 }}
              >
                <MessageCircle size={15} />
                <span>WhatsApp</span>
              </a>

              <a
                href={`tel:${agent.phone}`}
                className="action-btn action-call"
                style={{ justifyContent: 'center', height: 40 }}
              >
                <Phone size={14} />
                <span>Call</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
