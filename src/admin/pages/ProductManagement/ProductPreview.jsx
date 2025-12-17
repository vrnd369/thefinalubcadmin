import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import SectionTag from '../../../components/SectionTag';
import probgImage from '../../../assets/probg1.png';
import { resolveImageUrl } from '../../../utils/imageUtils';
import '../../../pages/ProductDetail.css';
import './ProductPreview.css';

export default function ProductPreview({ formData, brands, categories }) {
  // State for resolved image URLs
  const [resolvedImages, setResolvedImages] = useState({
    productImage: null,
    whyChooseBackground: null,
    pillarIcons: {}
  });

  // Transform formData to match ProductDetail component structure
  const product = {
    id: formData.id || 'preview',
    title: formData.title || 'Product Title',
    titleSub: formData.titleSub || '',
    category: formData.category || 'Product',
    description: formData.description || '',
    description2: formData.description2 || '',
    image: formData.image || '',
    sizes: formData.sizes || [],
    nutrition: formData.nutrition || [],
    benefits: formData.benefits || [],
    whyChooseTitle: formData.whyChooseTitle || '',
    whyChooseTitleAlign: formData.whyChooseTitleAlign || 'left',
    whyChooseBackground: formData.whyChooseBackground || probgImage,
    uspTag: formData.uspTag || '★ USP',
    uspTitle: formData.uspTitle || '',
    uspTitleAlign: formData.uspTitleAlign || 'left',
    titleAlign: formData.titleAlign || 'left',
    titleSubAlign: formData.titleSubAlign || 'left',
    descriptionAlign: formData.descriptionAlign || 'left',
    description2Align: formData.description2Align || 'left',
    titleFontSize: formData.titleFontSize,
    titleWidth: formData.titleWidth,
    titleSubFontSize: formData.titleSubFontSize,
    titleSubWidth: formData.titleSubWidth,
    descriptionFontSize: formData.descriptionFontSize,
    descriptionWidth: formData.descriptionWidth,
    pillars: formData.pillars || [],
    brandId: formData.brandId || '',
    categoryId: formData.categoryId || ''
  };

  // eslint-disable-next-line no-unused-vars
  const brand = brands?.find(b => b.id === product.brandId);

  // Resolve images when formData changes
  useEffect(() => {
    const resolveImages = async () => {
      const imagePromises = [];
      
      // Resolve main product image
      if (product.image) {
        imagePromises.push(
          resolveImageUrl(product.image).then(url => {
            setResolvedImages(prev => ({ ...prev, productImage: url }));
          }).catch(err => console.error('Error resolving product image:', err))
        );
      }
      
      // Resolve why choose background
      if (product.whyChooseBackground && product.whyChooseBackground !== probgImage) {
        imagePromises.push(
          resolveImageUrl(product.whyChooseBackground).then(url => {
            setResolvedImages(prev => ({ ...prev, whyChooseBackground: url }));
          }).catch(err => console.error('Error resolving why choose background:', err))
        );
      } else {
        setResolvedImages(prev => ({ ...prev, whyChooseBackground: probgImage }));
      }
      
      // Resolve pillar icons
      if (product.pillars && product.pillars.length > 0) {
        product.pillars.forEach((pillar, index) => {
          if (pillar.icon) {
            imagePromises.push(
              resolveImageUrl(pillar.icon).then(url => {
                setResolvedImages(prev => ({
                  ...prev,
                  pillarIcons: { ...prev.pillarIcons, [index]: url }
                }));
              }).catch(err => console.error(`Error resolving pillar ${index} icon:`, err))
            );
          }
        });
      }
      
      await Promise.all(imagePromises);
    };
    
    resolveImages();
  }, [product.image, product.whyChooseBackground, product.pillars]);

  const renderBenefitLines = (benefit) => {
    if (!benefit || !benefit.description) return null;
    const parts = benefit.description.split('<br/>');
    return (
      <div className="benefit-lines">
        {parts.map((part, idx) => (
          <p key={idx} className="benefit-line">{part}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="product-preview-container">
      <div className="product-preview-wrapper">
        {/* Navbar */}
        <div className="product-preview-navbar">
          <Navbar />
        </div>

        {/* Product Detail Preview */}
        <main className="product-detail">
          <section className="product-detail-section">
            <div className="container">
              <div className="product-detail-grid">
                {/* Left: Product Image */}
                <div className="product-image-wrapper">
                  <div className="product-image-card">
                    {resolvedImages.productImage ? (
                      <img src={resolvedImages.productImage} alt={product.title} className="product-image" />
                    ) : product.image ? (
                      <div className="product-image-placeholder">
                        <span>Loading image...</span>
                      </div>
                    ) : (
                      <div className="product-image-placeholder">
                        <span>No Image</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Product Details */}
                <div className="product-details">
                  <SectionTag label={(product.category || 'PRODUCT').toUpperCase()} />
                  <h1 
                    className="product-title" 
                    style={{ 
                      textAlign: product.titleAlign || 'left',
                      fontSize: product.titleFontSize ? `${product.titleFontSize}px` : undefined,
                      width: product.titleWidth ? `${product.titleWidth}px` : undefined,
                    }}
                  >
                    {product.title}
                    {product.titleSub && (
                      <span 
                        className="product-title-sub" 
                        style={{ 
                          display: 'block', 
                          textAlign: product.titleSubAlign || 'left',
                          fontSize: product.titleSubFontSize ? `${product.titleSubFontSize}px` : undefined,
                          width: product.titleSubWidth ? `${product.titleSubWidth}px` : undefined,
                        }}
                      >
                        {product.titleSub}
                      </span>
                    )}
                  </h1>

                  {product.description && (
                    <p 
                      className="product-description" 
                      style={{ 
                        textAlign: product.descriptionAlign || 'left',
                        fontSize: product.descriptionFontSize ? `${product.descriptionFontSize}px` : undefined,
                        width: product.descriptionWidth ? `${product.descriptionWidth}px` : undefined,
                      }}
                    >
                      {product.description}
                    </p>
                  )}
                  {product.description2 && (
                    <p className="product-description-2" style={{ textAlign: product.description2Align || 'left' }}>
                      {product.description2}
                    </p>
                  )}

                  {product.sizes && product.sizes.length > 0 && (
                    <>
                      <div className="divider"></div>
                      <div className="available-sizes">
                        <h3 className="sizes-title">Available Sizes</h3>
                        <div className="sizes-list">
                          {product.sizes.map((size, index) => (
                            <button key={index} className="size-button">
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {product.nutrition && product.nutrition.length > 0 && (
                    <>
                      <div className="divider"></div>
                      <div className="nutritional-info">
                        <h3 className="nutrition-title">Nutritional Information (Per 100g)</h3>
                        <table className="nutrition-table">
                          <tbody>
                            {product.nutrition.map((item, index) => (
                              <tr key={index}>
                                <td className="nutrient">{item.nutrient}</td>
                                <td className="nutrient-val">{item.value}</td>
                                <td className="nutrient-dv">{item.dailyValue}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Section */}
          {product.whyChooseTitle && (
            <section
              className="why-choose-section"
              style={{
                backgroundImage: `url(${resolvedImages.whyChooseBackground || product.whyChooseBackground || probgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="why-choose-overlay"></div>
              <div className="container">
                <div className="why-choose-grid">
                  <div className="why-choose-left">
                    <h2 
                      className="why-choose-title" 
                      dangerouslySetInnerHTML={{
                        __html: product.whyChooseTitle
                          .replace(/{Product Name}/g, product.title)
                          .replace(/\n/g, '<br />')
                      }} 
                      style={{ textAlign: product.whyChooseTitleAlign || 'left' }}
                    />
                  </div>

                  <div className="why-choose-right">
                    {product.benefits && product.benefits.length > 0 ? (
                      product.benefits.map((benefit, index) => (
                        <div key={index} className="benefit-item">
                          <p className="benefit-label">Benefits:</p>
                          <h3 className="benefit-subtitle">{benefit.title} -</h3>
                          {renderBenefitLines(benefit)}
                        </div>
                      ))
                    ) : (
                      <div className="benefit-item">
                        <p className="benefit-label">No benefits added yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Four Pillars Section */}
          {product.pillars && product.pillars.length > 0 && (
            <section className="four-pillars-section">
              <div className="container">
                <div className="pillars-grid">
                  <div className="pillars-left">
                    <SectionTag label={product.uspTag || "★ USP"} />
                    <h2 
                      className="pillars-title" 
                      dangerouslySetInnerHTML={{
                        __html: (product.uspTitle || "The Four Pillars<br />of Our Quality Spice")
                          .replace(/<br\s*\/?>/gi, '<br />')
                          .replace(/\n/g, '<br />')
                      }} 
                      style={{ textAlign: product.uspTitleAlign || 'left' }}
                    />
                  </div>

                  <div className="pillars-right">
                    <div className="pillars-grid-items">
                      {product.pillars.map((pillar, index) => (
                        <div key={index} className="pillar-item">
                          {(resolvedImages.pillarIcons[index] || pillar.icon) && (
                            <div className="pillar-icon">
                              <img src={resolvedImages.pillarIcons[index] || pillar.icon} alt={pillar.title || `Pillar ${index + 1}`} />
                            </div>
                          )}
                          {pillar.title && (
                            <h3 className="pillar-title">{pillar.title}</h3>
                          )}
                          {pillar.description && (
                            <p 
                              className="pillar-description" 
                              dangerouslySetInnerHTML={{
                                __html: pillar.description.replace(/<br\s*\/?>/gi, '<br />')
                              }} 
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

