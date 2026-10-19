'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  MessageSquare, 
  Users, 
  BarChart3, 
  MapPin, 
  PlusCircle, 
  ExternalLink, 
  Home, 
  ShieldCheck, 
  LogOut,
  User,
  LogIn,
  Sparkles
} from 'lucide-react';
import { getCurrentUser, logoutUser, quickDemoLogin } from '../../lib/auth';
import '../../styles/admin.css';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const syncUser = () => {
      setCurrentUser(getCurrentUser());
    };
    syncUser();
    window.addEventListener('lux-auth-changed', syncUser);
    return () => window.removeEventListener('lux-auth-changed', syncUser);
  }, []);

  const handleAdminQuickLogin = () => {
    quickDemoLogin('admin');
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    router.push('/login');
  };

  const navLinks = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Manage Properties', href: '/admin/properties', icon: Building2 },
    { label: 'Featured Cities', href: '/admin/cities', icon: MapPin },
    { label: 'Homepage Stats', href: '/admin/stats', icon: Sparkles },
    { label: 'Inquiries & Leads', href: '/admin/inquiries', icon: MessageSquare },
    { label: 'Agents Directory', href: '/admin/agents', icon: Users },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link href="/admin" className="admin-brand">
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 4, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <img 
                src="/images/Logo.png" 
                alt="Buytora Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.18)' }} 
              />
            </div>
            <span>Buytora</span>
          </Link>
          <div className="admin-badge">Admin Console</div>
        </div>

        {/* Navigation Items */}
        <nav className="admin-nav">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <div className="admin-nav-item-inner">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer with Live DB indicator */}
        <div className="admin-sidebar-footer">
          <div className="admin-db-status" style={{ marginBottom: 12 }}>
            <span className="status-dot"></span>
            <span style={{ color: '#D1D5DB' }}>Database Active</span>
          </div>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.82rem',
              color: '#9CA3AF',
              textDecoration: 'none',
              transition: 'color 0.15s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
          >
            <ExternalLink size={14} />
            <span>Go to Public Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Body */}
      <div className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-topbar">
          <div>
            <h1 className="admin-topbar-title">
              {pathname === '/admin' ? 'Dashboard Overview' :
               pathname === '/admin/properties' ? 'Properties Inventory' :
               pathname === '/admin/cities' ? 'Featured Cities Management' :
               pathname === '/admin/inquiries' ? 'Client Leads & CRM' :
               pathname === '/admin/agents' ? 'Real Estate Agents' :
               pathname === '/admin/analytics' ? 'Performance Analytics' : 'Admin Control'}
            </h1>
          </div>

          <div className="admin-topbar-actions">
            <Link href="/add-property" className="admin-btn admin-btn-primary">
              <PlusCircle size={16} />
              <span>Add New Listing</span>
            </Link>

            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="admin-user-chip">
                  <div className="admin-avatar" style={{ background: '#7F51FF', color: '#ffffff' }}>
                    {currentUser.avatar || currentUser.name.charAt(0)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>
                      {currentUser.name}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                      {currentUser.badge || currentUser.role}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  style={{
                    background: '#F3F4F6',
                    border: '1px solid #E5E7EB',
                    borderRadius: 4,
                    padding: '8px 12px',
                    color: '#6B7280',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#B91C1C';
                    e.currentTarget.style.background = '#FEF2F2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#6B7280';
                    e.currentTarget.style.background = '#F3F4F6';
                  }}
                >
                  <LogOut size={14} />
                  <span>Exit</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleAdminQuickLogin}
                  className="admin-btn"
                  style={{
                    background: '#F3E8FF',
                    color: '#7F51FF',
                    border: '1px solid #E9D5FF',
                    fontWeight: 600,
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>1-Click Admin Sign-in</span>
                </button>
                <Link
                  href="/login?redirect=/admin"
                  className="admin-btn"
                  style={{
                    background: '#111827',
                    color: '#FFFFFF',
                  }}
                >
                  <LogIn size={14} />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Admin Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
