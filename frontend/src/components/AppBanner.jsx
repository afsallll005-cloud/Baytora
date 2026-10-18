'use client';

import { QrCode, Smartphone, Apple, Play } from 'lucide-react';

export default function AppBanner() {
  return (
    <div className="container">
      <div className="app-banner">
        <div className="app-banner-info">
          <h2>
            Download Bahrain's most trusted <br />
            property search app
          </h2>
          <p>
            Install the Baytora app and start searching smarter with live GPS alerts, saved searches, and instant agent WhatsApp links.
          </p>

          <div className="app-store-btns">
            <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="store-badge">
              <Apple size={24} />
              <div className="store-text">
                <span>Download on the</span>
                <strong>Apple App Store</strong>
              </div>
            </a>

            <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" className="store-badge">
              <Play size={22} fill="currentColor" />
              <div className="store-text">
                <span>GET IT ON</span>
                <strong>Google Play</strong>
              </div>
            </a>
          </div>
        </div>

        <div className="app-banner-qr">
          <div className="qr-code-box">
            {/* SVG Representation of a clean QR Code */}
            <svg width="124" height="124" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" fill="white" />
              <rect x="10" y="10" width="26" height="26" rx="4" fill="#1A1A2E" />
              <rect x="15" y="15" width="16" height="16" fill="white" />
              <rect x="19" y="19" width="8" height="8" fill="#EF5E4E" />

              <rect x="64" y="10" width="26" height="26" rx="4" fill="#1A1A2E" />
              <rect x="69" y="15" width="16" height="16" fill="white" />
              <rect x="73" y="19" width="8" height="8" fill="#EF5E4E" />

              <rect x="10" y="64" width="26" height="26" rx="4" fill="#1A1A2E" />
              <rect x="15" y="69" width="16" height="16" fill="white" />
              <rect x="19" y="73" width="8" height="8" fill="#EF5E4E" />

              {/* Decorative data pixels */}
              <rect x="42" y="12" width="6" height="6" fill="#1A1A2E" />
              <rect x="52" y="12" width="6" height="6" fill="#1A1A2E" />
              <rect x="42" y="24" width="6" height="6" fill="#1A1A2E" />
              <rect x="52" y="30" width="6" height="6" fill="#EF5E4E" />
              <rect x="12" y="42" width="6" height="6" fill="#1A1A2E" />
              <rect x="24" y="42" width="6" height="6" fill="#EF5E4E" />
              <rect x="36" y="42" width="6" height="6" fill="#1A1A2E" />
              <rect x="48" y="42" width="6" height="6" fill="#1A1A2E" />
              <rect x="60" y="42" width="6" height="6" fill="#1A1A2E" />
              <rect x="72" y="42" width="6" height="6" fill="#EF5E4E" />
              <rect x="84" y="42" width="6" height="6" fill="#1A1A2E" />

              <rect x="42" y="52" width="6" height="6" fill="#1A1A2E" />
              <rect x="54" y="60" width="6" height="6" fill="#1A1A2E" />
              <rect x="42" y="70" width="6" height="6" fill="#EF5E4E" />
              <rect x="52" y="80" width="6" height="6" fill="#1A1A2E" />
              <rect x="64" y="70" width="6" height="6" fill="#1A1A2E" />
              <rect x="76" y="80" width="6" height="6" fill="#1A1A2E" />
              <rect x="84" y="64" width="6" height="6" fill="#1A1A2E" />
            </svg>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Scan to download app
          </span>
        </div>
      </div>
    </div>
  );
}
