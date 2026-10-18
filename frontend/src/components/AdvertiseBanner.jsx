'use client';

import Link from 'next/link';
import { PlusCircle, ArrowRight } from 'lucide-react';

export default function AdvertiseBanner() {
  return (
    <div className="container">
      <div className="advertise-banner">
        <div className="advertise-text">
          <h3>Looking to advertise a property?</h3>
          <p>We connect thousands of verified tenants, buyers, and premier real estate agents every day.</p>
        </div>
        <Link href="/add-property" className="btn-primary" style={{ height: 46 }}>
          <PlusCircle size={18} />
          <span>List your property with us</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
