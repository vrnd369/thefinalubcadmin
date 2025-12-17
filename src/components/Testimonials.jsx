import React, { useRef, useEffect, useState } from 'react';
import './Testimonials.css';
import avatar1 from '../assets/Testimonial 1.png';
import avatar2 from '../assets/Testimonial 2.png';
import avatar3 from '../assets/Testimonial 3.png';
import avatar4 from '../assets/Testimonial 4.png';

const Card = ({ text, name, company, role, image, isFirst, isSecond }) => (
  <div className={`t-card card ${isFirst ? 't-card-first' : ''} ${isSecond ? 't-card-second' : ''}`}>
    <p className="t-quote" dangerouslySetInnerHTML={{ __html: text }}></p>
    <div className="t-author">
      <div className="avatar">
        <img src={image} alt={name} />
      </div>
      <div className="t-author-info">
        <strong className="t-name">{name}</strong>
        <div className="t-role-container">
          <span className="t-company">{company}</span>
          {role && <span className="t-role-tag">{role}</span>}
        </div>
      </div>
    </div>
  </div>
);

export default function Testimonials() {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Update arrow states based on scroll position
  const updateArrowStates = () => {
    const row = scrollContainerRef.current;
    if (!row) return;

    const { scrollLeft, scrollWidth, clientWidth } = row;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Block manual horizontal scroll (allow vertical scroll)
  useEffect(() => {
    const row = scrollContainerRef.current;
    if (!row) return;

    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
      }
    };

    row.addEventListener('wheel', onWheel, { passive: false });
    row.addEventListener('scroll', updateArrowStates);
    
    // Initial check
    updateArrowStates();

    return () => {
      row.removeEventListener('wheel', onWheel);
      row.removeEventListener('scroll', updateArrowStates);
    };
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 311;      // width of second cards
      const firstCardWidth = 526; // width of first card
      const gap = 24;             // grid gap

      const scrollAmount =
        scrollContainerRef.current.scrollLeft === 0
          ? firstCardWidth + gap
          : cardWidth + gap;

      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
      
      // Update states after a short delay to allow scroll to complete
      setTimeout(updateArrowStates, 100);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 311;
      const firstCardWidth = 526;
      const gap = 24;

      const currentScroll = scrollContainerRef.current.scrollLeft;
      const scrollAmount =
        currentScroll < firstCardWidth
          ? firstCardWidth + gap - currentScroll
          : cardWidth + gap;

      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
      
      // Update states after a short delay to allow scroll to complete
      setTimeout(updateArrowStates, 100);
    }
  };

  return (
    <section className="section testimonials">
      <div className="container">
        <div className="testimonials-header">
          <div className="testimonials-title-area">
            <span className="testimonials-tag">
              <span className="testimonials-star">★</span> TESTIMONIALS
            </span>
            <h2 className="testimonials-heading">
              Because Quality Speaks <span className="testimonials-playfair-text">for</span> Itself
            </h2>
          </div>
          <div className="testimonials-arrows">
            <button
              aria-label="Previous"
              className="btn icon-btn prev"
              onClick={scrollLeft}
              type="button"
            >
              <svg className="arrow-icon" viewBox="0 0 40 40" aria-hidden="true" style={{ stroke: canScrollLeft ? '#111827' : '#6B7280' }}>
                {/* shaft */}
                <line x1="32" y1="20" x2="10" y2="20" />
                {/* head */}
                <polyline points="18 12 10 20 18 28" />
              </svg>
            </button>
            <button
              aria-label="Next"
              className="btn icon-btn next"
              onClick={scrollRight}
              type="button"
            >
              <svg className="arrow-icon" viewBox="0 0 40 40" aria-hidden="true" style={{ stroke: canScrollRight ? '#111827' : '#6B7280' }}>
                {/* shaft */}
                <line x1="8" y1="20" x2="30" y2="20" />
                {/* head */}
                <polyline points="22 12 30 20 22 28" />
              </svg>
            </button>
          </div>
        </div>

        {/* THIS is now the scroll container, just like your first version */}
        <div className="t-grid no-user-scroll" ref={scrollContainerRef}>
          <Card
            text="The Basmati rice from Soil King has<br/>become a staple in my home. The aroma<br/>and texture are unmatched."
            name="Anita Reddy"
            company="Moove"
            role="Chef"
            image={avatar1}
            isFirst={true}
          />
          <Card
            text="As a chef, I value consistency.<br/>The spices from UBC bring<br/>authentic flavors  to every dish<br/>I prepare."
            name="Rahul Jain"
            company=""
            role="Chef"
            image={avatar2}
            isSecond={true}
          />
          <Card
            text="I appreciate how convenient<br/>the ready-to-use pastes are.<br/>They save me time without compromising on taste."
            name="Aishwarya"
            company=""
            role="Home Cook"
            image={avatar3}
            isSecond={true}
          />
          <Card
            text="Soil King products perfect<br/>balance between tradition and<br/>modern convenience. Truly impressive!"
            name="Anita Reddy"
            company="Moove"
            role="Chef"
            image={avatar4}
            isSecond={true}
          />
        </div>
      </div>
    </section>
  );
}
