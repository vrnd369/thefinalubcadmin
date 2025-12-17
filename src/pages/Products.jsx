import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Products.css';
import Categories from '../components/Categories';

export default function Products(){
  const [searchParams] = useSearchParams();
  const brandFromUrl = searchParams.get('brand') || 'All';
  const categoryFromUrl = searchParams.get('category') || null;
  const [selectedBrand, setSelectedBrand] = useState(brandFromUrl);

  useEffect(() => {
    document.title = 'Products - UBC | United Brothers Company';
  }, []);

  // Update selectedBrand when URL param changes
  useEffect(() => {
    const brandParam = searchParams.get('brand');
    setSelectedBrand(brandParam || 'All');
  }, [searchParams]);

  // Scroll to products section when category is in URL
  useEffect(() => {
    if (categoryFromUrl) {
      // Delay to ensure Categories component has rendered and filters are applied
      const scrollTimer = setTimeout(() => {
        const productsSection = document.getElementById('products');
        if (productsSection) {
          // Calculate offset for fixed navbar
          const navbarHeight = 80; // Approximate navbar height
          const elementPosition = productsSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 300); // Increased delay to ensure filters are applied

      return () => clearTimeout(scrollTimer);
    }
  }, [categoryFromUrl, selectedBrand]);

  return (
    <main>
      <Categories selectedBrand={selectedBrand} initialCategory={categoryFromUrl} />
    </main>
  )
}
