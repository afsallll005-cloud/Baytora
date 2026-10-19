// ==========================================================================
// BUYTORA AUTHENTICATION & USER MANAGEMENT
// ==========================================================================

export const SEED_USERS = {
  admin: {
    id: 'user_admin_01',
    name: 'Admin Buytora',
    email: 'Admin@Buytora',
    altEmail: 'admin@buytora.com',
    password: '12345678',
    role: 'admin',
    avatar: 'A',
    badge: 'Super Admin',
    phone: '0000000000',
  },
  agent: {
    id: 'user_agent_01',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@buytora.in',
    password: '12345678',
    role: 'agent',
    avatar: 'A',
    badge: 'Certified Broker',
    phone: '0000000000',
  },
  user: {
    id: 'user_client_01',
    name: 'Priya Patel',
    email: 'priya.patel@buytora.in',
    password: '12345678',
    role: 'user',
    avatar: 'P',
    badge: 'Verified Buyer',
    phone: '0000000000',
  },
};

export const DEMO_ACCOUNTS = SEED_USERS;

const STORAGE_KEY = 'buytora_current_user';

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    // If not found, check legacy keys once and migrate
    if (!raw) {
      const legacy = localStorage.getItem('baytora_current_user') || localStorage.getItem('luxterra_current_user');
      if (legacy) {
        localStorage.setItem(STORAGE_KEY, legacy);
        localStorage.removeItem('baytora_current_user');
        localStorage.removeItem('luxterra_current_user');
        raw = legacy;
      }
    }
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

export function saveUserSession(user) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      // Clean legacy keys
      localStorage.removeItem('baytora_current_user');
      localStorage.removeItem('luxterra_current_user');
      localStorage.removeItem('rentel_user');
      localStorage.removeItem('user');
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('baytora_current_user');
      localStorage.removeItem('luxterra_current_user');
      localStorage.removeItem('rentel_user');
      localStorage.removeItem('user');
    }
    window.dispatchEvent(new Event('lux-auth-changed'));
  } catch (err) {
    console.error('Error saving user session:', err);
  }
}

export async function loginUser({ email, password }) {
  // Simulate network delay for natural feel
  await new Promise((resolve) => setTimeout(resolve, 500));

  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  // Match Admin: Admin@Buytora, Admin@Baytora, admin@buytora.com, or admin
  if (
    cleanEmail === 'admin@buytora' || 
    cleanEmail === 'admin@buytora.com' || 
    cleanEmail === 'admin@baytora' || 
    cleanEmail === 'admin@baytora.com' || 
    cleanEmail === 'admin'
  ) {
    if (cleanPassword !== '12345678') {
      throw new Error('Incorrect password. For Admin, please use: 12345678');
    }
    const user = { ...SEED_USERS.admin, lastLogin: new Date().toISOString() };
    saveUserSession(user);
    return { success: true, user };
  }

  // Match Agent
  if (cleanEmail === SEED_USERS.agent.email.toLowerCase() || cleanEmail === 'agent') {
    if (cleanPassword && cleanPassword !== '12345678') {
      throw new Error('Incorrect password. Please use: 12345678');
    }
    const user = { ...SEED_USERS.agent, lastLogin: new Date().toISOString() };
    saveUserSession(user);
    return { success: true, user };
  }

  // Match Buyer (Sarah)
  if (cleanEmail === SEED_USERS.user.email.toLowerCase()) {
    if (cleanPassword && cleanPassword !== '12345678') {
      throw new Error('Incorrect password. Please use: 12345678');
    }
    const user = { ...SEED_USERS.user, lastLogin: new Date().toISOString() };
    saveUserSession(user);
    return { success: true, user };
  }

  // Generic sign in
  if (!cleanPassword || cleanPassword.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const nameParts = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
  const formattedName = nameParts.charAt(0).toUpperCase() + nameParts.slice(1);

  const user = {
    id: 'user_' + Date.now(),
    name: formattedName || 'Client User',
    email: cleanEmail,
    role: 'user',
    avatar: (formattedName || 'U').charAt(0).toUpperCase(),
    badge: 'Verified Member',
    lastLogin: new Date().toISOString(),
  };

  saveUserSession(user);
  return { success: true, user };
}

export async function registerUser({ name, email, phone, role = 'user' }) {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  const user = {
    id: 'user_' + Date.now(),
    name: cleanName,
    email: cleanEmail,
    phone: phone?.trim() || '',
    role: role === 'agent' ? 'agent' : 'user',
    avatar: cleanName.charAt(0).toUpperCase() || 'U',
    badge: role === 'agent' ? 'Registered Agent' : 'Member',
    registeredAt: new Date().toISOString(),
  };

  saveUserSession(user);
  return { success: true, user };
}

export function logoutUser() {
  saveUserSession(null);
}

export function quickDemoLogin(role = 'admin') {
  const account = DEMO_ACCOUNTS[role] || DEMO_ACCOUNTS.user;
  saveUserSession({ ...account, lastLogin: new Date().toISOString() });
  return account;
}
