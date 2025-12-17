import React, { useMemo } from "react";
import SectionRenderer from "../../../components/DynamicSections/SectionRenderer";
import "../../../pages/Home.css";

/**
 * Live preview component for a single section
 * Renders the section with temporary data for real-time preview
 */
export default function LiveSectionPreview({ sectionData, allSections = [] }) {
  // If we have sectionData, merge it with all sections to show context
  // Replace the matching section with the preview data
  const sectionsToRender = useMemo(() => {
    if (!sectionData) {
      return allSections
        .filter((s) => s.enabled !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    // Create preview section
    const previewSection = {
      ...sectionData,
      enabled: true, // Always show in preview
      id: sectionData.id || "preview-" + Date.now(),
    };

    // If editing existing section, replace it in the list
    if (sectionData.id && allSections.length > 0) {
      return allSections
        .map((s) => (s.id === sectionData.id ? previewSection : s))
        .filter((s) => s.enabled !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    // If new section, add it to the list
    return [...allSections, previewSection]
      .filter((s) => s.enabled !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [sectionData, allSections]);

  return (
    <div className="live-section-preview">
      <main
        className="home"
        style={{
          margin: 0,
          padding: 0,
          minHeight: "auto",
          width: "max-content",
          minWidth: "100%",
          maxWidth: "none",
          overflowX: "visible",
        }}
      >
        {sectionsToRender.length > 0 ? (
          sectionsToRender.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))
        ) : (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#64748b",
              fontSize: "0.875rem",
            }}
          >
            Start editing to see live preview
          </div>
        )}
      </main>
    </div>
  );
}
