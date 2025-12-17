import React from 'react';
import './WhySection.css';
import icon1 from '../assets/Frame 208.png';
import icon2 from '../assets/Frame 209.png';
import icon3 from '../assets/Frame 210.png';

export default function WhySection(){
  return (
    <section className="why-section section">
      <div className="container">
        <span className="tag why-tag">★ WHY</span>
        <h2 className="why-heading">Why United<br/>Brothers Company?</h2>
        <p className="lead why-subtitle">
          The best products come from a combination of<br/>unwavering commitment and genuine care.
        </p>
        
        <div className="why-features">
          <div className="why-card">
            <div className="why-icon">
              <img src={icon1} alt="Commitment to Quality" />
            </div>
            <h3>Commitment<br/>to Quality</h3>
            <p className="why-desc-4">We follow strict sourcing and production standards, ensuring top quality—certified by FSSAI, ISO, and HACCP.</p>
          </div>
          
          <div className="why-card">
            <div className="why-icon">
              <img src={icon2} alt="Legacy of Taste" />
            </div>
            <h3>Legacy<br/>of Taste</h3>
            <p className="why-desc-5">For generations, we've been preserving the authentic flavors of traditional Indian food, from our aromatic basmati rice to our flavorful masalas.</p>
          </div>
          
          <div className="why-card">
            <div className="why-icon">
              <img src={icon3} alt="Trusted by Millions" />
            </div>
            <h3>Trusted<br/>by Millions</h3>
            <p className="why-desc-4">Our commitment to purity and taste has established us as a trusted household name worldwide.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

