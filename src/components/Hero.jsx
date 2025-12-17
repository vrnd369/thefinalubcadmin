import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';
import heroVideo from '../assets/trac.mp4';

const Hero = () => {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const videoEl = videoRef.current;
      const heroEl = heroRef.current;

      if (!videoEl || !heroEl) return;

      const isDesktop = window.innerWidth >= 768;

      // Disable parallax on mobile/tablet for performance & layout safety
      if (!isDesktop) {
        videoEl.style.transform = 'translate3d(0, 0, 0)';
        return;
      }

      const rect = heroEl.getBoundingClientRect();
      const speed = 0.25; // tweak for stronger/weaker parallax

      // When you scroll down, rect.top becomes negative.
      // This moves the video slightly and creates the parallax feel.
      const offsetY = rect.top * speed;

      // Keep it horizontally centered with -50% and move vertically with offsetY
      videoEl.style.transform = `translate3d(-50%, ${offsetY}px, 0)`;
    };

    // Run once on mount
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-video-wrapper">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="hero-video"
          preload="auto"
        >
          <source src={heroVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="hero-overlay" />

      <div className="container hero-inner">
        <h1>
          Crafting purity,<br />
          preserving taste.
        </h1>
        <p className="lead">
          Built on trust. Driven by quality. Committed to you. These are the values behind every
          product <br></br>We create, from the first harvest to the final pack. We are dedicated to bringing
          you everyday essentials that are pure, reliable, and crafted with care, making better
          choices for your home, your health, and the planet we share.
        </p>
        <div className="hero-actions">
          <a className="btn" href="#products">
            Explore Products
          </a>
          <a 
            className="btn ghost" 
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              navigate('/contact');
            }}
          >
            Get in contact
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
