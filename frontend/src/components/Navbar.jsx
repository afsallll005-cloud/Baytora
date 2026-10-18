'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  PlusCircle, 
  User, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  Sparkles,
  Building2,
  X,
  Check,
  ExternalLink,
  PhoneCall,
} from 'lucide-react';
import { getCurrentUser, logoutUser } from '../lib/auth';
import './Navbar.css';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync auth state
  useEffect(() => {
    const updateAuth = () => {
      setCurrentUser(getCurrentUser());
    };

    updateAuth();
    window.addEventListener('lux-auth-changed', updateAuth);
    return () => window.removeEventListener('lux-auth-changed', updateAuth);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
    setShowUserDropdown(false);
  }, [pathname]);

  // Don't show public floating navbar on admin or login routes
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
    return null;
  }

  const handleLogout = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }
    logoutUser();
    setCurrentUser(null);
    setShowUserDropdown(false);
    setMobileDrawerOpen(false);
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/add-property')) {
      router.push('/login');
    } else {
      router.refresh();
    }
  };

  const getRoleColor = (role) => {
    if (role === 'admin') return '#7F51FF';
    if (role === 'agent') return '#10B981';
    return '#3B82F6';
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          {/* Brand Logo */}
          <Link href="/" className="brand-logo" title="Baytora - Premium Real Estate">
            <div className="brand-icon">
              <img src="/images/logo.png" alt="Baytora Logo" />
            </div>
            <div className="brand-name">
              Bayt<span className="brand-highlight">ora</span>
            </div>
          </Link>

          {/* Navigation Links matching Luxterra Framer reference */}
          <nav>
            <ul className="nav-links">
              <li>
                <Link 
                  href="/properties" 
                  className={`nav-link ${pathname === '/properties' ? 'active' : ''}`}
                >
                  Listings
                </Link>
              </li>
              <li>
                <Link 
                  href="/buy" 
                  className={`nav-link ${pathname === '/buy' ? 'active' : ''}`}
                >
                  Buy
                </Link>
              </li>
              <li>
                <Link 
                  href="/rent" 
                  className={`nav-link ${pathname === '/rent' ? 'active' : ''}`}
                >
                  Rent
                </Link>
              </li>
              <li>
                <Link 
                  href="/agents" 
                  className={`nav-link ${pathname === '/agents' ? 'active' : ''}`}
                >
                  Our agents
                </Link>
              </li>
            </ul>
          </nav>

          {/* Action CTAs & Auth Controls */}
          <div className="nav-actions">
            {/* List Property Link */}
            <Link href="/add-property" className="admin-link-pill" title="Submit a new property listing">
              <PlusCircle size={14} />
              <span>List Property</span>
            </Link>

            {/* Admin Console Shortcut (if user is admin) */}
            {currentUser?.role === 'admin' && (
              <Link 
                href="/admin" 
                className="admin-link-pill admin-badge-highlight"
                title="Access Admin Console"
              >
                <ShieldCheck size={14} color="#7F51FF" />
                <span>Admin Console</span>
              </Link>
            )}

            {/* Authenticated User Chip & Dropdown */}
            {currentUser ? (
              <div className="user-menu-container" ref={dropdownRef}>
                <button
                  type="button"
                  className="user-chip-btn"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  title={`Signed in as ${currentUser.name}`}
                >
                  <div 
                    className="user-avatar-circle"
                    style={{ background: getRoleColor(currentUser.role) }}
                  >
                    {currentUser.avatar || currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-chip-name">{currentUser.name.split(' ')[0]}</span>
                  <span 
                    className="user-chip-role"
                    style={{ color: getRoleColor(currentUser.role) }}
                  >
                    {currentUser.role}
                  </span>
                  <ChevronDown size={14} className={`dropdown-chevron ${showUserDropdown ? 'open' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {showUserDropdown && (
                  <div className="user-dropdown-menu">
                    {/* Header info */}
                    <div className="user-dropdown-header">
                      <div 
                        className="user-avatar-large"
                        style={{ background: getRoleColor(currentUser.role) }}
                      >
                        {currentUser.avatar || currentUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-header-details">
                        <div className="user-header-name">{currentUser.name}</div>
                        <div className="user-header-email">{currentUser.email}</div>
                        <div className="user-header-badge">
                          <span 
                            className="badge-dot" 
                            style={{ background: getRoleColor(currentUser.role) }}
                          />
                          <span>{currentUser.badge || currentUser.role}</span>
                        </div>
                      </div>
                    </div>

                    <div className="dropdown-divider" />

                    {/* Quick navigation links */}
                    <div className="dropdown-nav-items">
                      {currentUser.role === 'admin' && (
                        <Link 
                          href="/admin" 
                          className="dropdown-item"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <ShieldCheck size={16} color="#7F51FF" />
                          <span>Admin Console</span>
                        </Link>
                      )}

                      <Link 
                        href="/add-property" 
                        className="dropdown-item"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <PlusCircle size={16} />
                        <span>List New Property</span>
                      </Link>

                      <Link 
                        href="/properties" 
                        className="dropdown-item"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <Building2 size={16} />
                        <span>Browse Residences</span>
                      </Link>
                    </div>

                    <div className="dropdown-divider" />

                    {/* Logout Button */}
                    <button 
                      type="button" 
                      className="dropdown-item logout-item"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Unauthenticated State: Sign In Button */
              <Link href="/login" className="nav-signin-btn" title="Sign in or register">
                <User size={15} />
                <span>Sign In</span>
              </Link>
            )}

            {/* Menu burger button */}
            <button 
              type="button" 
              className="menu-burger-btn"
              onClick={() => setMobileDrawerOpen(true)}
              title="Open Navigation Menu"
            >
              <div className="burger-lines">
                <span className="burger-line-1" />
                <span className="burger-line-2" />
              </div>
              <span>Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile & Quick Drawer Navigation Overlay */}
      {mobileDrawerOpen && (
        <div 
          className="nav-drawer-overlay" 
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div 
            className="nav-drawer" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="drawer-header">
              <Link href="/" className="brand-logo" onClick={() => setMobileDrawerOpen(false)}>
                <div className="brand-icon">
                  <img src="/images/logo.png" alt="Baytora Logo" />
                </div>
                <div className="brand-name">
                  Bayt<span className="brand-highlight">ora</span>
                </div>
              </Link>
              <button 
                type="button" 
                className="drawer-close-btn"
                onClick={() => setMobileDrawerOpen(false)}
                title="Close Menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer User Banner */}
            <div className="drawer-user-card">
              {currentUser ? (
                <div className="drawer-logged-in-box">
                  <div className="drawer-user-info">
                    <div 
                      className="user-avatar-large"
                      style={{ background: getRoleColor(currentUser.role) }}
                    >
                      {currentUser.avatar || currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="drawer-user-name">{currentUser.name}</div>
                      <div className="drawer-user-email">{currentUser.email}</div>
                      <div className="drawer-user-badge">
                        <span 
                          className="badge-dot" 
                          style={{ background: getRoleColor(currentUser.role) }} 
                        />
                        <span>{currentUser.badge || currentUser.role}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="drawer-logout-btn"
                    onClick={handleLogout}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="drawer-logged-out-box">
                  <div className="drawer-welcome-title">Welcome to Baytora</div>
                  <p className="drawer-welcome-desc">Sign in to save properties, book private viewings, or access the admin portal.</p>
                  <Link 
                    href="/login" 
                    className="drawer-signin-btn"
                    onClick={() => setMobileDrawerOpen(false)}
                  >
                    <User size={16} />
                    <span>Sign In / Create Account</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Drawer Links */}
            <div className="drawer-links-section">
              <div className="drawer-section-title">Navigation</div>
              <ul className="drawer-links-list">
                <li>
                  <Link href="/" className="drawer-link" onClick={() => setMobileDrawerOpen(false)}>
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link href="/properties" className="drawer-link" onClick={() => setMobileDrawerOpen(false)}>
                    <span>All Listings</span>
                  </Link>
                </li>
                <li>
                  <Link href="/buy" className="drawer-link" onClick={() => setMobileDrawerOpen(false)}>
                    <span>Buy Residences</span>
                  </Link>
                </li>
                <li>
                  <Link href="/rent" className="drawer-link" onClick={() => setMobileDrawerOpen(false)}>
                    <span>Rent Residences</span>
                  </Link>
                </li>
                <li>
                  <Link href="/agents" className="drawer-link" onClick={() => setMobileDrawerOpen(false)}>
                    <span>Our Agents</span>
                  </Link>
                </li>
                <li>
                  <Link href="/add-property" className="drawer-link drawer-highlight" onClick={() => setMobileDrawerOpen(false)}>
                    <PlusCircle size={16} />
                    <span>List a Property</span>
                  </Link>
                </li>
                {currentUser?.role === 'admin' && (
                  <li>
                    <Link href="/admin" className="drawer-link drawer-admin-link" onClick={() => setMobileDrawerOpen(false)}>
                      <ShieldCheck size={16} color="#7F51FF" />
                      <span>Admin Management Console</span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Drawer Footer Assistance */}
            <div className="drawer-footer">
              <div className="drawer-help-header">Private Client Concierge</div>
              <div className="drawer-help-phone">
                <PhoneCall size={14} color="#7F51FF" />
                <span>+91 LUX-TERRA</span>
              </div>
              <div className="drawer-help-time">Mon - Sat: 8:00 AM - 9:00 PM EST</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
