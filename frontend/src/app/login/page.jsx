'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Home, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { getCurrentUser, loginUser, registerUser, quickDemoLogin, DEMO_ACCOUNTS } from '../../lib/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';

  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user');

  useEffect(() => {
    // If already logged in, show user info or redirect
    const user = getCurrentUser();
    if (user && !searchParams.get('force')) {
      // Allow staying or redirecting
    }
  }, [searchParams]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (res.success) {
        setToastMessage(`Welcome back, ${res.user.name}!`);
        setTimeout(() => {
          if (res.user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push(redirectTarget);
          }
        }, 800);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({ name, email, phone, role });
      if (res.success) {
        setToastMessage(`Account created! Welcome, ${res.user.name}!`);
        setTimeout(() => {
          router.push(redirectTarget);
        }, 800);
      }
    } catch (err) {
      setErrorMessage('Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (type) => {
    const user = quickDemoLogin(type);
    setToastMessage(`Signed in as ${user.name} (${user.badge})`);
    setTimeout(() => {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push(redirectTarget);
      }
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F1F1F1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px 80px',
      position: 'relative',
    }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 30,
          right: 30,
          background: '#111112',
          color: '#FFFFFF',
          padding: '12px 24px',
          borderRadius: 4,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 9999,
          fontWeight: 600,
          fontSize: '0.92rem',
          animation: 'fadeIn 0.2s ease',
        }}>
          <Check size={18} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Card Container */}
      <div style={{
        width: '100%',
        maxWidth: 480,
        background: '#FFFFFF',
        borderRadius: 4,
        border: '1px solid #EAEAEA',
        boxShadow: 'rgba(0, 0, 0, 0.08) 0px 4px 20px -2px',
        overflow: 'hidden',
        padding: '36px 32px 32px',
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: '#111112',
            marginBottom: 14,
          }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 6,
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
            <span style={{ fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.05em' }}>
              Buyt<span style={{ color: '#7F51FF', fontWeight: 400 }}>ora</span>
            </span>
          </Link>

          <h2 style={{
            margin: '0 0 6px',
            fontSize: '1.5rem',
            fontWeight: 500,
            color: '#111112',
            letterSpacing: '-0.04em',
          }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{
            margin: 0,
            fontSize: '0.9rem',
            color: 'rgba(0,0,0,0.6)',
            letterSpacing: '-0.2px',
          }}>
            {mode === 'login' 
              ? 'Access saved residences, search alerts & concierge'
              : 'Join Buytora’s curated real estate marketplace'}
          </p>
        </div>

        {/* Tab Switcher: [Sign In] [Create Account] */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#F7F7F8',
          padding: 3,
          borderRadius: 4,
          border: '1px solid #EAEAEA',
          marginBottom: 24,
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(''); }}
            style={{
              padding: '8px 16px',
              borderRadius: 2,
              border: 'none',
              background: mode === 'login' ? '#111112' : 'transparent',
              color: mode === 'login' ? '#FFFFFF' : 'rgba(0,0,0,0.65)',
              fontWeight: 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              letterSpacing: '-0.2px',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMessage(''); }}
            style={{
              padding: '8px 16px',
              borderRadius: 2,
              border: 'none',
              background: mode === 'signup' ? '#111112' : 'transparent',
              color: mode === 'signup' ? '#FFFFFF' : 'rgba(0,0,0,0.65)',
              fontWeight: 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              letterSpacing: '-0.2px',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FEE2E2',
            color: '#B91C1C',
            padding: '10px 14px',
            borderRadius: 3,
            fontSize: '0.86rem',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 500, color: '#111112', marginBottom: 6 }}>
                Email Address
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #E7E7E9',
                borderRadius: 2,
                background: '#FFFFFF',
                padding: '0 12px',
              }}>
                <Mail size={16} color="rgba(0,0,0,0.4)" style={{ marginRight: 8, flexShrink: 0 }} />
                <input
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.92rem',
                    color: '#111112',
                    letterSpacing: '-0.2px',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 500, color: '#111112' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to demo account!')}
                  style={{ fontSize: '0.78rem', color: '#7F51FF', fontWeight: 500, padding: 0 }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #E7E7E9',
                borderRadius: 2,
                background: '#FFFFFF',
                padding: '0 12px',
              }}>
                <Lock size={16} color="rgba(0,0,0,0.4)" style={{ marginRight: 8, flexShrink: 0 }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.92rem',
                    color: '#111112',
                    letterSpacing: '-0.2px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ color: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', padding: 4 }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
              <input
                type="checkbox"
                id="rememberCheck"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#111112', cursor: 'pointer' }}
              />
              <label htmlFor="rememberCheck" style={{ fontSize: '0.84rem', color: 'rgba(0,0,0,0.65)', cursor: 'pointer' }}>
                Keep me signed in on this browser
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: '#111112',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 2,
                fontSize: '0.92rem',
                fontWeight: 600,
                letterSpacing: '-0.2px',
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.2s',
              }}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* 2. SIGN UP FORM */
          <form onSubmit={handleSignupSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 500, color: '#111112', marginBottom: 6 }}>
                Full Name *
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #E7E7E9',
                borderRadius: 2,
                background: '#FFFFFF',
                padding: '0 12px',
              }}>
                <User size={16} color="rgba(0,0,0,0.4)" style={{ marginRight: 8, flexShrink: 0 }} />
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.92rem',
                    color: '#111112',
                  }}
                />
              </div>
            </div>

            {/* Email Address */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 500, color: '#111112', marginBottom: 6 }}>
                Email Address *
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #E7E7E9',
                borderRadius: 2,
                background: '#FFFFFF',
                padding: '0 12px',
              }}>
                <Mail size={16} color="rgba(0,0,0,0.4)" style={{ marginRight: 8, flexShrink: 0 }} />
                <input
                  type="email"
                  required
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.92rem',
                    color: '#111112',
                  }}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 500, color: '#111112', marginBottom: 6 }}>
                Phone Number (Optional)
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #E7E7E9',
                borderRadius: 2,
                background: '#FFFFFF',
                padding: '0 12px',
              }}>
                <Phone size={16} color="rgba(0,0,0,0.4)" style={{ marginRight: 8, flexShrink: 0 }} />
                <input
                  type="tel"
                  placeholder="+1 (813) 555-0100"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.92rem',
                    color: '#111112',
                  }}
                />
              </div>
            </div>

            {/* Role Selection: Buyer vs Agent */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 500, color: '#111112', marginBottom: 6 }}>
                I want to:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label style={{
                  padding: '10px 12px',
                  border: role === 'user' ? '1.5px solid #111112' : '1px solid #E7E7E9',
                  borderRadius: 2,
                  background: role === 'user' ? '#F7F7F8' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}>
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={role === 'user'}
                    onChange={() => setRole('user')}
                    style={{ accentColor: '#111112' }}
                  />
                  <span>Buy or Rent</span>
                </label>

                <label style={{
                  padding: '10px 12px',
                  border: role === 'agent' ? '1.5px solid #111112' : '1px solid #E7E7E9',
                  borderRadius: 2,
                  background: role === 'agent' ? '#F7F7F8' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}>
                  <input
                    type="radio"
                    name="role"
                    value="agent"
                    checked={role === 'agent'}
                    onChange={() => setRole('agent')}
                    style={{ accentColor: '#111112' }}
                  />
                  <span>List as Agent</span>
                </label>
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 500, color: '#111112', marginBottom: 6 }}>
                Password *
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #E7E7E9',
                borderRadius: 2,
                background: '#FFFFFF',
                padding: '0 12px',
              }}>
                <Lock size={16} color="rgba(0,0,0,0.4)" style={{ marginRight: 8, flexShrink: 0 }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.92rem',
                    color: '#111112',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ color: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', padding: 4 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: '#111112',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 2,
                fontSize: '0.92rem',
                fontWeight: 600,
                letterSpacing: '-0.2px',
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Divider */}
        {/* <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '24px 0 20px',
        }}>
          <span style={{ flex: 1, height: 1, background: '#EAEAEA' }} />
          <span style={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
            Quick Demo Access
          </span>
          <span style={{ flex: 1, height: 1, background: '#EAEAEA' }} />
        </div> */}

        {/* One-Click Demo Logins */}
        {/* <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            type="button"
            onClick={() => handleQuickDemo('admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 2,
              background: '#F7F7F8',
              border: '1px solid #E7E7E9',
              fontSize: '0.84rem',
              color: '#111112',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7F51FF' }} />
              <strong>Demo Administrator</strong>
              <span style={{ color: 'rgba(0,0,0,0.5)' }}>(Admin@Buytora • 12345678)</span>
            </div>
            <ChevronRight size={14} color="#7F51FF" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('agent')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 2,
              background: '#F7F7F8',
              border: '1px solid #E7E7E9',
              fontSize: '0.84rem',
              color: '#111112',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
              <strong>Demo Agent (Broker)</strong>
              <span style={{ color: 'rgba(0,0,0,0.5)' }}>({DEMO_ACCOUNTS.agent.email})</span>
            </div>
            <ChevronRight size={14} color="#10B981" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('user')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 2,
              background: '#F7F7F8',
              border: '1px solid #E7E7E9',
              fontSize: '0.84rem',
              color: '#111112',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }} />
              <strong>Demo Buyer Client</strong>
              <span style={{ color: 'rgba(0,0,0,0.5)' }}>({DEMO_ACCOUNTS.user.email})</span>
            </div>
            <ChevronRight size={14} color="#3B82F6" />
          </button>
        </div> */}

        {/* Back to Home Link */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href="/" style={{ fontSize: '0.84rem', color: 'rgba(0,0,0,0.5)', textDecoration: 'none' }}>
            ← Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{
          minHeight: '100vh',
          background: '#F1F1F1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif'
        }}>
          <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>Loading Buytora authentication...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

