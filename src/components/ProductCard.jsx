import React from 'react';
import './ProductCard.css';

export default function ProductCard({img, title, subtitle}){
  return (
    <article className="product card">
      <div className="thumb"><img src={img} alt={title} /></div>
      <div className="product-body">
        <h3>{title}</h3>
        <p>{subtitle}</p>
        <button className="btn ghost">Know More</button>
      </div>
    </article>
  )
}
