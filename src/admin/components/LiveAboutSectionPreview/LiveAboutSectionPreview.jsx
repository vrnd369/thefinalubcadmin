import React, { useMemo } from "react";
import DynamicAbout from "../../../components/DynamicAbout";
import "../../../pages/About.css";

/**
 * Live preview component for About sections
 * Renders the section with temporary data for real-time preview
 */
export default function LiveAboutSectionPreview({
  sectionData,
  allSections = [],
}) {
  // Merge preview section with all sections
  const sectionsToRender = useMemo(() => {
    if (!sectionData) {
      return allSections
        .filter((s) => s.enabled !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    // Debug logging
    if (sectionData.type === "news") {
      console.log("LiveAboutSectionPreview - News section data:", {
        id: sectionData.id,
        type: sectionData.type,
        hasContent: !!sectionData.content,
        hasNews: !!sectionData.content?.news,
        newsCount: sectionData.content?.news?.length || 0,
        newsItems: sectionData.content?.news?.map((n, i) => ({
          index: i,
          title: n.title,
          hasImage: !!n.image,
        })),
      });
    }

    // Create preview section with STABLE ID - use sectionData.id if it exists
    // This prevents image flickering by keeping the same ID for the same section
    const previewSection = {
      ...sectionData,
      enabled: true,
      // Keep the same ID if editing existing section, only generate new ID for new sections
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
    <main
      className="about-page"
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
        <DynamicAbout sections={sectionsToRender} previewMode={true} />
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
  );
}
