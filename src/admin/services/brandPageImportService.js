import { addBrandPage, brandPageExists } from "./brandPageService";
import { getBrands } from "./productService";
import { getCategories } from "./productService";
import { getDefaultDimensions } from "../components/BrandPageEditor/dimensionUtils";

// Import static assets from the current Brands.jsx
import br1 from "../../assets/br1.png";
import br2 from "../../assets/br2.png";
import prodMasalas from "../../assets/masalas.png";
import prodRice from "../../assets/rice.png";
import prodAppalams from "../../assets/appalam.png";
import prodAtta from "../../assets/spices.png";
import prodSpices from "../../assets/spices.png";
import prodPastes from "../../assets/paste.png";

/**
 * Import brand page from Wellness.jsx component
 * @param {string} brandId - Brand identifier (e.g., "wellness")
 * @returns {Promise<Object>} Result object with success status and message
 */
export const importWellnessPageFromStatic = async (brandId = "wellness") => {
  try {
    // Check if brand page already exists
    const exists = await brandPageExists(brandId);
    if (exists) {
      return {
        success: false,
        message: `Brand page for "${brandId}" already exists. Please edit the existing page instead.`,
      };
    }

    // Get brand info
    const brands = await getBrands();
    const brand = brands.find(
      (b) => (b.brandId || b.id) === brandId || b.id === brandId
    );
    
    if (!brand) {
      return {
        success: false,
        message: `Brand "${brandId}" not found. Please create the brand in Product Management first.`,
      };
    }

    // Get categories for this brand
    const categories = await getCategories();
    const brandCategories = categories.filter((c) => {
      const categoryBrandId = c.brandId;
      const brandDocId = brand.id;
      return categoryBrandId === brandDocId;
    });

    // Extract product cards from Wellness.jsx
    const productItems = [
      {
        id: "wellness-masalas",
        image: prodMasalas,
        title: "Premium Masala Blend",
        blurb: "Organic blends for healthy living",
        cta: "Know More",
        href: "/product/wellness-masalas",
      },
      {
        id: "wellness-rice",
        image: prodRice,
        title: "Organic White Rice",
        blurb: "Premium grains for wellness",
        cta: "Know More",
        href: "/product/wellness-rice",
      },
      {
        id: "wellness-appalams-3",
        image: prodAppalams,
        title: "Wellness Crisps",
        blurb: "Light and healthy crispy snacks",
        cta: "Know More",
        href: "/product/wellness-appalams-3",
      },
      {
        id: "wellness-spices-2",
        image: prodSpices,
        title: "Organic Turmeric",
        blurb: "Pure golden spice for wellness",
        cta: "Know More",
        href: "/product/wellness-spices-2",
      },
      {
        id: "wellness-pastes",
        image: prodPastes,
        title: "Organic Paste Mix",
        blurb: "Natural pastes for wholesome meals",
        cta: "Know More",
        href: "/product/wellness-pastes",
      },
    ];

    // Use categories if available
    const finalProductItems =
      brandCategories.length > 0
        ? brandCategories.map((cat) => ({
          id: cat.id || cat.categoryId,
            image: cat.image || "",
            title: cat.title || "",
            blurb: cat.subtitle || "",
          cta: "Know More",
            href:
              cat.href ||
              `/products?brand=${brandId}&category=${cat.chip || cat.id}`,
        }))
      : productItems;

    // Create brand page structure from Wellness.jsx
    const brandPageData = {
      brandId: brandId,
      brandName: brand.name,
      enabled: true,
      order: 0,
      
      hero: {
        backgroundImage1: br1,
        backgroundImage2: br2,
        title: "Nurturing Wellness, One Product at a Time",
        titleLine2: "",
        leadText:
          "Wellness by UBC brings you products designed for your health and vitality, crafted with care, quality, and your well-being in mind.",
        ctaText: "Explore Products",
        ctaLink: `/products?brand=${brandId}`,
      },
      
      about: {
        eyebrow: `★ About ${brand.name}`,
        title: "Nurturing Wellness.",
        paragraphs: [
          "Wellness is more than a brand — it's a commitment to your health.",
          "Created with UBC's dedication to quality and purity, Wellness products are thoughtfully designed to support your active lifestyle and nutritional needs.",
        ],
      },
      
      standFor: {
        eyebrow: "★ What We Stand For",
        title: "From Nature to Nutrition, With Care.",
        paragraphs: [
          "Every Wellness product begins with a promise: natural ingredients, careful processing, and nutritional value.",
          "From wholesome grains and premium spices to health-focused kitchen essentials, every pack reflects our commitment to your wellness and vitality.",
        ],
      },
      
      why: {
        eyebrow: `★ Why ${brand.name}`,
        title: "Because Your Health, Matters Most.",
        paragraphs: [
          "We focus on what nourishes you. No compromises, no shortcuts — only products that support your wellness journey with natural goodness and authentic quality. Carefully crafted, trusted for health.",
        ],
        ctaText: "Explore Our Products",
        ctaLink: `/products?brand=${brandId}`,
      },
      
      products: {
        title: `Explore ${brand.name} Products`,
        items: finalProductItems,
      },
      
      styles: {
        hero: {
          backgroundColor: "#f5f6f8",
          paddingTop: 240,
          paddingBottom: 80,
          minHeight: 1200,
          bgImage1Width: 100,
          bgImage2Width: 80,
          bgImage2Height: 120,
          titleAlign: "center",
          titleFontSize: 68,
          leadTextAlign: "center",
          leadTextFontSize: 18,
          leadTextMaxWidth: 820,
          buttonPadding: "12px 24px",
          buttonFontSize: 16,
        },
        about: {
          backgroundColor: "#f5f6f8",
          paddingTop: 140,
          paddingBottom: 140,
          gridGap: 64,
          eyebrowFontSize: 10,
          eyebrowHeight: 33,
          eyebrowPadding: "0 18px",
          eyebrowMarginBottom: 24,
          titleAlign: "left",
          titleFontSize: 44,
          paragraphAlign: "left",
          paragraphFontSize: 22,
          paragraphLineHeight: 1.25,
          paragraphGap: 16,
        },
        standFor: {
          backgroundColor: "#ffffff",
          paddingTop: 140,
          paddingBottom: 140,
          gridGap: 64,
          eyebrowFontSize: 10,
          eyebrowHeight: 33,
          eyebrowPadding: "0 18px",
          eyebrowMarginBottom: 24,
          titleAlign: "left",
          titleFontSize: 44,
          paragraphAlign: "left",
          paragraphFontSize: 22,
          paragraphLineHeight: 1.25,
          paragraphGap: 16,
        },
        why: {
          backgroundColor: "#f5f6f8",
          paddingTop: 140,
          paddingBottom: 140,
          gridGap: 64,
          eyebrowFontSize: 10,
          eyebrowHeight: 33,
          eyebrowPadding: "0 18px",
          eyebrowMarginBottom: 24,
          titleAlign: "left",
          titleFontSize: 44,
          paragraphAlign: "left",
          paragraphFontSize: 22,
          paragraphLineHeight: 1.25,
          paragraphGap: 16,
          buttonPadding: "12px 24px",
          buttonFontSize: 16,
          buttonBgColor: "#323790",
          buttonTextColor: "#FFFFFF",
        },
        products: {
          backgroundColor: "#f5f6f8",
          paddingTop: 140,
          paddingBottom: 140,
          titleAlign: "left",
          titleFontSize: 44,
          cardGap: 24,
          imageWidth: "100%",
          imageHeight: "auto",
          imageBorderRadius: 8,
          productTitleFontSize: 20,
          productBlurbFontSize: 14,
          ctaFontSize: 14,
        },
      },
    };

    // Save to Firebase
    await addBrandPage(brandPageData);

    return {
      success: true,
      message: `Brand page for "${brand.name}" imported successfully!`,
      data: brandPageData,
    };
  } catch (error) {
    console.error("Error importing wellness brand page:", error);
    return {
      success: false,
      message: `Failed to import brand page: ${error.message}`,
    };
  }
};

/**
 * Import brand page from the current static Brands.jsx component
 * This extracts the hardcoded data and converts it to CMS format
 * @param {string} brandId - Brand identifier (e.g., "soil-king")
 * @returns {Promise<Object>} Result object with success status and message
 */
export const importBrandPageFromStatic = async (brandId = "soil-king") => {
  try {
    // Check if brand page already exists
    const exists = await brandPageExists(brandId);
    if (exists) {
      return {
        success: false,
        message: `Brand page for "${brandId}" already exists. Please edit the existing page instead.`,
      };
    }

    // Get brand info
    const brands = await getBrands();
    const brand = brands.find(
      (b) => (b.brandId || b.id) === brandId || b.id === brandId
    );
    
    if (!brand) {
      return {
        success: false,
        message: `Brand "${brandId}" not found. Please create the brand in Product Management first.`,
      };
    }

    // Get categories for this brand to populate products section
    const categories = await getCategories();
    const brandCategories = categories.filter((c) => {
      // Match by brandId or by checking if category belongs to this brand
      const categoryBrandId = c.brandId;
      const brandDocId = brand.id;
      return categoryBrandId === brandDocId;
    });

    // Extract product cards from static data (current Brands.jsx structure)
    const productItems = [
      {
        id: "masalas",
        image: prodMasalas,
        title: "Masalas",
        blurb: "Authentic blends for every dish",
        cta: "Know More",
        href: `/products?brand=${brandId}`,
      },
      {
        id: "rice",
        image: prodRice,
        title: "Rice",
        blurb: "Fragrant grains, rich in tradition",
        cta: "Know More",
        href: `/products?brand=${brandId}`,
      },
      {
        id: "appalams",
        image: prodAppalams,
        title: "Appalams & Crisps",
        blurb: "Crispy delights for every meal",
        cta: "Know More",
        href: `/products?brand=${brandId}`,
      },
      {
        id: "atta",
        image: prodAtta,
        title: "Flours & Atta",
        blurb: "Daily staples for wholesome meals",
        cta: "Know More",
        href: `/products?brand=${brandId}`,
      },
    ];

    // If we have categories, use them instead
    const finalProductItems =
      brandCategories.length > 0
        ? brandCategories.map((cat) => ({
          id: cat.id || cat.categoryId,
            image: cat.image || "",
            title: cat.title || "",
            blurb: cat.subtitle || "",
          cta: "Know More",
            href:
              cat.href ||
              `/products?brand=${brandId}&category=${cat.chip || cat.id}`,
        }))
      : productItems;

    // Create brand page structure from static data
    const brandPageData = {
      brandId: brandId,
      brandName: brand.name,
      enabled: true,
      order: 0,
      
      hero: {
        backgroundImage1: br1,
        backgroundImage2: br2,
        title: "Rooted in Goodness, Growing with Trust",
        titleLine2: "",
        leadText:
          "From fertile soils to your family's table, every UBC product carries the richness of nature, crafted with purity, care, and tradition.",
        ctaText: "Explore Products",
        ctaLink: `/products?brand=${brandId}`,
      },
      
      about: {
        eyebrow: "★ About Soil King",
        title: "Rooted in Goodness.",
        paragraphs: [
          "Soil King is more than a brand — it's a bond with the land.",
          "Born from UBC's vision of delivering everyday essentials with honesty and quality, Soil King carries forward the values of purity, nourishment, and care.",
        ],
      },
      
      standFor: {
        eyebrow: "★ What We Stand For",
        title: "From Soil to Shelf, With Sincerity.",
        paragraphs: [
          "Every Soil King product begins with a promise: clean sourcing, careful processing, and sincere effort.",
          "From premium grains and authentic spices to ready-to-use kitchen essentials, every pack reflects our commitment to your family's health and taste.",
        ],
      },
      
      why: {
        eyebrow: "★ Why Soil King",
        title: "Because What's Real, Stays Real.",
        paragraphs: [
          "We never cut corners. No unnecessary additives, no shortcuts — only grains, spices, and essentials that remain true to their natural taste and benefits. Carefully packed, trusted by families.",
        ],
        ctaText: "Explore Our Products",
        ctaLink: `/products?brand=${brandId}`,
      },
      
      products: {
        title: "Explore Soil Kings Products",
        items: finalProductItems,
      },

      dimensions: {
        hero: {
          desktop: getDefaultDimensions("hero", "desktop"),
          tablet: getDefaultDimensions("hero", "tablet"),
          mobile: getDefaultDimensions("hero", "mobile"),
        },
        about: {
          desktop: getDefaultDimensions("about", "desktop"),
          tablet: getDefaultDimensions("about", "tablet"),
          mobile: getDefaultDimensions("about", "mobile"),
        },
        standFor: {
          desktop: getDefaultDimensions("standFor", "desktop"),
          tablet: getDefaultDimensions("standFor", "tablet"),
          mobile: getDefaultDimensions("standFor", "mobile"),
        },
        why: {
          desktop: getDefaultDimensions("why", "desktop"),
          tablet: getDefaultDimensions("why", "tablet"),
          mobile: getDefaultDimensions("why", "mobile"),
        },
        products: {
          desktop: getDefaultDimensions("products", "desktop"),
          tablet: getDefaultDimensions("products", "tablet"),
          mobile: getDefaultDimensions("products", "mobile"),
        },
      },
      
      styles: {
        hero: {
          backgroundColor: "#f5f6f8",
          paddingTop: 240,
          paddingBottom: 80,
          minHeight: 1200,
          bgImage1Width: 100,
          bgImage2Width: 80,
          bgImage2Height: 120,
          titleAlign: "center",
          titleFontSize: 68,
          leadTextAlign: "center",
          leadTextFontSize: 18,
          leadTextMaxWidth: 820,
          buttonPadding: "12px 24px",
          buttonFontSize: 16,
        },
        about: {
          backgroundColor: "#f5f6f8",
          paddingTop: 140,
          paddingBottom: 140,
          gridGap: 64,
          eyebrowFontSize: 10,
          eyebrowHeight: 33,
          eyebrowPadding: "0 18px",
          eyebrowMarginBottom: 24,
          titleAlign: "left",
          titleFontSize: 44,
          paragraphAlign: "left",
          paragraphFontSize: 22,
          paragraphLineHeight: 1.25,
          paragraphGap: 16,
        },
        standFor: {
          backgroundColor: "#ffffff",
          paddingTop: 140,
          paddingBottom: 140,
          gridGap: 64,
          eyebrowFontSize: 10,
          eyebrowHeight: 33,
          eyebrowPadding: "0 18px",
          eyebrowMarginBottom: 24,
          titleAlign: "left",
          titleFontSize: 44,
          paragraphAlign: "left",
          paragraphFontSize: 22,
          paragraphLineHeight: 1.25,
          paragraphGap: 16,
        },
        why: {
          backgroundColor: "#f5f6f8",
          paddingTop: 140,
          paddingBottom: 140,
          gridGap: 64,
          eyebrowFontSize: 10,
          eyebrowHeight: 33,
          eyebrowPadding: "0 18px",
          eyebrowMarginBottom: 24,
          titleAlign: "left",
          titleFontSize: 44,
          paragraphAlign: "left",
          paragraphFontSize: 22,
          paragraphLineHeight: 1.25,
          paragraphGap: 16,
          buttonPadding: "12px 24px",
          buttonFontSize: 16,
          buttonBgColor: "#323790",
          buttonTextColor: "#FFFFFF",
        },
        products: {
          backgroundColor: "#f5f6f8",
          paddingTop: 140,
          paddingBottom: 140,
          titleAlign: "left",
          titleFontSize: 44,
          cardGap: 24,
          imageWidth: "100%",
          imageHeight: "auto",
          imageBorderRadius: 8,
          productTitleFontSize: 20,
          productBlurbFontSize: 14,
          ctaFontSize: 14,
        },
      },
    };

    // Replace "Soil King" with actual brand name in text
    const brandName = brand.name;
    brandPageData.about.eyebrow = `★ About ${brandName}`;
    brandPageData.why.eyebrow = `★ Why ${brandName}`;
    brandPageData.products.title = `Explore ${brandName} Products`;
    
    // Replace "Soil King" in paragraphs
    brandPageData.about.paragraphs = brandPageData.about.paragraphs.map((p) =>
      p.replace(/Soil King/g, brandName)
    );
    brandPageData.standFor.paragraphs = brandPageData.standFor.paragraphs.map(
      (p) => p.replace(/Soil King/g, brandName)
    );
    brandPageData.why.paragraphs = brandPageData.why.paragraphs.map((p) =>
      p.replace(/Soil King/g, brandName)
    );

    // Save to Firebase
    await addBrandPage(brandPageData);

    return {
      success: true,
      message: `Brand page for "${brandName}" imported successfully!`,
      data: brandPageData,
    };
  } catch (error) {
    console.error("Error importing brand page:", error);
    return {
      success: false,
      message: `Failed to import brand page: ${error.message}`,
    };
  }
};

/**
 * Generate a template brand page structure
 * @param {Object} brand - Brand object from brands collection
 * @param {string} templateType - 'standard', 'minimal', or 'blank'
 * @returns {Object} Brand page data structure
 */
export const generateBrandPageTemplate = (brand, templateType = "standard") => {
  const brandId = brand.brandId || brand.id;
  const brandName = brand.name;

  const baseStructure = {
    brandId,
    brandName,
    enabled: true,
    order: 0,
  };

  const defaultDimensions = {
    hero: {
      desktop: getDefaultDimensions("hero", "desktop"),
      tablet: getDefaultDimensions("hero", "tablet"),
      mobile: getDefaultDimensions("hero", "mobile"),
    },
    about: {
      desktop: getDefaultDimensions("about", "desktop"),
      tablet: getDefaultDimensions("about", "tablet"),
      mobile: getDefaultDimensions("about", "mobile"),
    },
    standFor: {
      desktop: getDefaultDimensions("standFor", "desktop"),
      tablet: getDefaultDimensions("standFor", "tablet"),
      mobile: getDefaultDimensions("standFor", "mobile"),
    },
    why: {
      desktop: getDefaultDimensions("why", "desktop"),
      tablet: getDefaultDimensions("why", "tablet"),
      mobile: getDefaultDimensions("why", "mobile"),
    },
    products: {
      desktop: getDefaultDimensions("products", "desktop"),
      tablet: getDefaultDimensions("products", "tablet"),
      mobile: getDefaultDimensions("products", "mobile"),
    },
  };

  if (templateType === "blank") {
    return {
      ...baseStructure,
      hero: {},
      about: {},
      standFor: {},
      why: {},
      products: { title: `Explore ${brandName}\nProducts`, items: [] },
      dimensions: defaultDimensions,
    };
  }

  if (templateType === "minimal") {
    return {
      ...baseStructure,
      hero: {
        backgroundImage1: "",
        backgroundImage2: "",
        title: `${brandName} - Rooted in Goodness`,
        titleLine2: "",
        leadText: `From fertile soils to your family's table, every ${brandName} product carries the richness of nature.`,
        ctaText: "Explore Products",
        ctaLink: `/products?brand=${brandId}`,
      },
      about: {
        eyebrow: `★ About ${brandName}`,
        title: "Rooted in Goodness.",
        paragraphs: [
          `${brandName} is more than a brand — it's a bond with the land.`,
        ],
      },
      standFor: {},
      why: {},
      products: { title: `Explore ${brandName}\nProducts`, items: [] },
      dimensions: defaultDimensions,
      styles: {
        hero: {
          backgroundColor: "#f5f6f8",
          paddingTop: 240,
          paddingBottom: 80,
          minHeight: 1200,
          titleAlign: "center",
          titleFontSize: 68,
          leadTextAlign: "center",
          leadTextFontSize: 18,
          buttonPadding: "12px 24px",
          buttonFontSize: 16,
        },
        about: {
          backgroundColor: "#f5f6f8",
          paddingTop: 140,
          paddingBottom: 140,
          gridGap: 64,
          eyebrowFontSize: 10,
          eyebrowHeight: 33,
          eyebrowPadding: "0 18px",
          eyebrowMarginBottom: 24,
          titleAlign: "left",
          titleFontSize: 44,
          paragraphAlign: "left",
          paragraphFontSize: 22,
          paragraphLineHeight: 1.25,
        },
        standFor: {},
        why: {},
        products: {},
      },
    };
  }

  // Standard template (default)
  return {
    ...baseStructure,
    hero: {
      backgroundImage1: "",
      backgroundImage2: "",
      title: `${brandName} - Rooted in Goodness, Growing with Trust`,
      titleLine2: "",
      leadText: `From fertile soils to your family's table, every ${brandName} product carries the richness of nature, crafted with purity, care, and tradition.`,
      ctaText: "Explore Products",
      ctaLink: `/products?brand=${brandId}`,
    },
    about: {
      eyebrow: `★ About ${brandName}`,
      title: "Rooted in Goodness.",
      paragraphs: [
        `${brandName} is more than a brand — it's a bond with the land.`,
        `Born from UBC's vision of delivering everyday essentials with honesty and quality, ${brandName} carries forward the values of purity, nourishment, and care.`,
      ],
    },
    standFor: {
      eyebrow: "★ What We Stand For",
      title: "From Soil to Shelf, With Sincerity.",
      paragraphs: [
        `Every ${brandName} product begins with a promise: clean sourcing, careful processing, and sincere effort.`,
        "From premium grains and authentic spices to ready-to-use kitchen essentials, every pack reflects our commitment to your family's health and taste.",
      ],
    },
    why: {
      eyebrow: `★ Why ${brandName}`,
      title: "Because What's Real, Stays Real.",
      paragraphs: [
        "We never cut corners. No unnecessary additives, no shortcuts — only grains, spices, and essentials that remain true to their natural taste and benefits. Carefully packed, trusted by families.",
      ],
      ctaText: "Explore Our Products",
      ctaLink: `/products?brand=${brandId}`,
    },
    products: {
      title: `Explore ${brandName}\nProducts`,
      items: [],
    },
    dimensions: defaultDimensions,
    styles: {
      hero: {
        backgroundColor: "#f5f6f8",
        paddingTop: 240,
        paddingBottom: 80,
        minHeight: 1200,
        bgImage1Width: 100,
        bgImage2Width: 80,
        bgImage2Height: 120,
        titleAlign: "center",
        titleFontSize: 68,
        leadTextAlign: "center",
        leadTextFontSize: 18,
        leadTextMaxWidth: 820,
        buttonPadding: "12px 24px",
        buttonFontSize: 16,
      },
      about: {
        backgroundColor: "#f5f6f8",
        paddingTop: 140,
        paddingBottom: 140,
        gridGap: 64,
        eyebrowFontSize: 10,
        eyebrowHeight: 33,
        eyebrowPadding: "0 18px",
        eyebrowMarginBottom: 24,
        titleAlign: "left",
        titleFontSize: 44,
        paragraphAlign: "left",
        paragraphFontSize: 22,
        paragraphLineHeight: 1.25,
        paragraphGap: 16,
      },
      standFor: {
        backgroundColor: "#ffffff",
        paddingTop: 140,
        paddingBottom: 140,
        gridGap: 64,
        eyebrowFontSize: 10,
        eyebrowHeight: 33,
        eyebrowPadding: "0 18px",
        eyebrowMarginBottom: 24,
        titleAlign: "left",
        titleFontSize: 44,
        paragraphAlign: "left",
        paragraphFontSize: 22,
        paragraphLineHeight: 1.25,
        paragraphGap: 16,
      },
      why: {
        backgroundColor: "#f5f6f8",
        paddingTop: 140,
        paddingBottom: 140,
        gridGap: 64,
        eyebrowFontSize: 10,
        eyebrowHeight: 33,
        eyebrowPadding: "0 18px",
        eyebrowMarginBottom: 24,
        titleAlign: "left",
        titleFontSize: 44,
        paragraphAlign: "left",
        paragraphFontSize: 22,
        paragraphLineHeight: 1.25,
        paragraphGap: 16,
        buttonPadding: "12px 24px",
        buttonFontSize: 16,
        buttonBgColor: "#323790",
        buttonTextColor: "#FFFFFF",
      },
      products: {
        backgroundColor: "#f5f6f8",
        paddingTop: 140,
        paddingBottom: 140,
        titleAlign: "left",
        titleFontSize: 44,
        cardGap: 24,
        imageWidth: "100%",
        imageHeight: "auto",
        imageBorderRadius: 8,
        productTitleFontSize: 20,
        productBlurbFontSize: 14,
        ctaFontSize: 14,
      },
    },
  };
};
