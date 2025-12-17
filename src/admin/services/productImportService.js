/**
 * Product Import Service
 * 
 * This service helps migrate existing hardcoded brands, categories, and products
 * from your components to Firebase Firestore.
 * 
 * Usage:
 * 1. Import this service in your admin dashboard
 * 2. Call importExistingData() to migrate all data
 * 3. Data will be imported to Firebase collections: brands, categories, products
 */

import { 
  addBrand, 
  addCategory, 
  addProduct,
  getBrands
} from './productService';

// Import existing assets
import soilKingIcon from '../../assets/soilkingicon.png';
import wellnessIcon from '../../assets/wellnessicon.png';
import imgPastes from '../../assets/paste.png';
import imgSpices from '../../assets/spices.png';
import imgMasalasAndSpices from '../../assets/masalas and spices.png';
import imgMasalas from '../../assets/masalas.png';
import imgRice from '../../assets/rice.png';
import imgAppalams from '../../assets/appalam.png';

/**
 * Import all existing brands, categories, and products to Firebase
 * This will create the initial data structure in Firestore
 */
export const importExistingData = async () => {
  try {
    console.log('Starting data import...');
    
    // Check if data already exists
    const existingBrands = await getBrands();
    if (existingBrands.length > 0) {
      const confirm = window.confirm(
        'Brands already exist in Firebase. Do you want to continue importing? ' +
        'This may create duplicates. Click Cancel to abort.'
      );
      if (!confirm) {
        return { success: false, message: 'Import cancelled' };
      }
    }

    // Step 1: Import Brands
    console.log('Importing brands...');
    const brandIds = await importBrands();
    console.log('Brands imported:', brandIds);

    // Step 2: Import Categories (wait for brands to be available)
    console.log('Importing categories...');
    const categoryIds = await importCategories(brandIds);
    console.log('Categories imported:', categoryIds);

    // Step 3: Import Products (wait for categories to be available)
    console.log('Importing products...');
    const productIds = await importProducts(brandIds, categoryIds);
    console.log('Products imported:', productIds);

    return {
      success: true,
      message: `Successfully imported ${brandIds.length} brands, ${categoryIds.length} categories, and ${productIds.length} products!`,
      counts: {
        brands: brandIds.length,
        categories: categoryIds.length,
        products: productIds.length
      }
    };
  } catch (error) {
    console.error('Error importing data:', error);
    return {
      success: false,
      message: `Import failed: ${error.message}`,
      error: error
    };
  }
};

/**
 * Import brands from existing data
 */
const importBrands = async () => {
  const brands = [
    {
      id: 'soil-king',
      name: 'Soil King',
      icon: soilKingIcon,
      order: 1,
      enabled: true
    },
    {
      id: 'wellness',
      name: 'Wellness',
      icon: wellnessIcon,
      order: 2,
      enabled: true
    }
  ];

  const brandIds = [];
  for (const brand of brands) {
    try {
      const id = await addBrand(brand);
      brandIds.push({ originalId: brand.id, firebaseId: id });
    } catch (error) {
      console.error(`Error importing brand ${brand.name}:`, error);
    }
  }
  return brandIds;
};

/**
 * Import categories from existing data
 */
const importCategories = async (brandIds) => {
  const soilKingId = brandIds.find(b => b.originalId === 'soil-king')?.firebaseId;
  const wellnessId = brandIds.find(b => b.originalId === 'wellness')?.firebaseId;

  const categories = [
    // Soil King Categories
    {
      id: 'masalas',
      title: 'Masalas',
      subtitle: 'Authentic blends for every dish',
      chip: 'Masalas',
      brandId: soilKingId,
      image: imgMasalas,
      href: '/products?category=masalas&brand=soil-king',
      order: 1,
      enabled: true
    },
    {
      id: 'rice',
      title: 'Rice',
      subtitle: 'Fragrant grains, rich in tradition',
      chip: 'Rice',
      brandId: soilKingId,
      image: imgRice,
      href: '/products?category=rice&brand=soil-king',
      order: 2,
      enabled: true
    },
    {
      id: 'appalams',
      title: 'Appalams & Crisps',
      subtitle: 'Crispy delights for every meal',
      chip: 'Appalams & Crisps',
      brandId: soilKingId,
      image: imgAppalams,
      href: '/products?category=appalams&brand=soil-king',
      order: 3,
      enabled: true
    },
    {
      id: 'pastes',
      title: 'Pastes & Ready Mix',
      subtitle: 'Pure flavors, ready to use',
      chip: 'Pastes & Ready Mix',
      brandId: soilKingId,
      image: imgPastes,
      href: '/products?category=pastes&brand=soil-king',
      order: 4,
      enabled: true
    },
    {
      id: 'soil-king-masalas-spices',
      title: 'Masalas & Spices',
      subtitle: 'Complete collection of authentic blends',
      chip: 'Masalas & Spices',
      brandId: soilKingId,
      image: imgMasalasAndSpices,
      href: '/products?category=masalas-spices&brand=soil-king',
      order: 5,
      enabled: true
    },
    // Wellness Categories
    {
      id: 'wellness-masalas',
      title: 'Premium Masala Blend',
      subtitle: 'Organic blends for healthy living',
      chip: 'Premium Masalas',
      brandId: wellnessId,
      image: imgMasalas,
      href: '/products?category=masalas&brand=wellness',
      order: 1,
      enabled: true
    },
    {
      id: 'wellness-rice',
      title: 'Organic White Rice',
      subtitle: 'Premium grains for wellness',
      chip: 'Organic Rice',
      brandId: wellnessId,
      image: imgRice,
      href: '/products?category=rice&brand=wellness',
      order: 2,
      enabled: true
    },
    {
      id: 'wellness-appalams',
      title: 'Wellness Crisps',
      subtitle: 'Light and healthy crispy snacks',
      chip: 'Healthy Snacks',
      brandId: wellnessId,
      image: imgAppalams,
      href: '/products?category=appalams&brand=wellness',
      order: 3,
      enabled: true
    },
    {
      id: 'wellness-spices',
      title: 'Organic Turmeric',
      subtitle: 'Pure golden spice for wellness',
      chip: 'Pure Spices',
      brandId: wellnessId,
      image: imgSpices,
      href: '/products?category=spices&brand=wellness',
      order: 4,
      enabled: true
    },
    {
      id: 'wellness-pastes',
      title: 'Organic Paste Mix',
      subtitle: 'Natural pastes for wholesome meals',
      chip: 'Organic Pastes',
      brandId: wellnessId,
      image: imgPastes,
      href: '/products?category=pastes&brand=wellness',
      order: 5,
      enabled: true
    }
  ];

  const categoryIds = [];
  for (const category of categories) {
    try {
      if (category.brandId) { // Only import if brand exists
        const id = await addCategory(category);
        categoryIds.push({ originalId: category.id, firebaseId: id, brandId: category.brandId });
      }
    } catch (error) {
      console.error(`Error importing category ${category.title}:`, error);
    }
  }
  return categoryIds;
};

/**
 * Import products from existing data
 * Note: This is a simplified version. You may need to add more product data
 * based on your ProductDetail.jsx file
 */
const importProducts = async (brandIds, categoryIds) => {
  // Get brand and category Firebase IDs
  const soilKingId = brandIds.find(b => b.originalId === 'soil-king')?.firebaseId;
  
  const masalasCategoryId = categoryIds.find(c => c.originalId === 'masalas' && c.brandId === soilKingId)?.firebaseId;
  const riceCategoryId = categoryIds.find(c => c.originalId === 'rice' && c.brandId === soilKingId)?.firebaseId;

  const products = [
    {
      id: 'chicken-masala',
      title: 'Chicken Masala',
      titleSub: 'by Soil King',
      brandId: soilKingId,
      categoryId: masalasCategoryId,
      description: 'A perfectly balanced blend of aromatic spices that brings out rich, authentic flavor in every chicken dish.',
      description2: 'Soil King Chicken Masala adds depth, warmth, and taste your family will love.',
      image: imgMasalas,
      sizes: ['100G', '500G'],
      nutrition: [
        { nutrient: 'Calories', value: '24Kcal', dailyValue: '-' },
        { nutrient: 'Protein', value: '1g', dailyValue: '-' },
        { nutrient: 'Total Carbohydrates', value: '4g', dailyValue: '1%' },
        { nutrient: 'Sugar', value: '1g', dailyValue: '-' },
        { nutrient: 'Total Fat', value: '1g', dailyValue: '2%' },
        { nutrient: 'Saturated Fat', value: '0g', dailyValue: '1%' },
        { nutrient: 'Dietary Fiber', value: '3g', dailyValue: '10%' }
      ],
      benefits: [
        {
          title: 'Authentic Flavor Blend',
          description: 'Crafted with a selection of premium, hand-picked spices, perfectly roasted and ground to deliver the rich, traditional taste and aroma essential for an unforgettable chicken dish every time.'
        }
      ],
      order: 1,
      enabled: true
    },
    {
      id: 'masalas',
      title: 'Chicken Masalas',
      brandId: soilKingId,
      categoryId: masalasCategoryId,
      description: 'Authentic blends for every dish',
      description2: 'Experience the rich flavors of traditional Indian cooking with our premium masala blends.',
      image: imgMasalas,
      sizes: ['100G', '500G'],
      nutrition: [
        { nutrient: 'Calories', value: '24Kcal', dailyValue: '-' },
        { nutrient: 'Protein', value: '1g', dailyValue: '-' },
        { nutrient: 'Total Carbohydrates', value: '4g', dailyValue: '1%' },
        { nutrient: 'Sugar', value: '1g', dailyValue: '-' },
        { nutrient: 'Total Fat', value: '1g', dailyValue: '2%' },
        { nutrient: 'Saturated Fat', value: '0g', dailyValue: '1%' },
        { nutrient: 'Dietary Fiber', value: '3g', dailyValue: '10%' }
      ],
      benefits: [
        {
          title: 'Authentic Flavor Blend',
          description: 'Crafted with a selection of premium, hand-picked spices, perfectly roasted and ground to deliver the rich, traditional taste and aroma essential for an unforgettable dish every time.'
        }
      ],
      order: 2,
      enabled: true
    },
    {
      id: 'rice',
      title: 'Rice',
      brandId: soilKingId,
      categoryId: riceCategoryId,
      description: 'Fragrant grains, rich in tradition',
      description2: 'Premium quality rice that brings the authentic taste to your table.',
      image: imgRice,
      sizes: ['1KG', '5KG', '10KG'],
      nutrition: [
        { nutrient: 'Calories', value: '130Kcal', dailyValue: '7%' },
        { nutrient: 'Protein', value: '2.7g', dailyValue: '5%' },
        { nutrient: 'Total Carbohydrates', value: '28g', dailyValue: '9%' },
        { nutrient: 'Sugar', value: '0g', dailyValue: '-' },
        { nutrient: 'Total Fat', value: '0.3g', dailyValue: '0%' },
        { nutrient: 'Saturated Fat', value: '0.1g', dailyValue: '0%' },
        { nutrient: 'Dietary Fiber', value: '0.4g', dailyValue: '1%' }
      ],
      benefits: [
        {
          title: 'Premium Quality',
          description: 'Hand-selected grains that ensure perfect texture and flavor in every meal.'
        }
      ],
      order: 1,
      enabled: true
    }
    // Add more products as needed based on your ProductDetail.jsx
  ];

  const productIds = [];
  for (const product of products) {
    try {
      if (product.brandId && product.categoryId) { // Only import if brand and category exist
        const id = await addProduct(product);
        productIds.push({ originalId: product.id, firebaseId: id });
      }
    } catch (error) {
      console.error(`Error importing product ${product.title}:`, error);
    }
  }
  return productIds;
};

