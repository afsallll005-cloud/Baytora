'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RentRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/properties?category=rent');
  }, [router]);

  return (
    <div style={{ padding: '100px 20px', textAlign: 'center' }}>
      <div style={{ 
        width: 44, 
        height: 44, 
        border: '3px solid var(--border-light)', 
        borderTopColor: 'var(--primary)', 
        borderRadius: '50%', 
        animation: 'spin 0.8s linear infinite', 
        margin: '0 auto 16px' 
      }}></div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
        Loading Properties for Rent
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
        Finding verified residential apartments, villas, and studios...
      </p>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
