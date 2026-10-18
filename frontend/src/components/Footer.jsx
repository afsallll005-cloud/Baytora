'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Twitter, Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Do not render public footer on admin console or auth login screens
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
    return null;
  }

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 4000);
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          {/* Col 1: Navigation Menu */}
          <div>
            <div className="footer-col-header">Nav menu</div>
            <ul className="footer-nav-list">
              <li><Link href="/" className="footer-nav-link">Home</Link></li>
              <li><Link href="/properties" className="footer-nav-link">Listings</Link></li>
              <li><Link href="/buy" className="footer-nav-link">Buy</Link></li>
              <li><Link href="/rent" className="footer-nav-link">Rent</Link></li>
              <li><Link href="/agents" className="footer-nav-link">Our agents</Link></li>
            </ul>

            <div style={{ marginTop: 28 }}>
              <div className="footer-col-header">Follow us</div>
              <div className="footer-social-row">
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="Twitter / X">
                  <Twitter size={15} />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="Facebook">
                  <Facebook size={15} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="Instagram">
                  <Instagram size={15} />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Newsletter Subscription */}
          <div className="footer-newsletter-col">
            <p className="footer-newsletter-text">
              Subscribe to our newsletter to get market updates, new listings, exclusive insights &amp; more
            </p>

            <form onSubmit={handleSubscribe} className="footer-newsletter-form">
              <input
                type="email"
                required
                placeholder={subscribed ? "Thanks for subscribing!" : "Your email address"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="footer-newsletter-input"
              />
              <button type="submit" className="footer-newsletter-submit">
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>
            </form>
          </div>

          {/* Col 3: Pages & Contact */}
          <div>
            <div className="footer-col-header">Pages</div>
            <ul className="footer-nav-list">
              <li><Link href="/properties" className="footer-nav-link">Explore Listings</Link></li>
              <li><Link href="/agents" className="footer-nav-link">Find an Agent</Link></li>
              <li><Link href="/add-property" className="footer-nav-link">List a Property</Link></li>
              <li><Link href="/admin" className="footer-nav-link">Admin Console</Link></li>
            </ul>

            <div className="footer-contact-info">
              <div className="footer-col-header" style={{ marginBottom: 8, marginTop: 16 }}>Contact</div>
              <a href="tel:+1404506100" className="footer-contact-item">+1 (404) 506-100</a>
              <a href="mailto:info@baytora.com" className="footer-contact-item">info@baytora.com</a>
              <span className="footer-contact-item" style={{ color: 'rgba(255,255,255,0.6)' }}>
                105 Hertha Road, Tampa, FL
              </span>
            </div>
          </div>
        </div>

        {/* Large Signature Watermark Text */}
        <div className="footer-brand-watermark" aria-hidden="true">
          <h1 className="footer-watermark-text">Baytora</h1>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Baytora Real Estate. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 18 }}>
            <Link href="/#">Privacy Policy</Link>
            <Link href="/#">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
