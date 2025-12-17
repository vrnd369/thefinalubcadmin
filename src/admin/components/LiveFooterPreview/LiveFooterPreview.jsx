import React, { useMemo } from "react";
import DynamicFooter from "../../../components/DynamicFooter";
import "../../../components/Footer.css";

/**
 * Live preview component for footer
 * Renders the footer with temporary data for real-time preview
 */
export default function LiveFooterPreview({ footerData }) {
  const footerToRender = useMemo(() => {
    if (!footerData) {
      return null;
    }
    return footerData;
  }, [footerData]);

  if (!footerToRender) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "#64748b",
          fontSize: "0.875rem",
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Start editing to see live preview
      </div>
    );
  }

  return (
    <div
      className="footer-preview-wrapper"
      style={{
        margin: 0,
        padding: 0,
        minHeight: "auto",
        width: "100%",
        overflowX: "auto",
        overflowY: "auto",
      }}
    >
      <DynamicFooter footerData={footerToRender} previewMode={true} />
    </div>
  );
}
