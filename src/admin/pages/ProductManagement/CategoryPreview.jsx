import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import SectionTag from '../../../components/SectionTag';
import { resolveImageUrl } from '../../../utils/imageUtils';
import '../../../components/Categories.css';
import '../../../pages/Brands.css';
import './CategoryPreview.css';

export default function CategoryPreview({ formData, brands }) {
  // State for resolved image URL
  const [resolvedImage, setResolvedImage] = useState(null);

  // Get brand information
  const brand = brands?.find(b => b.id === formData.brandId);
  const brandIdentifier = brand ? (brand.brandId || brand.id) : null;

  // Helper to convert category chip to URL-friendly slug
  const chipToSlug = (chip) => {
    if (!chip || chip === 'All') return null;
    return chip.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '');
  };

  // Build href for the category
  const categorySlug = chipToSlug(formData.chip) || formData.id || 'preview';
  const href = brandIdentifier
    ? `/products?category=${categorySlug}&brand=${brandIdentifier}`
    : `/products?category=${categorySlug}`;

  // Transform formData to match category card structure
  const category = {
    id: formData.id || 'preview',
    title: formData.title || 'Category Title',
    subtitle: formData.subtitle || 'Category subtitle',
    chip: formData.chip || 'Category',
    image: formData.image || '',
    href: href,
    titleAlign: formData.titleAlign || 'left',
    titleFontSize: formData.titleFontSize,
    titleWidth: formData.titleWidth,
    subtitleAlign: formData.subtitleAlign || 'left',
    subtitleFontSize: formData.subtitleFontSize,
    subtitleWidth: formData.subtitleWidth,
    knowMoreText: formData.knowMoreText || 'Know More',
    knowMoreBgColor: formData.knowMoreBgColor || '#f3f4f6'
  };

  // Resolve image when formData changes
  useEffect(() => {
    const resolveImage = async () => {
      if (category.image) {
        try {
          const url = await resolveImageUrl(category.image);
          setResolvedImage(url);
        } catch (err) {
          console.error('Error resolving category image:', err);
          setResolvedImage(null);
        }
      } else {
        setResolvedImage(null);
      }
    };
    
    resolveImage();
  }, [category.image]);

  return (
    <div className="category-preview-container">
      <div className="category-preview-wrapper">
        {/* Navbar */}
        <div className="category-preview-navbar">
          <Navbar />
        </div>

        {/* Category Section Preview */}
        <section className="section categories-section" style={{ padding: '24px 0 80px' }}>
          <div className="container">
            <SectionTag label="★ CATEGORIES" />
            <h2>
              Explore our finest products<br/>crafted <span className="playfair-text">for</span> everyday flavor
            </h2>

            {/* Category Card Preview */}
            <div className="grid cards" style={{ marginTop: '32px' }}>
              <div className="category-card">
                <div className="category-card-head">
                  {resolvedImage ? (
                    <img src={resolvedImage} alt={category.title} />
                  ) : category.image ? (
                    <div style={{ 
                      width: '100%', 
                      height: '200px', 
                      backgroundColor: '#f3f4f6', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#9CA3AF'
                    }}>
                      Loading image...
                    </div>
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '200px', 
                      backgroundColor: '#f3f4f6', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#9CA3AF'
                    }}>
                      No Image
                    </div>
                  )}
                </div>

                <div className="category-card-bar">
                  <div className="category-text">
                    <h3 
                      className="category-title"
                      style={{
                        textAlign: category.titleAlign || 'left',
                        fontSize: category.titleFontSize ? `${category.titleFontSize}px` : undefined,
                        width: category.titleWidth ? `${category.titleWidth}px` : undefined,
                      }}
                    >
                      {category.title}
                    </h3>
                    <p 
                      className="category-subtitle"
                      style={{
                        textAlign: category.subtitleAlign || 'left',
                        fontSize: category.subtitleFontSize ? `${category.subtitleFontSize}px` : undefined,
                        width: category.subtitleWidth ? `${category.subtitleWidth}px` : undefined,
                      }}
                    >
                      {category.subtitle}
                    </p>
                  </div>
                  <div 
                    className="know-more-btn" 
                    style={{ 
                      cursor: 'default',
                      backgroundColor: category.knowMoreBgColor || '#f3f4f6'
                    }}
                  >
                    {category.knowMoreText || 'Know More'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

