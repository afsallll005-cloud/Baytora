'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Building,
  Bed,
  DollarSign,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  X,
  Users,
  ArrowRight,
  Home,
  Check,
  Star
} from 'lucide-react';
import { fetchProperties, fetchAgents } from '../lib/api';
import { initialProperties } from '../lib/mockData';
import './HeroSearch.css';

export default function HeroSearch() {
  const router = useRouter();
  const searchWrapperRef = useRef(null);

  const [activeTab, setActiveTab] = useState('buy'); // 'buy' | 'rent' | 'commercial' | 'agents'
  const [searchLocation, setSearchLocation] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [bedrooms, setBedrooms] = useState('any');
  const [maxPrice, setMaxPrice] = useState('');
  const [furnished, setFurnished] = useState('all');
  const [agentSpecialty, setAgentSpecialty] = useState('all');
  const [showLocationMenu, setShowLocationMenu] = useState(false);

  // Live dynamic data
  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [propsRes, agentsRes] = await Promise.all([
          fetchProperties().catch(() => ({ data: [] })),
          fetchAgents().catch(() => []),
        ]);

        const loadedProps =
          propsRes && propsRes.data && propsRes.data.length > 0
            ? propsRes.data
            : initialProperties;
        setProperties(loadedProps);

        if (agentsRes && Array.isArray(agentsRes) && agentsRes.length > 0) {
          setAgents(agentsRes);
        }
      } catch (err) {
        setProperties(initialProperties);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowLocationMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detect currency from data
  const detectedCurrency = properties.find((p) => p.currency)?.currency || '$';
  const isUSD = detectedCurrency === '$' || detectedCurrency === 'USD';
  const currencySymbol = isUSD ? '$' : `${detectedCurrency} `;


  // Distinct locations with listing counts
  const locationsMap = {};
  properties.forEach((p) => {
    const city = p.location?.city?.trim();
    if (city) {
      if (!locationsMap[city]) {
        locationsMap[city] = {
          city,
          governorate: p.location?.governorate ? p.location.governorate.replace(' Governorate', '') : 'FL',
          count: 0,
        };
      }
      locationsMap[city].count++;
    }
  });
  const dynamicLocations = Object.values(locationsMap).sort((a, b) => b.count - a.count);

  // Distinct property types for the active category
  const typesMap = {};
  properties
    .filter((p) => activeTab === 'agents' || p.category === activeTab)
    .forEach((p) => {
      if (p.propertyType) {
        typesMap[p.propertyType] = (typesMap[p.propertyType] || 0) + 1;
      }
    });
  const dynamicTypes = Object.entries(typesMap).map(([type, count]) => ({ type, count }));

  // Distinct Agent specialties
  const specialtiesSet = new Set();
  agents.forEach((a) => {
    if (Array.isArray(a.specialties)) {
      a.specialties.forEach((s) => specialtiesSet.add(s));
    }
  });
  const dynamicSpecialties = Array.from(specialtiesSet);

  // Search filtering logic for auto-complete dropdown
  const query = searchLocation.trim().toLowerCase();

  const matchingLocations = dynamicLocations.filter(
    (loc) => loc.city.toLowerCase().includes(query) || loc.governorate.toLowerCase().includes(query)
  );

  const matchingProperties = properties
    .filter((p) => {
      const matchCat = activeTab === 'agents' ? true : p.category === activeTab;
      const matchQuery =
        p.title.toLowerCase().includes(query) ||
        p.location?.city?.toLowerCase().includes(query) ||
        p.propertyType?.toLowerCase().includes(query) ||
        p.referenceNumber?.toLowerCase().includes(query);
      return matchCat && matchQuery;
    })
    .slice(0, 4);

  const matchingAgents = agents
    .filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.company.toLowerCase().includes(query) ||
        (Array.isArray(a.specialties) && a.specialties.some((s) => s.toLowerCase().includes(query)))
    )
    .slice(0, 3);

  // Handle Search Submission
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setShowLocationMenu(false);

    if (activeTab === 'agents') {
      const params = new URLSearchParams();
      if (searchLocation) params.set('search', searchLocation);
      if (agentSpecialty !== 'all') params.set('specialty', agentSpecialty);
      router.push(`/agents?${params.toString()}`);
      return;
    }

    const params = new URLSearchParams();
    if (activeTab !== 'all') params.set('category', activeTab);
    if (searchLocation) params.set('search', searchLocation);
    if (propertyType !== 'all') params.set('propertyType', propertyType);
    if (bedrooms !== 'any') params.set('bedrooms', bedrooms);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (furnished !== 'all') params.set('furnished', furnished);

    router.push(`/properties?${params.toString()}`);
  };

  const handleSelectLocation = (city) => {
    setSearchLocation(city);
    setShowLocationMenu(false);
  };

  const handleSelectProperty = (prop) => {
    setShowLocationMenu(false);
    router.push(`/properties/${prop._id}`);
  };

  const handleSelectAgent = (agent) => {
    setShowLocationMenu(false);
    router.push(`/agents?search=${encodeURIComponent(agent.name)}`);
  };

  // Dynamic quick search chips based on active data
  const dynamicChips = [
    ...dynamicLocations.slice(0, 3).map((loc) => ({
      label: `${loc.city}`,
      onClick: () =>
        router.push(
          `/properties?search=${encodeURIComponent(loc.city)}${activeTab !== 'agents' ? `&category=${activeTab}` : ''}`
        ),
    })),
    {
      label: 'Luxury Penthouses',
      onClick: () =>
        router.push(
          `/properties?propertyType=Penthouse${activeTab !== 'agents' ? `&category=${activeTab}` : ''}`
        ),
    },
    {
      label: 'Waterfront Villas',
      onClick: () =>
        router.push(
          `/properties?propertyType=Villa&search=Waterfront${activeTab !== 'agents' ? `&category=${activeTab}` : ''}`
        ),
    },
    {
      label: 'SuperAgents',
      onClick: () => router.push('/agents'),
    },
  ];

  return (
    <section className="hero-wrapper luxterra-hero">
      {/* Upper Area: Lead Statement + View Listings Button + Search Form in proper area */}
      <div className="hero-content-area">
        <div className="hero-intro-block">
          <p className="hero-lead-text">
            We help buyers and sellers navigate Florida real estate with clarity—featuring curated listings and seamless support.
          </p>
          <div className="hero-actions-row">
            <Link href="/properties" className="hero-view-listings-btn">
              View listings
            </Link>
          </div>
        </div>

        {/* Search Container in its proper area */}
        <div className="search-container">
          {/* Category Tabs */}
          <div className="search-tabs">
            <button
              type="button"
              className={`search-tab ${activeTab === 'buy' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('buy');
                setMaxPrice('');
              }}
            >
              <span>Buy</span>
            </button>

            <button
              type="button"
              className={`search-tab ${activeTab === 'rent' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('rent');
                setMaxPrice('');
              }}
            >
              <span>Rent</span>
            </button>

            <button
              type="button"
              className={`search-tab ${activeTab === 'commercial' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('commercial');
                setMaxPrice('');
              }}
            >
              <span>Commercial</span>
            </button>

            <button
              type="button"
              className={`search-tab ${activeTab === 'agents' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('agents');
              }}
            >
              <Users size={15} />
              <span>Find Agents</span>
            </button>
          </div>

          {/* Search & Filter Inputs */}
          <form onSubmit={handleSearch} className="search-bar-body">
            <div className="search-input-row" ref={searchWrapperRef}>
              <div className="location-input-wrapper">
                <MapPin size={20} className="location-icon" />
                <input
                  type="text"
                  className="location-input"
                  placeholder={
                    activeTab === 'agents'
                      ? 'Search certified agents by name or specialty (e.g. Tariq, Waterfront, Penthouses)...'
                      : `Search by city, community, or title (e.g. ${dynamicLocations.slice(0, 2).map((l) => l.city).join(', ') || 'Tampa, Bayshore'})...`
                  }
                  value={searchLocation}
                  onChange={(e) => {
                    setSearchLocation(e.target.value);
                    setShowLocationMenu(true);
                  }}
                  onFocus={() => setShowLocationMenu(true)}
                />

                {/* Clear button if user typed text */}
                {searchLocation && (
                  <button
                    type="button"
                    className="location-clear-btn"
                    onClick={() => setSearchLocation('')}
                    title="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}

                {/* ===================================================================
                  LIVE AUTO-COMPLETE & SUGGESTIONS DROPDOWN
                  =================================================================== */}
                {showLocationMenu && (
                  <div className="search-dropdown-menu">
                    {/* Mode 1: Empty Query - Show Top Communities */}
                    {!query && (
                      <div className="search-dropdown-section">
                        <div className="search-dropdown-header">
                          <MapPin size={13} color="#7F51FF" />
                          <span>Popular Destinations &amp; Communities</span>
                        </div>
                        {dynamicLocations.slice(0, 6).map((loc) => (
                          <div
                            key={loc.city}
                            className="search-dropdown-item"
                            onClick={() => handleSelectLocation(loc.city)}
                          >
                            <div className="search-item-left">
                              <MapPin size={16} color="#7F51FF" />
                              <div>
                                <div className="search-location-name">{loc.city}</div>
                                <div className="search-location-sub">{loc.governorate}</div>
                              </div>
                            </div>
                            <span className="search-count-pill">{loc.count} listings</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mode 2: Has Query - Show Matching Locations */}
                    {query && matchingLocations.length > 0 && (
                      <div className="search-dropdown-section">
                        <div className="search-dropdown-header">
                          <MapPin size={13} color="#7F51FF" />
                          <span>Matching Communities</span>
                        </div>
                        {matchingLocations.slice(0, 4).map((loc) => (
                          <div
                            key={loc.city}
                            className="search-dropdown-item"
                            onClick={() => handleSelectLocation(loc.city)}
                          >
                            <div className="search-item-left">
                              <MapPin size={16} color="#7F51FF" />
                              <div>
                                <div className="search-location-name">{loc.city}</div>
                                <div className="search-location-sub">{loc.governorate}</div>
                              </div>
                            </div>
                            <span className="search-count-pill">{loc.count} listings</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mode 3: Has Query & In Property Mode - Show Matching Direct Properties */}
                    {query && activeTab !== 'agents' && matchingProperties.length > 0 && (
                      <div className="search-dropdown-section">
                        <div className="search-dropdown-header">
                          <Home size={13} color="#7F51FF" />
                          <span>Matching Properties ({matchingProperties.length})</span>
                        </div>
                        {matchingProperties.map((prop) => (
                          <div
                            key={prop._id}
                            className="search-dropdown-item"
                            onClick={() => handleSelectProperty(prop)}
                          >
                            <div className="search-item-left">
                              <img
                                src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80'}
                                alt={prop.title}
                                className="search-property-thumb"
                              />
                              <div style={{ minWidth: 0 }}>
                                <div className="search-property-title">{prop.title}</div>
                                <div className="search-property-meta">
                                  <span>{prop.location?.city}</span>
                                  <span>•</span>
                                  <span>{prop.bedrooms} Bed</span>
                                  <span>•</span>
                                  <span>{prop.propertyType}</span>
                                </div>
                              </div>
                            </div>
                            <div className="search-property-price">
                              {currencySymbol}
                              {prop.price?.toLocaleString()}
                              {prop.category === 'rent' ? '/mo' : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mode 4: Has Query or In Agent Mode - Show Matching Agents */}
                    {(activeTab === 'agents' || (query && matchingAgents.length > 0)) && (
                      <div className="search-dropdown-section">
                        <div className="search-dropdown-header">
                          <Users size={13} color="#7F51FF" />
                          <span>Verified Real Estate Agents</span>
                        </div>
                        {(activeTab === 'agents' && !query ? agents.slice(0, 4) : matchingAgents).map((agent) => (
                          <div
                            key={agent._id || agent.id}
                            className="search-dropdown-item"
                            onClick={() => handleSelectAgent(agent)}
                          >
                            <div className="search-item-left">
                              <img
                                src={agent.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80'}
                                alt={agent.name}
                                className="search-agent-thumb"
                              />
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span className="search-agent-name">{agent.name}</span>
                                  {agent.isSuperAgent && (
                                    <span style={{ fontSize: '0.65rem', background: '#7F51FF', color: '#FFF', padding: '1px 5px', borderRadius: 10, fontWeight: 700 }}>
                                      SuperAgent
                                    </span>
                                  )}
                                </div>
                                <div className="search-agent-company">
                                  {agent.company} • ★ {agent.rating || 4.9}
                                </div>
                              </div>
                            </div>
                            <ArrowRight size={15} color="#9CA3AF" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Empty state when query produces no matches */}
                    {query && matchingLocations.length === 0 && matchingProperties.length === 0 && matchingAgents.length === 0 && (
                      <div className="search-dropdown-empty">
                        No exact matches found for <strong>"{searchLocation}"</strong>.
                        <div style={{ marginTop: 6, fontSize: '0.8rem', color: '#9CA3AF' }}>
                          Press Enter or click Search to browse all listings.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button type="submit" className="search-submit-btn">
                <Search size={18} />
                <span>{activeTab === 'agents' ? 'Find Agents' : 'Search Properties'}</span>
              </button>
            </div>

            {/* Contextual Dynamic Filters Row */}
            {activeTab !== 'agents' ? (
              <div className="filters-row">
                {/* Dynamic Property Types */}
                <select
                  className="filter-select"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                >
                  <option value="all">Property Type (All)</option>
                  {dynamicTypes.length > 0 ? (
                    dynamicTypes.map(({ type, count }) => (
                      <option key={type} value={type}>
                        {type} ({count})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Apartment">Apartment</option>
                      <option value="Villa">Villa</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Penthouse">Penthouse</option>
                      <option value="Studio">Studio</option>
                      <option value="Commercial">Commercial</option>
                    </>
                  )}
                </select>

                {/* Bedrooms */}
                {activeTab !== 'commercial' && (
                  <select
                    className="filter-select"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                  >
                    <option value="any">Bedrooms (Any)</option>
                    <option value="0">Studio</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4+">4+ Bedrooms</option>
                  </select>
                )}

                {/* Dynamic Price Range */}
                <select
                  className="filter-select"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                >
                  <option value="">Max Price (Any)</option>
                  {activeTab === 'rent' ? (
                    isUSD ? (
                      <>
                        <option value="1000">Up to $1,000/mo</option>
                        <option value="1500">Up to $1,500/mo</option>
                        <option value="2500">Up to $2,500/mo</option>
                        <option value="4000">Up to $4,000/mo</option>
                        <option value="6000">Up to $6,000/mo</option>
                      </>
                    ) : (
                      <>
                        <option value="300">Up to 300 BHD/mo</option>
                        <option value="500">Up to 500 BHD/mo</option>
                        <option value="800">Up to 800 BHD/mo</option>
                        <option value="1200">Up to 1,200 BHD/mo</option>
                        <option value="2000">Up to 2,000 BHD/mo</option>
                      </>
                    )
                  ) : activeTab === 'commercial' ? (
                    isUSD ? (
                      <>
                        <option value="2000">Up to $2,000/mo</option>
                        <option value="5000">Up to $5,000/mo</option>
                        <option value="10000">Up to $10,000/mo</option>
                        <option value="25000">Up to $25,000/mo</option>
                      </>
                    ) : (
                      <>
                        <option value="500">Up to 500 BHD</option>
                        <option value="1000">Up to 1,000 BHD</option>
                        <option value="2500">Up to 2,500 BHD</option>
                        <option value="5000">Up to 5,000 BHD</option>
                      </>
                    )
                  ) : (
                    isUSD ? (
                      <>
                        <option value="350000">Up to $350,000</option>
                        <option value="500000">Up to $500,000</option>
                        <option value="750000">Up to $750,000</option>
                        <option value="1000000">Up to $1,000,000</option>
                        <option value="2000000">Up to $2,000,000</option>
                      </>
                    ) : (
                      <>
                        <option value="60000">Up to 60,000 BHD</option>
                        <option value="100000">Up to 100,000 BHD</option>
                        <option value="150000">Up to 150,000 BHD</option>
                        <option value="250000">Up to 250,000 BHD</option>
                        <option value="500000">Up to 500,000 BHD</option>
                      </>
                    )
                  )}
                </select>

                {/* Furnishing */}
                <select
                  className="filter-select"
                  value={furnished}
                  onChange={(e) => setFurnished(e.target.value)}
                >
                  <option value="all">Furnishing (All)</option>
                  <option value="Furnished">Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>
            ) : (
              /* Contextual Filters for 'Find Agents' */
              <div className="filters-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <select
                  className="filter-select"
                  value={agentSpecialty}
                  onChange={(e) => setAgentSpecialty(e.target.value)}
                >
                  <option value="all">Agent Specialty (All)</option>
                  {dynamicSpecialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.86rem', color: '#6B7280' }}>
                  <Check size={16} color="#10B981" />
                  <span>Verified Broker Consultants</span>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Bottom Area: Grand "Luxterra" Brand Watermark + "Talk to an agent" Card */}
      <div className="hero-bottom-row">
        <div className="hero-brand-watermark">Luxterra</div>

        <Link href="/agents" className="hero-agent-card" title="Talk to a certified agent">
          <div className="hero-agent-avatar-wrap">
            <img
              src={agents[0]?.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80'}
              alt="Talk to an agent"
              className="hero-agent-avatar"
            />
          </div>
          <div className="hero-agent-info">
            <span className="hero-agent-sub">Let's help you</span>
            <span className="hero-agent-title">Talk to an agent</span>
          </div>
          <div className="hero-agent-arrow-btn">
            <ArrowRight size={16} />
          </div>
        </Link>
      </div>
    </section>
  );
}
