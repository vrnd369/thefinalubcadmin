import React from "react";
import ImageSelector from "../ImageSelector/ImageSelector";
import { renderFontStyling } from "./renderFontStyling";

/**
 * Reusable component to render styling controls for About/StandFor/Why sections
 */
export const renderSectionStyling = (
  sectionName,
  sectionLabel,
  styles,
  handleStyleChange,
  handleSectionStyleChange,
  defaultBgColor = "#f5f6f8"
) => {
  return (
    <div
      className="form-section"
      style={{
        marginTop: "24px",
        padding: "20px",
        background: "#f8fafc",
        borderRadius: "8px",
      }}
    >
      <h4
        className="section-subtitle"
        style={{ fontSize: "16px", marginBottom: "16px" }}
      >
        {sectionLabel} Section Styling & Dimensions
      </h4>

      <div className="form-group">
        <label className="admin-label">Section Background Color</label>
        <div className="form-row">
          <input
            type="color"
            value={styles?.[sectionName]?.backgroundColor || defaultBgColor}
            onChange={(e) =>
              handleStyleChange(sectionName, "backgroundColor", e.target.value)
            }
            style={{ height: "40px", width: "80px", cursor: "pointer" }}
          />
          <input
            type="text"
            value={styles?.[sectionName]?.backgroundColor || defaultBgColor}
            onChange={(e) =>
              handleStyleChange(sectionName, "backgroundColor", e.target.value)
            }
            className="admin-input"
            placeholder={defaultBgColor}
            style={{ flex: 1 }}
          />
        </div>
      </div>

      <div className="form-group" style={{ marginTop: "16px" }}>
        <label className="admin-label">Section Background Image</label>
        <ImageSelector
          value={styles?.[sectionName]?.backgroundImage || ""}
          onChange={(url) =>
            handleSectionStyleChange(sectionName, "backgroundImage", url)
          }
        />
        {styles?.[sectionName]?.backgroundImage && (
          <button
            type="button"
            onClick={() =>
              handleSectionStyleChange(sectionName, "backgroundImage", "")
            }
            className="admin-btn admin-btn-secondary"
            style={{ marginTop: "8px", fontSize: "12px", padding: "4px 8px" }}
          >
            Remove Background Image
          </button>
        )}
      </div>

      {styles?.[sectionName]?.backgroundImage && (
        <>
          <div className="form-row" style={{ marginTop: "16px" }}>
            <div className="form-group">
              <label className="admin-label">Background Size</label>
              <select
                value={styles?.[sectionName]?.backgroundSize || "cover"}
                onChange={(e) =>
                  handleSectionStyleChange(
                    sectionName,
                    "backgroundSize",
                    e.target.value
                  )
                }
                className="admin-select"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="auto">Auto</option>
                <option value="100%">100%</option>
              </select>
            </div>
            <div className="form-group">
              <label className="admin-label">Background Position</label>
              <select
                value={
                  styles?.[sectionName]?.backgroundPosition || "center center"
                }
                onChange={(e) =>
                  handleSectionStyleChange(
                    sectionName,
                    "backgroundPosition",
                    e.target.value
                  )
                }
                className="admin-select"
              >
                <option value="center center">Center</option>
                <option value="top left">Top Left</option>
                <option value="top center">Top Center</option>
                <option value="top right">Top Right</option>
                <option value="center left">Center Left</option>
                <option value="center right">Center Right</option>
                <option value="bottom left">Bottom Left</option>
                <option value="bottom center">Bottom Center</option>
                <option value="bottom right">Bottom Right</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="admin-label">Background Repeat</label>
            <select
              value={styles?.[sectionName]?.backgroundRepeat || "no-repeat"}
              onChange={(e) =>
                handleSectionStyleChange(
                  sectionName,
                  "backgroundRepeat",
                  e.target.value
                )
              }
              className="admin-select"
            >
              <option value="no-repeat">No Repeat</option>
              <option value="repeat">Repeat</option>
              <option value="repeat-x">Repeat X</option>
              <option value="repeat-y">Repeat Y</option>
            </select>
          </div>
        </>
      )}

      <div className="form-row">
        <div className="form-group">
          <label className="admin-label">Section Padding Top (px)</label>
          <input
            type="number"
            value={styles?.[sectionName]?.paddingTop || ""}
            onChange={(e) =>
              handleStyleChange(
                sectionName,
                "paddingTop",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className="admin-input"
            placeholder="140"
          />
        </div>
        <div className="form-group">
          <label className="admin-label">Section Padding Bottom (px)</label>
          <input
            type="number"
            value={styles?.[sectionName]?.paddingBottom || ""}
            onChange={(e) =>
              handleStyleChange(
                sectionName,
                "paddingBottom",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className="admin-input"
            placeholder="140"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="admin-label">Grid Gap (px)</label>
          <input
            type="number"
            value={styles?.[sectionName]?.gridGap || ""}
            onChange={(e) =>
              handleStyleChange(
                sectionName,
                "gridGap",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className="admin-input"
            placeholder="64"
          />
        </div>
      </div>

      <h5
        style={{
          fontSize: "14px",
          marginTop: "20px",
          marginBottom: "12px",
          fontWeight: "600",
        }}
      >
        Eyebrow Styling
      </h5>
      <div className="form-row">
        <div className="form-group">
          <label className="admin-label">Eyebrow Font Size (px)</label>
          <input
            type="number"
            value={styles?.[sectionName]?.eyebrowFontSize || ""}
            onChange={(e) =>
              handleStyleChange(
                sectionName,
                "eyebrowFontSize",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className="admin-input"
            placeholder="10"
          />
        </div>
        <div className="form-group">
          <label className="admin-label">Eyebrow Height (px)</label>
          <input
            type="number"
            value={styles?.[sectionName]?.eyebrowHeight || ""}
            onChange={(e) =>
              handleStyleChange(
                sectionName,
                "eyebrowHeight",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className="admin-input"
            placeholder="33"
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="admin-label">Eyebrow Padding (px)</label>
          <input
            type="text"
            value={styles?.[sectionName]?.eyebrowPadding || ""}
            onChange={(e) =>
              handleStyleChange(sectionName, "eyebrowPadding", e.target.value)
            }
            className="admin-input"
            placeholder="0 18px"
          />
        </div>
        <div className="form-group">
          <label className="admin-label">Eyebrow Margin Bottom (px)</label>
          <input
            type="number"
            value={styles?.[sectionName]?.eyebrowMarginBottom || ""}
            onChange={(e) =>
              handleStyleChange(
                sectionName,
                "eyebrowMarginBottom",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className="admin-input"
            placeholder="24"
          />
        </div>
      </div>
      {renderFontStyling(
        `${sectionName}Eyebrow`,
        "Eyebrow",
        styles,
        (field, value) => handleStyleChange(sectionName, field, value)
      )}

      <h5
        style={{
          fontSize: "14px",
          marginTop: "20px",
          marginBottom: "12px",
          fontWeight: "600",
        }}
      >
        Title Styling
      </h5>
      <div className="form-group">
        <label className="admin-label">Title Text Alignment</label>
        <select
          value={styles?.[sectionName]?.titleAlign || "left"}
          onChange={(e) =>
            handleStyleChange(sectionName, "titleAlign", e.target.value)
          }
          className="admin-select"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="admin-label">Title Font Size (px)</label>
          <input
            type="number"
            value={styles?.[sectionName]?.titleFontSize || ""}
            onChange={(e) =>
              handleStyleChange(
                sectionName,
                "titleFontSize",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className="admin-input"
            placeholder="44"
          />
        </div>
        <div className="form-group">
          <label className="admin-label">Title Width (px)</label>
          <input
            type="number"
            value={styles?.[sectionName]?.titleWidth || ""}
            onChange={(e) =>
              handleStyleChange(
                sectionName,
                "titleWidth",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className="admin-input"
            placeholder="auto"
          />
        </div>
      </div>
      {renderFontStyling(
        `${sectionName}Title`,
        "Title",
        styles,
        (field, value) => handleStyleChange(sectionName, field, value)
      )}

      <h5
        style={{
          fontSize: "14px",
          marginTop: "20px",
          marginBottom: "12px",
          fontWeight: "600",
        }}
      >
        Paragraph Styling
      </h5>
      <div className="form-group">
        <label className="admin-label">Paragraph Text Alignment</label>
        <select
          value={styles?.[sectionName]?.paragraphAlign || "left"}
          onChange={(e) =>
            handleStyleChange(sectionName, "paragraphAlign", e.target.value)
          }
          className="admin-select"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="admin-label">Paragraph Font Size (px)</label>
          <input
            type="number"
            value={styles?.[sectionName]?.paragraphFontSize || ""}
            onChange={(e) =>
              handleStyleChange(
                sectionName,
                "paragraphFontSize",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className="admin-input"
            placeholder="22"
          />
        </div>
        <div className="form-group">
          <label className="admin-label">Paragraph Line Height</label>
          <input
            type="number"
            step="0.1"
            value={styles?.[sectionName]?.paragraphLineHeight || ""}
            onChange={(e) =>
              handleStyleChange(
                sectionName,
                "paragraphLineHeight",
                e.target.value ? parseFloat(e.target.value) : null
              )
            }
            className="admin-input"
            placeholder="1.25"
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="admin-label">Paragraph Width (px)</label>
          <input
            type="number"
            value={styles?.[sectionName]?.paragraphWidth || ""}
            onChange={(e) =>
              handleStyleChange(
                sectionName,
                "paragraphWidth",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className="admin-input"
            placeholder="auto"
          />
        </div>
        <div className="form-group">
          <label className="admin-label">Paragraph Gap (px)</label>
          <input
            type="number"
            value={styles?.[sectionName]?.paragraphGap || ""}
            onChange={(e) =>
              handleStyleChange(
                sectionName,
                "paragraphGap",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className="admin-input"
            placeholder="16"
          />
        </div>
      </div>
      {renderFontStyling(
        `${sectionName}Paragraph`,
        "Paragraph",
        styles,
        (field, value) => handleStyleChange(sectionName, field, value)
      )}
    </div>
  );
};
