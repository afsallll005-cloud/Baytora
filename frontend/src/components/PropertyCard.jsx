'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bed, Bath, Heart } from 'lucide-react';
import './PropertyCard.css';

export default function PropertyCard({ property, onInquire }) {
  const [isSaved, setIsSaved] = useState(false);

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'];

  const toggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  const isForSale = property.category === 'buy';
  const categoryLabel = isForSale ? 'For sale' : 'For rent';
  const typeLabel = property.propertyType || 'Apartment';

  // Format price matching the user's reference (e.g. $749,000 or $650/mo)
  const isUSD = property.currency === 'USD' || property.currency === '$';
  const currencyPrefix = isUSD ? '$' : `${property.currency || 'BHD'} `;
  const formattedPrice = property.category === 'rent'
    ? `${currencyPrefix}${property.price?.toLocaleString()}${property.pricePeriod === 'yearly' ? '/yr' : '/mo'}`
    : `${currencyPrefix}${property.price?.toLocaleString()}`;

  // Area calculation in sq.ft
  const areaSqft = property.areaSqft || (property.area ? Math.round(property.area * 10.764) : 680);

  // Location text
  const locationText = property.location?.address 
    || `${property.location?.city || 'Bayshore Gardens'}, ${property.location?.governorate ? property.location.governorate.replace(' Governorate', '') : 'Tampa, FL'}`;

  return (
    <article className="minimal-card">
      {/* 1. Image container */}
      <div className="minimal-card-media">
        <Link href={`/properties/${property._id}`} className="minimal-card-img-link">
          <img 
            src={images[0]} 
            alt={property.title} 
            className="minimal-card-img"
            loading="lazy" 
          />
        </Link>

        {/* Top-left pill tags: [For sale] [Apartment] */}
        <div className="minimal-card-pills">
          <span className="minimal-pill">{categoryLabel}</span>
          <span className="minimal-pill">{typeLabel}</span>
        </div>

        {/* Top-right heart button */}
        <button 
          type="button" 
          className={`minimal-heart-btn ${isSaved ? 'saved' : ''}`}
          onClick={toggleSave}
          title={isSaved ? "Saved to favorites" : "Save property"}
          aria-label="Save property"
        >
          <Heart 
            size={18} 
            color={isSaved ? "#EF4444" : "#1E293B"} 
            fill={isSaved ? "#EF4444" : "none"} 
            strokeWidth={2}
          />
        </button>
      </div>

      {/* 2. Details under image */}
      <div className="minimal-card-content">
        {/* Row 1: Title & Price */}
        <div className="minimal-card-header">
          <Link href={`/properties/${property._id}`} className="minimal-title-link">
            <h3 className="minimal-card-title" title={property.title}>
              {property.title}
            </h3>
          </Link>
          <span className="minimal-card-price">
            {formattedPrice}
          </span>
        </div>

        {/* Row 2: Location */}
        <p className="minimal-card-location">
          {locationText}
        </p>

        {/* Row 3: Specs Strip (Area, Beds, Baths) */}
        <div className="minimal-card-specs">
          {/* Area icon matching reference crosshair corners */}
          <div className="minimal-spec-item" title={`${areaSqft} sq.ft (${property.area} sqm)`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8V4h4" />
              <path d="M20 8V4h-4" />
              <path d="M4 16v4h4" />
              <path d="M20 16v4h-4" />
            </svg>
            <span>{areaSqft} sq.ft</span>
          </div>

          {/* Bed icon */}
          <div className="minimal-spec-item" title={`${property.bedrooms} Bedrooms`}>
            <Bed size={16} strokeWidth={1.8} />
            <span>{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} Bed`}</span>
          </div>

          {/* Bath icon */}
          <div className="minimal-spec-item" title={`${property.bathrooms} Bathrooms`}>
            <Bath size={16} strokeWidth={1.8} />
            <span>{property.bathrooms} Bath</span>
          </div>
        </div>
      </div>
    </article>
  );
}
