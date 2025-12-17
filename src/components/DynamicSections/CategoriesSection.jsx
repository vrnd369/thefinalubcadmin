import React from 'react';
import Categories from '../Categories';
import './DynamicSections.css';

/**
 * Categories Section wrapper for dynamic home page
 * The Categories component is self-contained and fetches its own data from Firebase
 */
export default function CategoriesSection({ content, styles = {} }) {
  // Extract styles - only non-dimension properties
  const backgroundColor = styles?.backgroundColor;

  // Build section style - only colors, NO dimensions
  const sectionStyle = {
    ...(backgroundColor && { backgroundColor }), // Only colors allowed
  };

  // Wrap Categories component with optional styling
  return (
    <div style={sectionStyle}>
      <Categories />
    </div>
  );
}

