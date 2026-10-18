'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchFeaturedCities, initialFeaturedCities } from '../lib/api';
import './LocationExplorer.css';

export default function LocationExplorer() {
  const [cities, setCities] = useState(initialFeaturedCities);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchFeaturedCities(false);
        if (data && data.length > 0) {
          setCities(data);
        }
      } catch (err) {
        console.error('Failed to load featured cities:', err);
      }
    }
    load();

    const handleSync = () => load();
    if (typeof window !== 'undefined') {
      window.addEventListener('featured-cities-changed', handleSync);
      return () => window.removeEventListener('featured-cities-changed', handleSync);
    }
  }, []);

  return (
    <section className="locations-section">
      {/* Subtle blueprint grid divider lines matching Framer aesthetic */}
      <div className="locations-guides-overlay" aria-hidden="true">
        <div className="locations-guide-col" />
        <div className="locations-guide-col" />
        <div className="locations-guide-col" />
        <div className="locations-guide-col" />
      </div>

      <div className="locations-container">
        {/* Header with Eyebrow */}
        <div className="locations-header">
          <div className="locations-eyebrow-container">
            <div className="locations-eyebrow">
              <span className="locations-eyebrow-dot" />
              <span>Locations</span>
            </div>
          </div>

          <h2 className="locations-title">Featured cities</h2>

          <p className="locations-subtitle">
            Explore the Florida cities our clients love for their comfort, market strength &amp; coastal living
          </p>
        </div>

        {/* Featured City Cards Grid */}
        <div className="featured-cities-grid">
          {cities.map((city) => (
            <Link
              key={city._id || city.id || city.name}
              href={city.href || `/properties?search=${encodeURIComponent(city.name)}`}
              className="featured-city-card"
              id={`city-card-${(city.name || '').toLowerCase().replace(/\s+/g, '-')}`}
            >
              <img
                src={city.image}
                alt={city.name}
                className="featured-city-image"
                loading="lazy"
                onError={(e) => {
                  if (city.fallbackImage && e.currentTarget.src !== city.fallbackImage) {
                    e.currentTarget.src = city.fallbackImage;
                  }
                }}
              />
              <div className="featured-city-content">
                <h3 className="featured-city-name">{city.name}</h3>
                <p className="featured-city-description">{city.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
