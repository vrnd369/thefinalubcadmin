import React, { useState } from "react";
import "./DimensionEditor.css";

/**
 * DimensionEditor - Component for editing device-specific dimensions
 * Supports desktop, tablet, and mobile breakpoints
 * Breakpoints are hardcoded: Desktop (≥1024px), Tablet (768-1023px), Mobile (≤767px)
 */
export default function DimensionEditor({
  section,
  dimensions,
  onChange,
  sectionLabel,
}) {
  const [activeDevice, setActiveDevice] = useState("desktop");
  const [expanded, setExpanded] = useState(false);

  const devices = [
    {
      key: "desktop",
      label: "🖥️ Desktop",
      icon: "🖥️",
    },
    {
      key: "tablet",
      label: "📱 Tablet",
      icon: "📱",
    },
    {
      key: "mobile",
      label: "📱 Mobile",
      icon: "📱",
    },
  ];

  const getDefaultDimensions = (device) => {
    const defaults = {
      desktop: {
        paddingTop:
          section === "hero"
            ? 240
            : section === "products"
            ? 90
            : section === "carousel"
            ? 140
            : 100,
        paddingBottom:
          section === "hero"
            ? 0
            : section === "products"
            ? 90
            : section === "carousel"
            ? 140
            : 100,
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 0,
        marginBottom: 0,
        containerPadding: section === "carousel" ? 24 : 24,
        gap:
          section === "products"
            ? 24
            : section === "carousel"
            ? 24
            : section === "about" || section === "standFor" || section === "why"
            ? 48
            : 0,
        ...(section === "hero" && {
          height: 1077,
          minHeight: 1077,
          maxHeight: 1077,
          titleFontSize: 68,
          leadFontSize: 18,
          leadMaxWidth: 820,
        }),
        ...(section === "about" ||
          section === "standFor" ||
          (section === "why" && {
            gridGap: 48,
            titleFontSize: 44,
            paragraphFontSize: 22,
          })),
        ...(section === "products" && {
          cardWidth: 360,
          cardHeight: 370,
          cardGap: 24,
          imageHeight: 211,
          bodyHeight: 159,
        }),
        ...(section === "carousel" && {
          cardWidth: 736,
          cardHeight: 358,
          cardGap: 24,
          logoWidth: 252,
          logoHeight: 310,
          headingFontSize: 44,
          descriptionFontSize: 18,
          titleFontSize: 28,
          descriptionTextFontSize: 14,
        }),
      },
      tablet: {
        paddingTop:
          section === "hero"
            ? 240
            : section === "products"
            ? 90
            : section === "carousel"
            ? 80
            : 100,
        paddingBottom:
          section === "hero"
            ? 0
            : section === "products"
            ? 90
            : section === "carousel"
            ? 80
            : 100,
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 0,
        marginBottom: 0,
        containerPadding: section === "carousel" ? 32 : 24,
        gap:
          section === "products"
            ? 24
            : section === "carousel"
            ? 20
            : section === "about" || section === "standFor" || section === "why"
            ? 40
            : 0,
        ...(section === "hero" && {
          height: 1077,
          minHeight: 1077,
          maxHeight: 1077,
          titleFontSize: 56,
          leadFontSize: 16,
          leadMaxWidth: 720,
        }),
        ...(section === "about" ||
          section === "standFor" ||
          (section === "why" && {
            gridGap: 40,
            titleFontSize: 40,
            paragraphFontSize: 20,
          })),
        ...(section === "products" && {
          cardWidth: 360,
          cardHeight: 370,
          cardGap: 24,
          imageHeight: 211,
          bodyHeight: 159,
        }),
        ...(section === "carousel" && {
          cardWidth: 680,
          cardHeight: 330,
          cardGap: 20,
          logoWidth: 220,
          logoHeight: 220,
          headingFontSize: 40,
          descriptionFontSize: 17.5,
          titleFontSize: 26,
          descriptionTextFontSize: 13.5,
        }),
      },
      mobile: {
        paddingTop:
          section === "hero"
            ? 180
            : section === "products"
            ? 80
            : section === "carousel"
            ? 56
            : 80,
        paddingBottom:
          section === "hero"
            ? 60
            : section === "products"
            ? 80
            : section === "carousel"
            ? 56
            : 80,
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 0,
        marginBottom: 0,
        containerPadding: section === "carousel" ? 20 : 20,
        gap:
          section === "products"
            ? 20
            : section === "carousel"
            ? 12
            : section === "about" || section === "standFor" || section === "why"
            ? 32
            : 0,
        ...(section === "hero" && {
          height: "auto",
          minHeight: 600,
          maxHeight: "none",
          titleFontSize: 36,
          leadFontSize: 14,
          leadMaxWidth: "100%",
        }),
        ...(section === "about" ||
          section === "standFor" ||
          (section === "why" && {
            gridGap: 32,
            titleFontSize: 36,
            paragraphFontSize: 18,
          })),
        ...(section === "products" && {
          cardWidth: "calc(50% - 10px)",
          cardHeight: "auto",
          minHeight: 340,
          cardGap: 20,
          imageHeight: "auto",
          minImageHeight: 180,
          bodyHeight: "auto",
          minBodyHeight: 120,
        }),
        ...(section === "carousel" && {
          cardWidth: "calc(100vw - 40px)",
          cardHeight: "auto",
          minCardHeight: 200,
          cardGap: 8,
          logoWidth: 140,
          logoHeight: 140,
          headingFontSize: 32,
          descriptionFontSize: 16,
          titleFontSize: 20,
          descriptionTextFontSize: 12,
        }),
      },
    };
    return defaults[device] || {};
  };

  const currentDimensions =
    dimensions?.[activeDevice] || getDefaultDimensions(activeDevice);

  const handleDimensionChange = (field, value) => {
    const numValue =
      value === "" || value === "auto" || value === "none"
        ? value
        : parseFloat(value);
    const updatedDimensions = {
      ...dimensions,
      [activeDevice]: {
        ...currentDimensions,
        [field]: isNaN(numValue) ? value : numValue,
      },
    };
    onChange(updatedDimensions);
  };

  const renderDimensionField = (
    label,
    field,
    type = "number",
    placeholder = "",
    hint = ""
  ) => {
    const value = currentDimensions[field] ?? "";
    const displayValue =
      value === "auto" || value === "none" || value === "calc(50% - 10px)"
        ? value
        : value;

    return (
      <div className="dimension-field">
        <label className="dimension-label">
          {label}
          {hint && <small className="dimension-hint">{hint}</small>}
        </label>
        {type === "number" ? (
          <input
            type="number"
            className="dimension-input"
            value={displayValue}
            onChange={(e) => handleDimensionChange(field, e.target.value)}
            placeholder={placeholder || "0"}
            step={
              field.includes("FontSize") ||
              field.includes("Height") ||
              field.includes("Width")
                ? 1
                : field.includes("Gap") || field.includes("Padding")
                ? 4
                : 1
            }
          />
        ) : (
          <input
            type="text"
            className="dimension-input"
            value={displayValue}
            onChange={(e) => handleDimensionChange(field, e.target.value)}
            placeholder={placeholder || "auto"}
          />
        )}
      </div>
    );
  };

  return (
    <div className="dimension-editor">
      <div
        className="dimension-editor-header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="dimension-editor-title">
          <h4 className="section-title">
            {sectionLabel || section} Dimensions
          </h4>
          <span className="dimension-editor-subtitle">
            Fixed dimensions per device - automatically applied based on screen
            size
          </span>
        </div>
        <button
          type="button"
          className={`dimension-toggle ${expanded ? "expanded" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? "▼" : "▶"}
        </button>
      </div>

      {expanded && (
        <div className="dimension-editor-content">
          {/* Device Selector */}
          <div className="device-selector">
            {devices.map((device) => (
              <button
                key={device.key}
                type="button"
                className={`device-tab ${
                  activeDevice === device.key ? "active" : ""
                }`}
                onClick={() => setActiveDevice(device.key)}
              >
                <span className="device-icon">{device.icon}</span>
                <span className="device-label">
                  {device.label.replace(/^[^\s]+\s/, "")}
                </span>
              </button>
            ))}
          </div>

          {/* Dimension Fields */}
          <div className="dimension-fields">
            <div className="dimension-group">
              <h5 className="dimension-group-title">Padding & Spacing</h5>
              <div className="dimension-row">
                {renderDimensionField(
                  "Padding Top (px)",
                  "paddingTop",
                  "number",
                  "0",
                  "Top padding for this section"
                )}
                {renderDimensionField(
                  "Padding Bottom (px)",
                  "paddingBottom",
                  "number",
                  "0",
                  "Bottom padding for this section"
                )}
              </div>
              <div className="dimension-row">
                {renderDimensionField(
                  "Padding Left (px)",
                  "paddingLeft",
                  "number",
                  "0",
                  "Left padding"
                )}
                {renderDimensionField(
                  "Padding Right (px)",
                  "paddingRight",
                  "number",
                  "0",
                  "Right padding"
                )}
              </div>
              <div className="dimension-row">
                {renderDimensionField(
                  "Container Padding (px)",
                  "containerPadding",
                  "number",
                  "24",
                  "Horizontal padding inside container"
                )}
                {renderDimensionField(
                  "Gap (px)",
                  "gap",
                  "number",
                  "0",
                  "Gap between grid items"
                )}
              </div>
            </div>

            {section === "hero" && (
              <div className="dimension-group">
                <h5 className="dimension-group-title">Hero Section</h5>
                <div className="dimension-row">
                  {renderDimensionField(
                    "Height (px)",
                    "height",
                    "number",
                    "1077",
                    'Fixed height (use "auto" for mobile)'
                  )}
                  {renderDimensionField(
                    "Min Height (px)",
                    "minHeight",
                    "number",
                    "600",
                    "Minimum height"
                  )}
                </div>
                <div className="dimension-row">
                  {renderDimensionField(
                    "Title Font Size (px)",
                    "titleFontSize",
                    "number",
                    "68",
                    "Hero title font size"
                  )}
                  {renderDimensionField(
                    "Lead Font Size (px)",
                    "leadFontSize",
                    "number",
                    "18",
                    "Lead text font size"
                  )}
                </div>
                <div className="dimension-row">
                  {renderDimensionField(
                    "Lead Max Width (px)",
                    "leadMaxWidth",
                    "number",
                    "820",
                    "Maximum width for lead text"
                  )}
                </div>
              </div>
            )}

            {(section === "about" ||
              section === "standFor" ||
              section === "why") && (
              <div className="dimension-group">
                <h5 className="dimension-group-title">Content Section</h5>
                <div className="dimension-row">
                  {renderDimensionField(
                    "Grid Gap (px)",
                    "gridGap",
                    "number",
                    "48",
                    "Gap between grid columns"
                  )}
                  {renderDimensionField(
                    "Title Font Size (px)",
                    "titleFontSize",
                    "number",
                    "44",
                    "Section title font size"
                  )}
                </div>
                <div className="dimension-row">
                  {renderDimensionField(
                    "Paragraph Font Size (px)",
                    "paragraphFontSize",
                    "number",
                    "22",
                    "Paragraph text font size"
                  )}
                </div>
              </div>
            )}

            {section === "products" && (
              <div className="dimension-group">
                <h5 className="dimension-group-title">Product Cards</h5>
                <div className="dimension-row">
                  {renderDimensionField(
                    "Card Width",
                    "cardWidth",
                    "text",
                    "360",
                    "Card width (px or calc)"
                  )}
                  {renderDimensionField(
                    "Card Height",
                    "cardHeight",
                    "text",
                    "370",
                    "Card height (px or auto)"
                  )}
                </div>
                <div className="dimension-row">
                  {renderDimensionField(
                    "Card Gap (px)",
                    "cardGap",
                    "number",
                    "24",
                    "Gap between cards"
                  )}
                  {renderDimensionField(
                    "Image Height",
                    "imageHeight",
                    "text",
                    "211",
                    "Product image height (px or auto)"
                  )}
                </div>
                <div className="dimension-row">
                  {renderDimensionField(
                    "Body Height",
                    "bodyHeight",
                    "text",
                    "159",
                    "Card body height (px or auto)"
                  )}
                  {activeDevice === "mobile" &&
                    renderDimensionField(
                      "Min Image Height (px)",
                      "minImageHeight",
                      "number",
                      "180",
                      "Minimum image height on mobile"
                    )}
                </div>
                {activeDevice === "mobile" && (
                  <div className="dimension-row">
                    {renderDimensionField(
                      "Min Card Height (px)",
                      "minHeight",
                      "number",
                      "340",
                      "Minimum card height on mobile"
                    )}
                    {renderDimensionField(
                      "Min Body Height (px)",
                      "minBodyHeight",
                      "number",
                      "120",
                      "Minimum body height on mobile"
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
