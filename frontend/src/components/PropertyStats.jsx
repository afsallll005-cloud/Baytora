'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { fetchHomepageStats, initialHomepageStats } from '../lib/api';
import { getCurrentUser } from '../lib/auth';
import { Edit3, Sparkles } from 'lucide-react';
import './PropertyStats.css';

function AnimatedNumber({ value, suffix = '', rawNumber, isVisible }) {
  const [displayNum, setDisplayNum] = useState(0);

  useEffect(() => {
    if (!isVisible || typeof rawNumber !== 'number' || isNaN(rawNumber)) {
      return;
    }

    const start = 0;
    const end = rawNumber;
    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo for ultra-smooth luxury slowdown
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (end - start) * ease);
      setDisplayNum(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayNum(end);
      }
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [isVisible, rawNumber]);

  if (typeof rawNumber !== 'number' || isNaN(rawNumber)) {
    return <span>{value}</span>;
  }

  return (
    <span>
      {displayNum.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function PropertyStats() {
  const [statsData, setStatsData] = useState(initialHomepageStats);
  const [isVisible, setIsVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const sectionRef = useRef(null);

  // Load dynamic stats & check admin role
  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      try {
        const data = await fetchHomepageStats();
        if (mounted && data) {
          setStatsData(data);
        }
      } catch (err) {
        console.error('Error loading dynamic homepage stats:', err);
      }
    }

    const checkAdmin = () => {
      const user = getCurrentUser();
      setIsAdmin(user?.role === 'admin');
    };

    loadStats();
    checkAdmin();

    const handleStatsChange = () => loadStats();
    const handleAuthChange = () => checkAdmin();

    window.addEventListener('homepage-stats-changed', handleStatsChange);
    window.addEventListener('lux-auth-changed', handleAuthChange);

    return () => {
      mounted = false;
      window.removeEventListener('homepage-stats-changed', handleStatsChange);
      window.removeEventListener('lux-auth-changed', handleAuthChange);
    };
  }, []);

  // Intersection Observer for scroll-triggered animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const items = statsData?.items || initialHomepageStats.items;

  return (
    <section className="property-stats-section" ref={sectionRef} id="stats">
      {/* Admin Quick Edit Shortcut */}
      {isAdmin && (
        <Link 
          href="/admin/stats" 
          className="property-stats-admin-btn"
          title="Edit At a Glance stats in Admin Console"
        >
          <Edit3 size={13} />
          <span>Edit Stats</span>
        </Link>
      )}

      <div className="property-stats-container">
        {/* Eyebrow */}
        <div className="property-stats-eyebrow">
          <span className="property-stats-line" />
          <span className="property-stats-dot" />
          <span className="property-stats-eyebrow-text">
            {statsData?.eyebrow || 'At a glance'}
          </span>
          <span className="property-stats-line" />
        </div>

        {/* Heading */}
        <h2 className="property-stats-heading">
          {statsData?.heading || 'Providing clarity, every step forward'}
        </h2>

        {/* Statistics Grid */}
        <div className="property-stats-grid">
          {items.map((stat, idx) => (
            <div className="property-stat-item" key={stat.id || stat.label || idx}>
              <h3 className="property-stat-value">
                <AnimatedNumber
                  value={stat.value}
                  suffix={stat.suffix || ''}
                  rawNumber={typeof stat.rawNumber === 'number' ? stat.rawNumber : parseInt(stat.value, 10)}
                  isVisible={isVisible}
                />
              </h3>
              <p className="property-stat-label">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
