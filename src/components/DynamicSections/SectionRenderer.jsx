import React from "react";
import HeroSection from "./HeroSection";
import TextImageSection from "./TextImageSection";
import FeatureCardsSection from "./FeatureCardsSection";
import CarouselSection from "./CarouselSection";
import OverviewSection from "./OverviewSection";
import TestimonialsSection from "./TestimonialsSection";
import TellUsSection from "./TellUsSection";
import CategoriesSection from "./CategoriesSection";
import "./DynamicSections.css";

export default function SectionRenderer({ section }) {
  if (!section || !section.enabled) {
    return null;
  }

  const { type, content, styles, dimensions } = section;

  // Render dynamic sections based on type
  switch (type) {
    case "hero":
      return <HeroSection content={content} styles={styles} />;

    case "text-image":
      return <TextImageSection content={content} styles={styles} />;

    case "feature-cards":
      return <FeatureCardsSection content={content} styles={styles} />;

    case "carousel":
      return (
        <CarouselSection
          content={content}
          styles={styles}
          dimensions={dimensions}
        />
      );

    case "categories":
      return <CategoriesSection content={content} styles={styles} />;

    case "overview":
      return <OverviewSection content={content} styles={styles} />;

    case "testimonials":
      return <TestimonialsSection content={content} styles={styles} />;

    case "tell-us":
      return <TellUsSection content={content} styles={styles} />;

    default:
      // Unknown type, don't render anything
      console.warn(`Unknown section type: ${type}`);
      return null;
  }
}
