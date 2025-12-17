import React from 'react';
import './Overview.css';
import logo from '../assets/Logo1.png';
import bgImage from '../assets/ov.png';

export default function Overview() {
  return (
    <section className="overview section">
      <div
        className="overview-bg"
        style={{
          backgroundImage: `url(${bgImage})`
        }}
      ></div>
      <div className="container">
        <div className="overview-content">
          {/* Tag with small star */}
          <span className="overview-tag">
          <span className="tell-us-star">★</span>
            OVERVIEW
          </span>

          <h2 className="overview-heading">
            Where Tradition <span className="overview-heading-nowrap">Meets Modern Taste</span>
          </h2>

          <div className="overview-logo">
            <img src={logo} alt="UBC" />
          </div>

          <p className="overview-text">
            At UBC, we believe food should be both<br />
            authentic and effortless. Our products are<br />
            sourced with care, processed with precision,<br />
            and packed to preserve freshness.
          </p>

          <p className="overview-text">
            From aromatic Basmati rice to vibrant spices<br />
            and ready mixes, Soil King is your trusted<br />
            partner in creating meals that feel homemade,<br />
            every single time.
          </p>

          {/* Button with star exactly like screenshot */}
          <a className="overview-btn" href="/contact">
            Get in touch
            {/* <span className="tell-us-star">★</span> */}
          </a>
        </div>
      </div>
    </section>
  );
}

