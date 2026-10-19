'use client';

import { useEffect, useRef } from 'react';
import './ShowcaseBanner.css';

export default function ShowcaseBanner() {
  const frameRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    let currentScale = 1.24;
    let targetScale = 1.24;
    let currentTranslateY = 0;
    let targetTranslateY = 0;
    let isTicking = false;

    const calculateTarget = () => {
      if (!frameRef.current) return;
      const rect = frameRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Only calculate if visible in or near the viewport
      if (rect.bottom > -80 && rect.top < windowHeight + 80) {
        // progress: 0 when banner enters bottom, 1 when banner leaves top
        const totalDistance = windowHeight + rect.height;
        const currentDistance = windowHeight - rect.top;
        const progress = Math.min(Math.max(currentDistance / totalDistance, 0), 1);

        // When scrolling DOWN (progress increasing): scale smoothly Zooms OUT (from 1.25 down to 1.0)
        // When scrolling UP (progress decreasing): scale smoothly Zooms IN (from 1.0 up to 1.25)
        const baseScale = 1.25 - progress * 0.25;

        // Instantaneous directional bias for immediate tactile response
        const scrollDelta = window.scrollY - lastScrollY;
        const directionBonus = scrollDelta > 0 ? -0.025 : scrollDelta < 0 ? 0.025 : 0;

        // Clamp between 1.0 (pure full view) and 1.28 (zoomed in)
        targetScale = Math.min(Math.max(baseScale + directionBonus, 1.0), 1.28);

        // Gentle subtle parallax shift (-24px to +24px)
        targetTranslateY = (progress - 0.5) * -28;
      }
      lastScrollY = window.scrollY;
    };

    const handleScroll = () => {
      if (!isTicking) {
        calculateTarget();
        isTicking = true;
      }
    };

    const renderLoop = () => {
      // Smooth lerp (0.09) for luxurious fluid inertia
      currentScale += (targetScale - currentScale) * 0.09;
      currentTranslateY += (targetTranslateY - currentTranslateY) * 0.09;

      if (imgRef.current) {
        imgRef.current.style.transform = `scale(${currentScale.toFixed(4)}) translateY(${currentTranslateY.toFixed(2)}px)`;
      }

      isTicking = false;
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', calculateTarget, { passive: true });

    calculateTarget();
    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', calculateTarget);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="showcase-banner-section" aria-label="Architectural Showcase">
      <div className="showcase-banner-frame" ref={frameRef}>
        {/* Scroll Zoom Animated Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src="/images/villa2.png"
          alt="Modern Architectural Pavilion Villa with Sunken Courtyard Pool"
          className="showcase-banner-img"
          onError={(e) => {
            if (!e.currentTarget.dataset.fallbackTried) {
              e.currentTarget.dataset.fallbackTried = 'true';
              e.currentTarget.src = '/api/showcase';
            }
          }}
          loading="eager"
          decoding="async"
        />

        {/* Subtle Luxury Gradient Vignette */}
        <div className="showcase-banner-vignette" />

        
      </div>
    </section>
  );
}
