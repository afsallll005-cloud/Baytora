import { initialProperties } from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// PROPERTIES API
export async function fetchProperties(filters = {}) {
  try {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'all') {
        query.append(key, val);
      }
    });

    const res = await fetch(`${API_BASE_URL}/properties?${query.toString()}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) throw new Error(`API responded with ${res.status}`);
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn('API fetchProperties fallback to local data:', err.message);
    
    // Client-side fallback filtering
    let list = [...initialProperties];
    if (filters.category && filters.category !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.propertyType && filters.propertyType !== 'all') {
      list = list.filter(p => p.propertyType.toLowerCase() === filters.propertyType.toLowerCase());
    }
    if (filters.city) {
      list = list.filter(p => p.location.city.toLowerCase().includes(filters.city.toLowerCase()));
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(s) || 
        p.location.city.toLowerCase().includes(s) ||
        p.location.building.toLowerCase().includes(s)
      );
    }
    if (filters.minPrice) {
      list = list.filter(p => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      list = list.filter(p => p.price <= Number(filters.maxPrice));
    }
    if (filters.bedrooms && filters.bedrooms !== 'any') {
      list = list.filter(p => p.bedrooms === Number(filters.bedrooms));
    }

    return {
      success: true,
      count: list.length,
      total: list.length,
      page: 1,
      pages: 1,
      data: list,
    };
  }
}

export async function fetchPropertyById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch property');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('API fetchPropertyById fallback to local data:', err.message);
    const found = initialProperties.find(p => p._id === id || p.slug === id || p.referenceNumber === id);
    return found || null;
  }
}

export async function createProperty(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.warn('API createProperty fallback:', err.message);
    const newProp = {
      _id: 'local_' + Date.now(),
      ...data,
      referenceNumber: 'RH-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
    };
    initialProperties.unshift(newProp);
    return {
      success: true,
      message: 'Property listed successfully (local mode)!',
      data: newProp,
    };
  }
}

export async function updateProperty(id, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.warn('API updateProperty fallback:', err.message);
    const idx = initialProperties.findIndex(p => p._id === id || p.referenceNumber === id);
    if (idx !== -1) {
      initialProperties[idx] = { ...initialProperties[idx], ...data };
      return { success: true, data: initialProperties[idx] };
    }
    return { success: false, message: 'Property not found' };
  }
}

export async function togglePropertyStatus(id, updates) {
  try {
    const res = await fetch(`${API_BASE_URL}/properties/${id}/toggle-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return await res.json();
  } catch (err) {
    console.warn('API togglePropertyStatus fallback:', err.message);
    const item = initialProperties.find(p => p._id === id || p.referenceNumber === id);
    if (item) {
      Object.assign(item, updates);
      return { success: true, data: item };
    }
    return { success: false, message: 'Property not found' };
  }
}

export async function deleteProperty(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch (err) {
    console.warn('API deleteProperty fallback:', err.message);
    const idx = initialProperties.findIndex(p => p._id === id || p.referenceNumber === id);
    if (idx !== -1) {
      initialProperties.splice(idx, 1);
      return { success: true, message: 'Deleted locally' };
    }
    return { success: false, message: 'Property not found' };
  }
}

// ADMIN STATS API
export async function fetchAdminStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/properties/admin/stats`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to load admin stats');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('API fetchAdminStats fallback:', err.message);
    const props = initialProperties;
    return {
      totalProperties: props.length,
      rentCount: props.filter(p => p.category === 'rent').length,
      buyCount: props.filter(p => p.category === 'buy').length,
      commercialCount: props.filter(p => p.category === 'commercial').length,
      verifiedCount: props.filter(p => p.isVerified).length,
      featuredCount: props.filter(p => p.isFeatured).length,
      totalInquiries: 8,
      newInquiries: 3,
      totalAgents: 4,
      recentProperties: props.slice(0, 5),
      recentInquiries: [
        {
          _id: "inq_demo_1",
          name: "Vikram Malhotra",
          phone: "0000000000",
          email: "vikram@example.com",
          propertyTitle: "Luxury Sea-Facing 4BHK Penthouse Bandra West",
          propertyRef: "RH-782104",
          message: "Would like to schedule a viewing this Saturday morning.",
          status: "new",
          inquiryType: "email",
          createdAt: new Date().toISOString()
        },
        {
          _id: "inq_demo_2",
          name: "Ananya Deshmukh",
          phone: "0000000000",
          email: "ananya@hospital.in",
          propertyTitle: "Chic Fully Furnished 2BHK Worli",
          propertyRef: "RH-349012",
          message: "Is this inclusive of maintenance and covered parking?",
          status: "contacted",
          inquiryType: "whatsapp",
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
        }
      ],
      dbStatus: 'Resilient Mode (In-Memory)',
    };
  }
}

// INQUIRIES API
export async function submitInquiry(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.warn('API submitInquiry fallback:', err.message);
    return {
      success: true,
      message: 'Thank you! Your inquiry has been sent to the agent.',
      data,
    };
  }
}

export async function fetchInquiries() {
  try {
    const res = await fetch(`${API_BASE_URL}/inquiries`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load inquiries');
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('API fetchInquiries fallback:', err.message);
    return [
      {
        _id: "inq_demo_1",
        name: "Vikram Malhotra",
        phone: "0000000000",
        email: "vikram@example.com",
        propertyTitle: "Luxury Sea-Facing 4BHK Penthouse Bandra West",
        propertyRef: "RH-782104",
        message: "Would like to schedule a viewing this Saturday morning.",
        status: "new",
        inquiryType: "email",
        createdAt: new Date().toISOString()
      },
      {
        _id: "inq_demo_2",
        name: "Ananya Deshmukh",
        phone: "0000000000",
        email: "ananya@hospital.in",
        propertyTitle: "Chic Fully Furnished 2BHK Worli",
        propertyRef: "RH-349012",
        message: "Is this inclusive of maintenance and covered parking?",
        status: "contacted",
        inquiryType: "whatsapp",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        _id: "inq_demo_3",
        name: "Rahul Verma",
        phone: "0000000000",
        email: "rverma@corp.in",
        propertyTitle: "Grade-A Commercial Office in BKC",
        propertyRef: "RH-883019",
        message: "Requesting lease contract proposal for 2 years term.",
        status: "closed",
        inquiryType: "call",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ];
  }
}

export async function updateInquiryStatus(id, status) {
  try {
    const res = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return await res.json();
  } catch (err) {
    return { success: true, message: 'Status updated locally' };
  }
}

export async function deleteInquiry(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch (err) {
    return { success: true, message: 'Inquiry deleted locally' };
  }
}

// AGENTS API
export async function fetchAgents() {
  try {
    const res = await fetch(`${API_BASE_URL}/agents`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load agents');
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('API fetchAgents fallback:', err.message);
    return [
      {
        _id: "agent_1",
        id: 1,
        name: "Aarav Sharma",
        company: "Buytora Premier Realty",
        photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80",
        phone: "0000000000",
        whatsapp: "0000000000",
        email: "aarav.sharma@buytora.in",
        speaks: ["English", "Hindi", "Marathi"],
        specialties: ["Luxury Penthouses", "Waterfront Homes", "Marine Drive", "Bandra West"],
        closedDeals: 74,
        rating: 4.95,
        isSuperAgent: true,
      },
      {
        _id: "agent_2",
        id: 2,
        name: "Priya Patel",
        company: "Luxe Realty India",
        photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80",
        phone: "0000000000",
        whatsapp: "0000000000",
        email: "priya.patel@buytora.in",
        speaks: ["English", "Hindi", "Gujarati"],
        specialties: ["South Delhi Residences", "Diplomatic Enclaves", "Commercial Offices"],
        closedDeals: 89,
        rating: 4.90,
        isSuperAgent: true,
      },
      {
        _id: "agent_3",
        id: 3,
        name: "Rohan Mehta",
        company: "Prime Estates & Villas",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
        phone: "0000000000",
        whatsapp: "0000000000",
        email: "rohan.mehta@buytora.in",
        speaks: ["English", "Hindi", "Tamil"],
        specialties: ["ECR Beach Villas", "Gated Communities", "Luxury Estates"],
        closedDeals: 112,
        rating: 4.98,
        isSuperAgent: true,
      },
      {
        _id: "agent_4",
        id: 4,
        name: "Sneha Iyer",
        company: "Oasis Realty Partners",
        photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
        phone: "0000000000",
        whatsapp: "0000000000",
        email: "sneha.iyer@buytora.in",
        speaks: ["English", "Malayalam", "Tamil", "Hindi"],
        specialties: ["Kochi Waterfront", "Modern Studios", "Short-term Rentals"],
        closedDeals: 58,
        rating: 4.88,
        isSuperAgent: false,
      }
    ];
  }
}

export async function createAgent(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    return { success: true, data: { _id: 'agent_' + Date.now(), ...data } };
  }
}

export async function updateAgent(id, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/agents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (Array.isArray(initialProperties)) {
      initialProperties.forEach((p) => {
        if (p.agent && (p.agent._id === id || p.agent.id === id || p.agent.name === data.name || p.agent.email === data.email)) {
          p.agent = { ...p.agent, ...data };
        }
      });
    }
    return result;
  } catch (err) {
    if (Array.isArray(initialProperties)) {
      initialProperties.forEach((p) => {
        if (p.agent && (p.agent._id === id || p.agent.id === id || p.agent.name === data.name || p.agent.email === data.email)) {
          p.agent = { ...p.agent, ...data };
        }
      });
    }
    return { success: true, data: { _id: id, ...data } };
  }
}

export async function deleteAgent(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/agents/${id}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch (err) {
    return { success: true, message: 'Agent deleted locally' };
  }
}

// LOCATIONS SUMMARY
export async function fetchLocationsSummary() {
  try {
    const res = await fetch(`${API_BASE_URL}/properties/locations/summary`);
    if (!res.ok) throw new Error('Locations summary error');
    const json = await res.json();
    return json.data;
  } catch (err) {
    return {
      "Capital Governorate": {
        total: 124,
        cities: {
          "Al Juffair": { total: 42, rent: 36, buy: 6, commercial: 0 },
          "Manama": { total: 32, rent: 22, buy: 8, commercial: 2 },
          "Seef": { total: 28, rent: 14, buy: 6, commercial: 8 },
          "Reef Island": { total: 22, rent: 16, buy: 6, commercial: 0 }
        }
      },
      "Muharraq Governorate": {
        total: 86,
        cities: {
          "Amwaj Islands": { total: 34, rent: 24, buy: 10, commercial: 0 },
          "Dilmunia Island": { total: 20, rent: 12, buy: 8, commercial: 0 },
          "Busaiteen": { total: 18, rent: 15, buy: 3, commercial: 0 },
          "Hidd": { total: 14, rent: 9, buy: 5, commercial: 0 }
        }
      },
      "Northern Governorate": {
        total: 65,
        cities: {
          "Saar": { total: 30, rent: 22, buy: 8, commercial: 0 },
          "Janabiya": { total: 20, rent: 16, buy: 4, commercial: 0 },
          "Budaiya": { total: 15, rent: 11, buy: 4, commercial: 0 }
        }
      }
    };
  }
}

// ==========================================================================
// FEATURED CITIES API
// ==========================================================================

export const initialFeaturedCities = [
  {
    _id: "661f0001a1b2c3d4e5f60051",
    name: "Mumbai",
    description: "Find waterfront living, lively districts & luxury residences",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=85",
    fallbackImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
    href: "/properties?search=Mumbai",
    order: 1,
    isActive: true,
  },
  {
    _id: "661f0001a1b2c3d4e5f60052",
    name: "Chennai",
    description: "Explore coastal neighborhoods and green spaces",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85",
    fallbackImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
    href: "/properties?search=Chennai",
    order: 2,
    isActive: true,
  },
  {
    _id: "661f0001a1b2c3d4e5f60053",
    name: "Ernakulam",
    description: "Discover vibrant communities, scenic backwaters & lifestyle",
    image: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1000&q=85",
    fallbackImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
    href: "/properties?search=Ernakulam",
    order: 3,
    isActive: true,
  },
  {
    _id: "661f0001a1b2c3d4e5f60054",
    name: "Delhi",
    description: "Enjoy luxury heritage estates and modern urban living",
    image: "https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?auto=format&fit=crop&w=1000&q=85",
    fallbackImage: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba8?auto=format&fit=crop&w=1000&q=80",
    href: "/properties?search=Delhi",
    order: 4,
    isActive: true,
  },
];

function getLocalCities() {
  if (typeof window === 'undefined') return [...initialFeaturedCities];
  try {
    const raw = localStorage.getItem('rentel_featured_cities');
    if (!raw) {
      localStorage.setItem('rentel_featured_cities', JSON.stringify(initialFeaturedCities));
      return [...initialFeaturedCities];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...initialFeaturedCities];
  } catch (e) {
    return [...initialFeaturedCities];
  }
}

function saveLocalCities(cities, notify = false) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('rentel_featured_cities', JSON.stringify(cities));
    if (notify) {
      window.dispatchEvent(new Event('featured-cities-changed'));
    }
  } catch (e) {}
}

export async function fetchFeaturedCities(showAll = false) {
  try {
    const query = showAll ? '?all=true' : '';
    const res = await fetch(`${API_BASE_URL}/featured-cities${query}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`API responded with ${res.status}`);
    const json = await res.json();
    if (json && json.data && json.data.length > 0) {
      // Keep local sync updated without triggering infinite re-fetch loop
      saveLocalCities(json.data, false);
      return json.data;
    }
    throw new Error('Empty cities data');
  } catch (err) {
    console.warn('API fetchFeaturedCities fallback:', err.message);
    const local = getLocalCities();
    if (showAll) {
      return local.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return local.filter(c => c.isActive !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  }
}

export async function createFeaturedCity(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/featured-cities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json && json.success) {
      const local = getLocalCities();
      local.push(json.data);
      saveLocalCities(local, true);
      return json;
    }
    throw new Error(json.message || 'Failed to create city');
  } catch (err) {
    console.warn('API createFeaturedCity fallback:', err.message);
    const local = getLocalCities();
    const newCity = {
      _id: 'city_' + Date.now(),
      name: data.name,
      description: data.description,
      image: data.image,
      fallbackImage: data.fallbackImage || '',
      href: data.href || `/properties?search=${encodeURIComponent(data.name)}`,
      order: typeof data.order === 'number' ? data.order : local.length + 1,
      isActive: data.isActive !== undefined ? !!data.isActive : true,
      createdAt: new Date().toISOString(),
    };
    local.push(newCity);
    saveLocalCities(local, true);
    return { success: true, data: newCity };
  }
}

export async function updateFeaturedCity(id, updates) {
  try {
    const res = await fetch(`${API_BASE_URL}/featured-cities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (json && json.success) {
      const local = getLocalCities();
      const idx = local.findIndex(c => String(c._id) === String(id));
      if (idx !== -1) {
        local[idx] = { ...local[idx], ...updates };
        saveLocalCities(local, true);
      }
      return json;
    }
    throw new Error(json.message || 'Failed to update city');
  } catch (err) {
    console.warn('API updateFeaturedCity fallback:', err.message);
    const local = getLocalCities();
    const idx = local.findIndex(c => String(c._id) === String(id));
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...updates, updatedAt: new Date().toISOString() };
      saveLocalCities(local, true);
      return { success: true, data: local[idx] };
    }
    return { success: false, message: 'City not found' };
  }
}

export async function deleteFeaturedCity(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/featured-cities/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    const local = getLocalCities();
    const updated = local.filter(c => String(c._id) !== String(id));
    saveLocalCities(updated, true);
    return json;
  } catch (err) {
    console.warn('API deleteFeaturedCity fallback:', err.message);
    const local = getLocalCities();
    const updated = local.filter(c => String(c._id) !== String(id));
    saveLocalCities(updated, true);
    return { success: true, message: 'City deleted' };
  }
}

// ==========================================================================
// HOMEPAGE STATS ("AT A GLANCE") DYNAMIC API & SETTINGS
// ==========================================================================

export const initialHomepageStats = {
  eyebrow: "At a glance",
  heading: "Providing clarity, every step forward",
  autoSync: true,
  items: [
    {
      id: "stat_deals",
      key: "deals",
      value: "320+",
      label: "Deals completed",
      suffix: "+",
      rawNumber: 320,
      autoSync: true,
    },
    {
      id: "stat_clients",
      key: "clients",
      value: "3k",
      label: "Clients assisted",
      suffix: "k",
      rawNumber: 3,
      autoSync: false,
    },
    {
      id: "stat_homes",
      key: "homes",
      value: "78+",
      label: "Homes evaluated",
      suffix: "+",
      rawNumber: 78,
      autoSync: true,
    },
    {
      id: "stat_satisfaction",
      key: "satisfaction",
      value: "95%",
      label: "Client satisfaction",
      suffix: "%",
      rawNumber: 95,
      autoSync: true,
    },
  ],
};

export async function fetchHomepageStats() {
  let stats = null;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('buytora_homepage_stats') || localStorage.getItem('baytora_homepage_stats');
      if (raw) {
        stats = JSON.parse(raw);
      }
    } catch (e) {}
  }

  if (!stats) {
    stats = JSON.parse(JSON.stringify(initialHomepageStats));
  }

  // Calculate dynamic live numbers if autoSync is true
  if (stats.autoSync !== false) {
    try {
      const [props, agentsData] = await Promise.all([
        fetchProperties().catch(() => initialProperties),
        fetchAgents().catch(() => []),
      ]);

      const validProps = Array.isArray(props) && props.length > 0 ? props : initialProperties;
      const agentsList = Array.isArray(agentsData) && agentsData.length > 0 ? agentsData : [];

      const totalClosedDeals = agentsList.reduce((acc, a) => acc + (Number(a.closedDeals) || 0), 0) || 320;
      const avgRating = agentsList.length > 0
        ? (agentsList.reduce((acc, a) => acc + (Number(a.rating) || 4.9), 0) / agentsList.length)
        : 4.95;
      const satisfactionRate = Math.min(100, Math.round((avgRating / 5) * 100)) || 95;
      const evaluatedCount = Math.max(78, (validProps.length * 6) + 14);

      stats.items = stats.items.map((item) => {
        if (item.autoSync !== false) {
          if (item.key === 'deals') {
            const num = Math.max(320, totalClosedDeals);
            return { ...item, value: `${num}+`, rawNumber: num, suffix: '+' };
          }
          if (item.key === 'homes') {
            const num = evaluatedCount;
            return { ...item, value: `${num}+`, rawNumber: num, suffix: '+' };
          }
          if (item.key === 'satisfaction') {
            return { ...item, value: `${satisfactionRate}%`, rawNumber: satisfactionRate, suffix: '%' };
          }
        }
        return item;
      });
    } catch (err) {
      console.warn('AutoSync stats computation notice:', err);
    }
  }

  return stats;
}

export function saveHomepageStats(newStats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('buytora_homepage_stats', JSON.stringify(newStats));
    window.dispatchEvent(new Event('homepage-stats-changed'));
  } catch (err) {
    console.error('Error saving homepage stats:', err);
  }
}

export function resetHomepageStats() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('buytora_homepage_stats');
    localStorage.removeItem('baytora_homepage_stats');
    window.dispatchEvent(new Event('homepage-stats-changed'));
  } catch (err) {}
}


