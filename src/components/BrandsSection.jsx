import React from 'react';
import './BrandsSection.css';

export default function BrandsSection() {
  return (
    <section className="promise-section section">
      <div className="container">
        <div className="promise-content">
          <div className="promise-left">
            <span className="tag promise-tag">★ ABOUT US</span>
            <h2 className="promise-heading">
              A Promise of Purity,<br />
              from Our Fields to Your Home.
            </h2>
          </div>

          {/* Right starts aligned with the first line of the heading */}
          <div className="promise-right">
            <p className="lead promise-p1">
              The <strong>United Brothers Company</strong> has been a trusted name in the FMCG industry,
              offering pure and authentic products for homes nationwide.
            </p>
            <p className="lead promise-p2">
              Our purpose is to deliver essentials that you can rely on, created with a commitment to quality
              and a legacy of taste.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
