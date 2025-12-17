import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import InlineFontEditor from "../../components/BrandPageEditor/InlineFontEditor";
import { renderFontStyling } from "../../components/BrandPageEditor/renderFontStyling";
import LiveContactPreview from "../../components/LiveContactPreview/LiveContactPreview";
import {
  getContactConfig,
  saveContactConfig,
  importContactFromLive,
  hasContactConfig,
} from "../../services/contactService";
import "./ContactManagement.css";

export default function ContactManagement() {
  const [config, setConfig] = useState(null);
  const [originalConfig, setOriginalConfig] = useState(null);
  const [livePreviewData, setLivePreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const existing = await getContactConfig();
      if (existing) {
        // Ensure tellUsSection exists with default formFields if missing
        if (!existing.tellUsSection) {
          existing.tellUsSection = {};
        }
        // Initialize formFields with defaults if missing, null, undefined, or empty
        if (!existing.tellUsSection.formFields || 
            !Array.isArray(existing.tellUsSection.formFields) || 
            existing.tellUsSection.formFields.length === 0) {
          existing.tellUsSection.formFields = [
            {
              name: "firstName",
              label: "First Name",
              type: "text",
              placeholder: "John",
              required: true,
            },
            {
              name: "lastName",
              label: "Last Name",
              type: "text",
              placeholder: "Smith",
              required: true,
            },
            {
              name: "email",
              label: "Email",
              type: "email",
              placeholder: "john@example.com",
              required: true,
            },
            {
              name: "requirement",
              label: "Requirement",
              type: "select",
              defaultValue: "Bulk Orders",
              options: [
                "Bulk Orders",
                "Private Labeling",
                "Partnerships",
                "General Inquiry",
              ],
              required: true,
            },
            {
              name: "message",
              label: "Message",
              type: "textarea",
              placeholder: "Your message here...",
              rows: 5,
              required: false,
            },
          ];
        }
        setConfig(existing);
        setOriginalConfig(JSON.parse(JSON.stringify(existing)));
        setLivePreviewData(existing);
      } else {
        // If no config yet, start with an empty shell – user can import from live site
        const defaultConfig = {
          pageTitle: "Contact Us - UBC | United Brothers Company",
          bannerTagStar: "★",
          bannerTagText: "CONTACT US",
          heading: "Get in touch with us",
          infoPanel: {
            backgroundColor: "#323790",
          },
          infoItems: [],
          locations: [],
          defaultLocationKey: "",
          mapContainer: {
            backgroundColor: "#F5F5F5",
            borderRadius: 12,
            grayscale: true,
          },
          directionsButton: {
            text: "Get Directions",
            backgroundColor: "#323790",
            textColor: "#FFFFFF",
          },
          tellUsSection: {
            tagStar: "★",
            tagText: "TELL US",
            heading: "Tell Us\nWhat You Need",
            description:
              "Whether it's bulk orders, private\nlabeling, or partnerships —\nwe're here to help.",
            backgroundColor: "#000000",
            buttonBackgroundColor: "#323790",
            buttonTextColor: "#FFFFFF",
            submitButtonText: "Submit Form",
            formFields: [
              {
                name: "firstName",
                label: "First Name",
                type: "text",
                placeholder: "Jonh",
                required: true,
              },
              {
                name: "lastName",
                label: "Last Name",
                type: "text",
                placeholder: "Smith",
                required: true,
              },
              {
                name: "email",
                label: "Email",
                type: "email",
                placeholder: "John@gmail.com",
                required: true,
              },
              {
                name: "requirement",
                label: "Requirement",
                type: "select",
                defaultValue: "Bulk Orders",
                options: [
                  "Bulk Orders",
                  "Private Labeling",
                  "Partnerships",
                  "General Inquiry",
                ],
                required: true,
              },
              {
                name: "message",
                label: "Message",
                type: "textarea",
                placeholder: "Your message here...",
                rows: 5,
                required: false,
              },
            ],
          },
        };
        setConfig(defaultConfig);
        setOriginalConfig(JSON.parse(JSON.stringify(defaultConfig)));
        setLivePreviewData(defaultConfig);
      }
    } catch (err) {
      console.error("Error loading contact config:", err);
      setError("Failed to load contact settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (updater) => {
    setConfig((prev) => {
      const base = prev || {};
      const updated = typeof updater === "function" ? updater(base) : updater;
      const newConfig = { ...base, ...updated };
      // Update live preview data
      setLivePreviewData(newConfig);
      return newConfig;
    });
  };

  const handleInfoPanelChange = (field, value) => {
    updateConfig((prev) => ({
      ...prev,
      infoPanel: {
        ...(prev.infoPanel || {}),
        [field]: value,
      },
    }));
  };

  const handleMapContainerChange = (field, value) => {
    updateConfig((prev) => ({
      ...prev,
      mapContainer: {
        ...(prev.mapContainer || {}),
        [field]: value,
      },
    }));
  };

  const handleDirectionsButtonChange = (field, value) => {
    updateConfig((prev) => ({
      ...prev,
      directionsButton: {
        ...(prev.directionsButton || {}),
        [field]: value,
      },
    }));
  };

  const handleInfoItemChange = (index, field, value) => {
    updateConfig((prev) => {
      const items = prev.infoItems || [];
      const next = [...items];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return { ...prev, infoItems: next };
    });
  };

  const handleAddInfoItem = () => {
    updateConfig((prev) => ({
      ...prev,
      infoItems: [
        ...(prev.infoItems || []),
        {
          id: `info-${Date.now()}`,
          type: "location",
          title: "",
          text: "",
          locationKey: "",
        },
      ],
    }));
  };

  const handleDeleteInfoItem = (index) => {
    updateConfig((prev) => {
      const items = prev.infoItems || [];
      return {
        ...prev,
        infoItems: items.filter((_, i) => i !== index),
      };
    });
  };

  const handleLocationChange = (index, field, value) => {
    updateConfig((prev) => {
      const locations = prev.locations || [];
      const next = [...locations];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return { ...prev, locations: next };
    });
  };

  const handleAddLocation = () => {
    updateConfig((prev) => ({
      ...prev,
      locations: [
        ...(prev.locations || []),
        {
          id: `loc-${Date.now()}`,
          key: "",
          name: "",
          address: "",
          mapEmbed: "",
          directionsUrl: "",
        },
      ],
    }));
  };

  const handleDeleteLocation = (index) => {
    updateConfig((prev) => {
      const locations = prev.locations || [];
      return {
        ...prev,
        locations: locations.filter((_, i) => i !== index),
      };
    });
  };

  const handleTellUsChange = (field, value) => {
    updateConfig((prev) => ({
      ...prev,
      tellUsSection: {
        ...(prev.tellUsSection || {}),
        [field]: value,
      },
    }));
  };

  const handleTellUsFormFieldChange = (index, field, value) => {
    updateConfig((prev) => {
      const fields = prev.tellUsSection?.formFields || [];
      const next = [...fields];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return {
        ...prev,
        tellUsSection: {
          ...(prev.tellUsSection || {}),
          formFields: next,
        },
      };
    });
  };

  const handleAddTellUsFormField = () => {
    updateConfig((prev) => ({
      ...prev,
      tellUsSection: {
        ...(prev.tellUsSection || {}),
        formFields: [
          ...(prev.tellUsSection?.formFields || []),
          {
            name: `field-${Date.now()}`,
            label: "",
            type: "text",
            placeholder: "",
            required: true,
          },
        ],
      },
    }));
  };

  const handleDeleteTellUsFormField = (index) => {
    updateConfig((prev) => {
      const fields = prev.tellUsSection?.formFields || [];
      return {
        ...prev,
        tellUsSection: {
          ...(prev.tellUsSection || {}),
          formFields: fields.filter((_, i) => i !== index),
        },
      };
    });
  };

  const hasUnsavedChanges = () => {
    if (!config || !originalConfig) return false;
    return JSON.stringify(config) !== JSON.stringify(originalConfig);
  };

  const handleSave = async () => {
    if (!config) return;
    try {
      setSaving(true);
      setError(null);
      await saveContactConfig(config);
      setOriginalConfig(JSON.parse(JSON.stringify(config)));
      setLivePreviewData(config);
      setSuccess("Contact page settings saved successfully!");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error saving contact config:", err);
      setError("Failed to save contact settings. Please try again.");
      alert("Error saving contact settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalConfig) {
      const confirmReset = window.confirm(
        "Are you sure you want to cancel? All unsaved changes will be lost."
      );
      if (confirmReset) {
        setConfig(JSON.parse(JSON.stringify(originalConfig)));
        setLivePreviewData(JSON.parse(JSON.stringify(originalConfig)));
      }
    }
  };

  const handleImportFromLive = async () => {
    try {
      const exists = await hasContactConfig();
      if (exists) {
        const confirm = window.confirm(
          "A Contact configuration already exists.\n\nImporting from the live site will overwrite many fields.\n\nDo you want to continue?"
        );
        if (!confirm) return;
      }

      setImporting(true);
      setError(null);
      const imported = await importContactFromLive();
      setConfig(imported);
      setOriginalConfig(JSON.parse(JSON.stringify(imported)));
      setLivePreviewData(imported);
      setSuccess("Imported Contact page settings from the live site.");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error importing contact config:", err);
      setError(`Failed to import from live site: ${err.message}`);
      alert(`Error importing from live site: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <AdminLayout currentPage="contact">
      <div className="contact-management">
        <div className="contact-management-header">
          <div>
            <h1 className="admin-heading-1">Contact Page Management</h1>
            <p className="admin-text-sm admin-mt-sm">
              Manage every detail of your Contact page: text, inline font
              styling, images, map embeds, and colors. Dimensions, padding, and
              gaps are fixed for all devices (mobile, tablet, desktop) - only
              text, maps, and colors are editable.
            </p>
            {hasUnsavedChanges() && (
              <div className="unsaved-indicator">
                <span className="unsaved-dot"></span>
                <span className="unsaved-text">You have unsaved changes</span>
              </div>
            )}
          </div>
          <div className="header-actions">
            <button
              onClick={handleImportFromLive}
              className="admin-btn admin-btn-secondary"
              disabled={importing || loading}
            >
              {importing
                ? "⏳ Importing..."
                : "📥 Import from Live Contact Page"}
            </button>
            {hasUnsavedChanges() && (
              <button
                onClick={handleCancel}
                className="admin-btn admin-btn-secondary"
                disabled={saving || loading || !config}
              >
                ❌ Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              className={`admin-btn admin-btn-primary ${
                hasUnsavedChanges() ? "has-changes" : ""
              }`}
              disabled={saving || loading || !config}
            >
              {saving
                ? "💾 Saving..."
                : hasUnsavedChanges()
                ? "💾 Save Changes"
                : "💾 Save Settings"}
            </button>
          </div>
        </div>

        {success && (
          <div className="admin-alert admin-alert-success">
            {success}
            <button
              onClick={() => setSuccess(null)}
              className="admin-btn admin-btn-secondary admin-mt-sm"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="admin-alert admin-alert-error">
            {error}
            <button
              onClick={loadConfig}
              className="admin-btn admin-btn-secondary admin-mt-sm"
            >
              Retry
            </button>
          </div>
        )}

        {loading || !config ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p className="admin-text">Loading contact settings...</p>
          </div>
        ) : (
          <div className="contact-management-split-layout">
            {/* Left Side: Live Preview */}
            <div className="split-preview-panel">
              <div className="preview-header">
                <div>
                  <h2 className="admin-heading-3">Live Preview</h2>
                  <p className="admin-text-sm">
                    See changes in real-time as you edit
                  </p>
                </div>
                <div className="preview-controls">
                  <button
                    onClick={() => setLivePreviewData(config)}
                    className="admin-btn admin-btn-secondary"
                    title="Refresh preview"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
              <div className="split-preview-container">
                <LiveContactPreview previewConfig={livePreviewData || config} />
              </div>
            </div>

            {/* Right Side: Editor */}
            <div className="split-editor-panel">
              <div className="contact-editor admin-card">
                {/* Basic settings */}
                <div className="form-section">
                  <h3 className="section-title">Basic Settings</h3>

                  <div className="form-group">
                    <label className="admin-label">
                      Page Title (Browser Tab)
                    </label>
                    <small className="form-hint">
                      The title that appears in the browser tab when visitors
                      view the Contact page. This is also used for SEO.
                    </small>
                    <input
                      type="text"
                      className="admin-input"
                      value={config.pageTitle || ""}
                      onChange={(e) =>
                        updateConfig({ pageTitle: e.target.value })
                      }
                      placeholder="Contact Us - UBC | United Brothers Company"
                    />
                  </div>
                  <div className="section-save-button">
                    <button
                      onClick={handleSave}
                      className="admin-btn admin-btn-primary"
                      disabled={saving || loading || !config}
                    >
                      {saving ? "💾 Saving..." : "💾 Save Basic Settings"}
                    </button>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="admin-label">Banner Tag Star</label>
                    <div className="form-row">
                      <select
                        className="admin-select"
                        style={{ maxWidth: "180px" }}
                        value={
                          [
                            "★",
                            "☆",
                            "✦",
                            "✧",
                            "✺",
                            "✶",
                            "✸",
                            "❋",
                            "●",
                            "◦",
                            "◆",
                            "◇",
                            "•",
                            "✱",
                            "✳︎",
                            "✴︎",
                          ].includes(config.bannerTagStar)
                            ? config.bannerTagStar
                            : ""
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            updateConfig({ bannerTagStar: val });
                          }
                        }}
                      >
                        <option value="">Custom</option>
                        {/* Stars */}
                        <option value="★">★ (Filled star)</option>
                        <option value="☆">☆ (Outlined star)</option>
                        <option value="✦">✦ (Sharp star)</option>
                        <option value="✧">✧ (Soft star)</option>
                        <option value="✺">✺ (Decorative star)</option>
                        <option value="✶">✶ (Small star)</option>
                        <option value="✸">✸ (Spark star)</option>
                        <option value="❋">❋ (Burst)</option>
                        {/* Dots / bullets */}
                        <option value="●">● (Bullet dot)</option>
                        <option value="◦">◦ (Hollow dot)</option>
                        <option value="•">• (Standard bullet)</option>
                        {/* Diamonds */}
                        <option value="◆">◆ (Filled diamond)</option>
                        <option value="◇">◇ (Outlined diamond)</option>
                        {/* Misc decorative */}
                        <option value="✱">✱ (Asterisk star)</option>
                        <option value="✳︎">✳︎ (Eight-point asterisk)</option>
                        <option value="✴︎">✴︎ (Eight-point star)</option>
                        {/* Arrows */}
                        <option value="➤">➤ (Arrow)</option>
                        <option value="➜">➜ (Arrow)</option>
                        <option value="➣">➣ (Decorative arrow)</option>
                        {/* Circles */}
                        <option value="○">○ (Circle)</option>
                        <option value="◎">◎ (Target circle)</option>
                        {/* Lines / separators */}
                        <option value="─">─ (Line)</option>
                        <option value="━">━ (Bold line)</option>
                        <option value="╋">╋ (Cross)</option>
                      </select>
                      <input
                        type="text"
                        className="admin-input"
                        style={{ flex: 1 }}
                        value={config.bannerTagStar || ""}
                        onChange={(e) =>
                          updateConfig({ bannerTagStar: e.target.value })
                        }
                        placeholder="★"
                      />
                    </div>
                    <small className="form-hint">
                      Pick a star icon from the dropdown or type any custom
                      symbol or emoji. This appears before the banner tag text
                      at the top of the page.
                    </small>
                  </div>
                  <div className="form-group">
                    <label className="admin-label">Banner Tag Text</label>
                    <small className="form-hint">
                      Enter the text that appears in the banner tag at the top
                      of the Contact page (e.g., "CONTACT US").
                    </small>
                    <input
                      type="text"
                      className="admin-input"
                      value={config.bannerTagText || ""}
                      onChange={(e) =>
                        updateConfig({ bannerTagText: e.target.value })
                      }
                      placeholder="CONTACT US"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <InlineFontEditor
                    label="Main Heading (supports inline font formatting)"
                    value={config.heading || ""}
                    onChange={(value) => updateConfig({ heading: value })}
                    placeholder="Get in touch with us"
                    helpText="Use the formatting tools to change font, color, size, or weight for any word or phrase in the heading."
                  />
                </div>

                {/* Heading Font Styling */}
                {renderFontStyling(
                  "heading",
                  "Main Heading",
                  config.styles || {},
                  (field, value) => {
                    const currentStyles = config.styles || {};
                    updateConfig({
                      styles: {
                        ...currentStyles,
                        [field]: value,
                      },
                    });
                  }
                )}

                {/* Info panel settings */}
                <div className="form-section">
                  <h3 className="section-title">
                    Info Panel (Left Column) - Colors Only
                  </h3>
                  <p className="form-hint" style={{ marginBottom: "16px" }}>
                    Dimensions, padding, and gaps are fixed for all devices.
                    Only colors can be edited.
                  </p>

                  <div className="form-group">
                    <label className="admin-label">Background Color</label>
                    <small className="form-hint">
                      Set the background color for the info panel (left column).
                      Use the color picker or enter a hex code.
                    </small>
                    <div className="form-row">
                      <input
                        type="color"
                        className="admin-input"
                        style={{ height: "40px", width: "80px" }}
                        value={config.infoPanel?.backgroundColor || "#323790"}
                        onChange={(e) =>
                          handleInfoPanelChange(
                            "backgroundColor",
                            e.target.value
                          )
                        }
                      />
                      <input
                        type="text"
                        className="admin-input"
                        value={config.infoPanel?.backgroundColor || "#323790"}
                        onChange={(e) =>
                          handleInfoPanelChange(
                            "backgroundColor",
                            e.target.value
                          )
                        }
                        placeholder="#323790"
                      />
                    </div>
                  </div>
                  <div className="section-save-button">
                    <button
                      onClick={handleSave}
                      className="admin-btn admin-btn-primary"
                      disabled={saving || loading || !config}
                    >
                      {saving ? "💾 Saving..." : "💾 Save Info Panel"}
                    </button>
                  </div>

                  <div className="form-section contact-info-items">
                    <div className="section-header">
                      <h4 className="section-subtitle">
                        Info Items (Locations, Email, Phone, etc.)
                      </h4>
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={handleAddInfoItem}
                      >
                        + Add Info Item
                      </button>
                    </div>

                    {(config.infoItems || []).map((item, index) => (
                      <div key={item.id || index} className="array-item-editor">
                        <div className="array-item-header">
                          <h5>
                            Item {index + 1}{" "}
                            {item.type === "location" && item.locationKey
                              ? `(${item.locationKey})`
                              : `(${item.type || "custom"})`}
                          </h5>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            onClick={() => handleDeleteInfoItem(index)}
                          >
                            Delete
                          </button>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label className="admin-label">Type</label>
                            <select
                              className="admin-select"
                              value={item.type || "location"}
                              onChange={(e) =>
                                handleInfoItemChange(
                                  index,
                                  "type",
                                  e.target.value
                                )
                              }
                            >
                              <option value="location">
                                Location (clickable, controls map)
                              </option>
                              <option value="email">Email</option>
                              <option value="phone">Phone</option>
                              <option value="custom">Custom</option>
                            </select>
                          </div>
                          {item.type === "location" && (
                            <div className="form-group">
                              <label className="admin-label">
                                Location Key (must match a location below)
                              </label>
                              <input
                                type="text"
                                className="admin-input"
                                value={item.locationKey || ""}
                                onChange={(e) =>
                                  handleInfoItemChange(
                                    index,
                                    "locationKey",
                                    e.target.value
                                  )
                                }
                                placeholder="corporate, mfg, etc."
                              />
                            </div>
                          )}
                        </div>

                        <div className="form-group">
                          <InlineFontEditor
                            label="Title (inline font formatting supported)"
                            value={item.title || ""}
                            onChange={(value) =>
                              handleInfoItemChange(index, "title", value)
                            }
                            placeholder="Corporate Office / Email / Call us"
                            helpText="Use formatting to style any word or phrase in the title."
                          />
                        </div>

                        <div className="form-group">
                          <InlineFontEditor
                            label="Text (line breaks + inline font formatting)"
                            value={item.text || ""}
                            onChange={(value) =>
                              handleInfoItemChange(index, "text", value)
                            }
                            placeholder="Address or content. Use Enter for new lines."
                            helpText="Press Enter for a new line. You can style any part of the text with the formatting tools."
                          />
                        </div>
                      </div>
                    ))}

                    {(config.infoItems || []).length === 0 && (
                      <div
                        className="form-hint"
                        style={{ padding: "16px", textAlign: "center" }}
                      >
                        No info items yet. Click &quot;+ Add Info Item&quot; to
                        add locations, email, phone, etc.
                      </div>
                    )}
                  </div>
                </div>

                {/* Locations & Map */}
                <div className="form-section">
                  <h3 className="section-title">Locations & Map</h3>

                  <div className="form-group">
                    <label className="admin-label">Default Location Key</label>
                    <small className="form-hint">
                      Enter the key of the location that should be displayed by
                      default when the Contact page loads. This must match one
                      of the location keys defined below.
                    </small>
                    <input
                      type="text"
                      className="admin-input"
                      value={config.defaultLocationKey || ""}
                      onChange={(e) =>
                        updateConfig({ defaultLocationKey: e.target.value })
                      }
                      placeholder="corporate"
                    />
                  </div>

                  <div className="form-section contact-locations">
                    <div className="section-header">
                      <h4 className="section-subtitle">Locations</h4>
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={handleAddLocation}
                      >
                        + Add Location
                      </button>
                    </div>

                    {(config.locations || []).map((loc, index) => (
                      <div key={loc.id || index} className="array-item-editor">
                        <div className="array-item-header">
                          <h5>Location {index + 1}</h5>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            onClick={() => handleDeleteLocation(index)}
                          >
                            Delete
                          </button>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label className="admin-label">Key</label>
                            <small className="form-hint">
                              A unique identifier for this location (e.g.,
                              "corporate", "mfg"). This key is used to link info
                              items to locations.
                            </small>
                            <input
                              type="text"
                              className="admin-input"
                              value={loc.key || ""}
                              onChange={(e) =>
                                handleLocationChange(
                                  index,
                                  "key",
                                  e.target.value
                                )
                              }
                              placeholder="corporate, mfg, etc."
                            />
                          </div>
                          <div className="form-group">
                            <label className="admin-label">Name</label>
                            <small className="form-hint">
                              The display name for this location (e.g.,
                              "Corporate Office", "Manufacturing Facility").
                            </small>
                            <input
                              type="text"
                              className="admin-input"
                              value={loc.name || ""}
                              onChange={(e) =>
                                handleLocationChange(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              placeholder="Corporate Office"
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="admin-label">Address</label>
                          <small className="form-hint">
                            Enter the full address for this location. Use line
                            breaks for multi-line addresses.
                          </small>
                          <textarea
                            className="admin-input"
                            rows="3"
                            value={loc.address || ""}
                            onChange={(e) =>
                              handleLocationChange(
                                index,
                                "address",
                                e.target.value
                              )
                            }
                            placeholder="Full address"
                          />
                        </div>

                        <div className="form-group">
                          <label className="admin-label">
                            Google Maps Embed URL
                          </label>
                          <small className="form-hint">
                            Paste the Google Maps embed URL for this location.
                            Get this from Google Maps by clicking "Share" →
                            "Embed a map" → copy the iframe src URL.
                          </small>
                          <textarea
                            className="admin-input"
                            rows="2"
                            value={loc.mapEmbed || ""}
                            onChange={(e) =>
                              handleLocationChange(
                                index,
                                "mapEmbed",
                                e.target.value
                              )
                            }
                            placeholder="https://www.google.com/maps/embed?pb=..."
                          />
                        </div>

                        <div className="form-group">
                          <label className="admin-label">
                            Directions URL (opens in new tab)
                          </label>
                          <small className="form-hint">
                            Enter the Google Maps directions URL. This is the
                            link that opens when users click "Get Directions".
                            Get this from Google Maps by clicking "Directions" →
                            copy the URL.
                          </small>
                          <input
                            type="text"
                            className="admin-input"
                            value={loc.directionsUrl || ""}
                            onChange={(e) =>
                              handleLocationChange(
                                index,
                                "directionsUrl",
                                e.target.value
                              )
                            }
                            placeholder="https://www.google.com/maps/search/?api=1&query=..."
                          />
                        </div>
                      </div>
                    ))}

                    {(config.locations || []).length === 0 && (
                      <div
                        className="form-hint"
                        style={{ padding: "16px", textAlign: "center" }}
                      >
                        No locations defined yet. Add at least one location to
                        show a map on the Contact page.
                      </div>
                    )}
                  </div>

                  <div className="form-section">
                    <h4 className="section-subtitle">
                      Map Container - Colors Only
                    </h4>
                    <p className="form-hint" style={{ marginBottom: "16px" }}>
                      Dimensions are fixed for all devices. Only colors can be
                      edited.
                    </p>

                    <div className="form-group">
                      <label className="admin-label">Background Color</label>
                      <small className="form-hint">
                        Set the background color for the map container. Use the
                        color picker or enter a hex code.
                      </small>
                      <div className="form-row">
                        <input
                          type="color"
                          className="admin-input"
                          style={{ height: "40px", width: "80px" }}
                          value={
                            config.mapContainer?.backgroundColor || "#F5F5F5"
                          }
                          onChange={(e) =>
                            handleMapContainerChange(
                              "backgroundColor",
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="text"
                          className="admin-input"
                          value={
                            config.mapContainer?.backgroundColor || "#F5F5F5"
                          }
                          onChange={(e) =>
                            handleMapContainerChange(
                              "backgroundColor",
                              e.target.value
                            )
                          }
                          placeholder="#F5F5F5"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="admin-label">
                        <input
                          type="checkbox"
                          className="admin-checkbox"
                          checked={config.mapContainer?.grayscale !== false}
                          onChange={(e) =>
                            handleMapContainerChange(
                              "grayscale",
                              e.target.checked
                            )
                          }
                        />
                        <span>Apply grayscale filter to map</span>
                      </label>
                      <small className="form-hint">
                        When enabled, the map will be displayed in grayscale
                        (black and white) for a more subtle appearance.
                      </small>
                    </div>
                  </div>

                  <div className="form-section">
                    <h4 className="section-subtitle">Get Directions Button</h4>

                    <div className="form-group">
                      <label className="admin-label">Button Text</label>
                      <small className="form-hint">
                        The text displayed on the "Get Directions" button that
                        appears below the map.
                      </small>
                      <input
                        type="text"
                        className="admin-input"
                        value={config.directionsButton?.text || ""}
                        onChange={(e) =>
                          handleDirectionsButtonChange("text", e.target.value)
                        }
                        placeholder="Get Directions"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="admin-label">Background Color</label>
                        <small className="form-hint">
                          Set the background color for the directions button.
                          Use the color picker or enter a hex code.
                        </small>
                        <div className="form-row">
                          <input
                            type="color"
                            className="admin-input"
                            style={{ height: "40px", width: "80px" }}
                            value={
                              config.directionsButton?.backgroundColor ||
                              "#323790"
                            }
                            onChange={(e) =>
                              handleDirectionsButtonChange(
                                "backgroundColor",
                                e.target.value
                              )
                            }
                          />
                          <input
                            type="text"
                            className="admin-input"
                            value={
                              config.directionsButton?.backgroundColor ||
                              "#323790"
                            }
                            onChange={(e) =>
                              handleDirectionsButtonChange(
                                "backgroundColor",
                                e.target.value
                              )
                            }
                            placeholder="#323790"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="admin-label">Text Color</label>
                        <small className="form-hint">
                          Set the text color for the directions button. Use the
                          color picker or enter a hex code.
                        </small>
                        <div className="form-row">
                          <input
                            type="color"
                            className="admin-input"
                            style={{ height: "40px", width: "80px" }}
                            value={
                              config.directionsButton?.textColor || "#FFFFFF"
                            }
                            onChange={(e) =>
                              handleDirectionsButtonChange(
                                "textColor",
                                e.target.value
                              )
                            }
                          />
                          <input
                            type="text"
                            className="admin-input"
                            value={
                              config.directionsButton?.textColor || "#FFFFFF"
                            }
                            onChange={(e) =>
                              handleDirectionsButtonChange(
                                "textColor",
                                e.target.value
                              )
                            }
                            placeholder="#FFFFFF"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="section-save-button">
                    <button
                      onClick={handleSave}
                      className="admin-btn admin-btn-primary"
                      disabled={saving || loading || !config}
                    >
                      {saving ? "💾 Saving..." : "💾 Save Locations & Map"}
                    </button>
                  </div>
                </div>

                {/* Tell Us Form Section */}
                <div className="form-section">
                  <h3 className="section-title">Tell Us Form Section</h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="admin-label">Tag Star</label>
                      <div className="form-row">
                        <select
                          className="admin-select"
                          style={{ maxWidth: "180px" }}
                          value={
                            [
                              "★",
                              "☆",
                              "✦",
                              "✧",
                              "✺",
                              "✶",
                              "✸",
                              "❋",
                              "●",
                              "◦",
                              "◆",
                              "◇",
                              "•",
                              "✱",
                              "✳︎",
                              "✴︎",
                            ].includes(config.tellUsSection?.tagStar)
                              ? config.tellUsSection.tagStar
                              : ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              handleTellUsChange("tagStar", val);
                            }
                          }}
                        >
                          <option value="">Custom</option>
                          <option value="★">★ (Filled star)</option>
                          <option value="☆">☆ (Outlined star)</option>
                          <option value="✦">✦ (Sharp star)</option>
                          <option value="✧">✧ (Soft star)</option>
                          <option value="✺">✺ (Decorative star)</option>
                          <option value="✶">✶ (Small star)</option>
                          <option value="✸">✸ (Spark star)</option>
                          <option value="❋">❋ (Burst)</option>
                          <option value="●">● (Bullet dot)</option>
                          <option value="◦">◦ (Hollow dot)</option>
                          <option value="•">• (Standard bullet)</option>
                          <option value="◆">◆ (Filled diamond)</option>
                          <option value="◇">◇ (Outlined diamond)</option>
                          <option value="✱">✱ (Asterisk star)</option>
                          <option value="✳︎">✳︎ (Eight-point asterisk)</option>
                          <option value="✴︎">✴︎ (Eight-point star)</option>
                          <option value="➤">➤ (Arrow)</option>
                          <option value="➜">➜ (Arrow)</option>
                          <option value="➣">➣ (Decorative arrow)</option>
                          <option value="○">○ (Circle)</option>
                          <option value="◎">◎ (Target circle)</option>
                          <option value="─">─ (Line)</option>
                          <option value="━">━ (Bold line)</option>
                          <option value="╋">╋ (Cross)</option>
                        </select>
                        <input
                          type="text"
                          className="admin-input"
                          style={{ flex: 1 }}
                          value={config.tellUsSection?.tagStar || ""}
                          onChange={(e) =>
                            handleTellUsChange("tagStar", e.target.value)
                          }
                          placeholder="★"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="admin-label">Tag Text</label>
                      <small className="form-hint">
                        Enter the text that appears in the tag/badge above the
                        "Tell Us" section heading (e.g., "TELL US").
                      </small>
                      <input
                        type="text"
                        className="admin-input"
                        value={config.tellUsSection?.tagText || ""}
                        onChange={(e) =>
                          handleTellUsChange("tagText", e.target.value)
                        }
                        placeholder="TELL US"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <InlineFontEditor
                      label="Heading (use \\n for line breaks)"
                      value={config.tellUsSection?.heading || ""}
                      onChange={(value) => handleTellUsChange("heading", value)}
                      placeholder="Tell Us\nWhat You Need"
                      helpText="Use \\n for line breaks and formatting tools to style any word or phrase."
                    />
                  </div>

                  <div className="form-group">
                    <InlineFontEditor
                      label="Description (use \\n for line breaks)"
                      value={config.tellUsSection?.description || ""}
                      onChange={(value) =>
                        handleTellUsChange("description", value)
                      }
                      placeholder="Whether it's bulk orders, private\nlabeling, or partnerships —\nwe're here to help."
                      helpText="Use \\n for line breaks and formatting tools to style any word or phrase."
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-label">
                      Section Background Color
                    </label>
                    <small className="form-hint">
                      Set the background color for the entire "Tell Us" section.
                      Use the color picker or enter a hex code.
                    </small>
                    <div className="form-row">
                      <input
                        type="color"
                        className="admin-input"
                        style={{ height: "40px", width: "80px" }}
                        value={
                          config.tellUsSection?.backgroundColor || "#000000"
                        }
                        onChange={(e) =>
                          handleTellUsChange("backgroundColor", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        className="admin-input"
                        value={
                          config.tellUsSection?.backgroundColor || "#000000"
                        }
                        onChange={(e) =>
                          handleTellUsChange("backgroundColor", e.target.value)
                        }
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="admin-label">
                        Button Background Color
                      </label>
                      <div className="form-row">
                        <input
                          type="color"
                          className="admin-input"
                          style={{ height: "40px", width: "80px" }}
                          value={
                            config.tellUsSection?.buttonBackgroundColor ||
                            "#323790"
                          }
                          onChange={(e) =>
                            handleTellUsChange(
                              "buttonBackgroundColor",
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="text"
                          className="admin-input"
                          value={
                            config.tellUsSection?.buttonBackgroundColor ||
                            "#323790"
                          }
                          onChange={(e) =>
                            handleTellUsChange(
                              "buttonBackgroundColor",
                              e.target.value
                            )
                          }
                          placeholder="#323790"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="admin-label">Button Text Color</label>
                      <small className="form-hint">
                        Set the text color for the submit button in the "Tell
                        Us" form. Use the color picker or enter a hex code.
                      </small>
                      <div className="form-row">
                        <input
                          type="color"
                          className="admin-input"
                          style={{ height: "40px", width: "80px" }}
                          value={
                            config.tellUsSection?.buttonTextColor || "#FFFFFF"
                          }
                          onChange={(e) =>
                            handleTellUsChange(
                              "buttonTextColor",
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="text"
                          className="admin-input"
                          value={
                            config.tellUsSection?.buttonTextColor || "#FFFFFF"
                          }
                          onChange={(e) =>
                            handleTellUsChange(
                              "buttonTextColor",
                              e.target.value
                            )
                          }
                          placeholder="#FFFFFF"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="admin-label">Submit Button Text</label>
                    <small className="form-hint">
                      The text displayed on the submit button in the "Tell Us"
                      contact form.
                    </small>
                    <input
                      type="text"
                      className="admin-input"
                      value={config.tellUsSection?.submitButtonText || ""}
                      onChange={(e) =>
                        handleTellUsChange("submitButtonText", e.target.value)
                      }
                      placeholder="Submit Form"
                    />
                  </div>

                  <div className="form-section tell-us-form-fields-section">
                    <div className="section-header">
                      <div>
                        <h4 className="section-subtitle">Form Fields</h4>
                        <small className="form-hint" style={{ marginTop: "4px", display: "block" }}>
                          Manage the form fields that appear in the "Tell Us" contact form. 
                          {config.tellUsSection?.formFields?.length > 0 
                            ? ` Currently ${config.tellUsSection.formFields.length} field${config.tellUsSection.formFields.length !== 1 ? 's' : ''} configured.`
                            : " No fields configured yet. Click '+ Add Field' to get started."}
                        </small>
                      </div>
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={handleAddTellUsFormField}
                        style={{ alignSelf: "flex-start" }}
                      >
                        + Add Field
                      </button>
                    </div>

                    {config?.tellUsSection?.formFields && Array.isArray(config.tellUsSection.formFields) && config.tellUsSection.formFields.length > 0 ? (
                      <div className="form-fields-list">
                        {config.tellUsSection.formFields.map(
                          (field, index) => (
                        <div key={index} className="array-item-editor">
                          <div className="array-item-header">
                            <h5>
                              Field {index + 1} ({field.type || "text"})
                            </h5>
                            <button
                              type="button"
                              className="admin-btn admin-btn-danger"
                              onClick={() => handleDeleteTellUsFormField(index)}
                            >
                              Delete
                            </button>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label className="admin-label">Field Name</label>
                              <small className="form-hint">
                                A unique identifier for this field (e.g.,
                                "firstName", "email"). Used internally for form
                                processing.
                              </small>
                              <input
                                type="text"
                                className="admin-input"
                                value={field.name || ""}
                                onChange={(e) =>
                                  handleTellUsFormFieldChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                placeholder="firstName"
                              />
                            </div>
                            <div className="form-group">
                              <label className="admin-label">Field Type</label>
                              <small className="form-hint">
                                Select the input type for this form field.
                                Different types provide appropriate validation
                                and UI.
                              </small>
                              <select
                                className="admin-select"
                                value={field.type || "text"}
                                onChange={(e) =>
                                  handleTellUsFormFieldChange(
                                    index,
                                    "type",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="text">Text</option>
                                <option value="email">Email</option>
                                <option value="tel">Phone</option>
                                <option value="select">
                                  Select (Dropdown)
                                </option>
                                <option value="textarea">Textarea</option>
                              </select>
                            </div>
                          </div>

                          <div className="form-group">
                            <label className="admin-label">Label</label>
                            <small className="form-hint">
                              The label text that appears above this form field
                              (e.g., "First Name", "Email Address").
                            </small>
                            <input
                              type="text"
                              className="admin-input"
                              value={field.label || ""}
                              onChange={(e) =>
                                handleTellUsFormFieldChange(
                                  index,
                                  "label",
                                  e.target.value
                                )
                              }
                              placeholder="First Name"
                            />
                          </div>

                          <div className="form-group">
                            <label className="admin-label">Placeholder</label>
                            <small className="form-hint">
                              The placeholder text that appears inside the input
                              field when it's empty (e.g., "John",
                              "john@example.com").
                            </small>
                            <input
                              type="text"
                              className="admin-input"
                              value={field.placeholder || ""}
                              onChange={(e) =>
                                handleTellUsFormFieldChange(
                                  index,
                                  "placeholder",
                                  e.target.value
                                )
                              }
                              placeholder="Jonh"
                            />
                          </div>

                          {field.type === "select" && (
                            <div className="form-group options-container">
                              <label className="admin-label">
                                Options (one per line) <span className="required">*</span>
                              </label>
                              <div className="options-container-wrapper">
                                <textarea
                                  className="admin-input options-textarea"
                                  rows="10"
                                  value={field.optionsRawText !== undefined ? field.optionsRawText : (field.options || []).join("\n")}
                                  onChange={(e) => {
                                    const rawText = e.target.value;
                                    // Store raw text for editing
                                    handleTellUsFormFieldChange(
                                      index,
                                      "optionsRawText",
                                      rawText
                                    );
                                    // Process options (filter empty lines) for storage
                                    const options = rawText
                                      .split("\n")
                                      .map((opt) => opt.trim())
                                      .filter(Boolean);
                                    handleTellUsFormFieldChange(
                                      index,
                                      "options",
                                      options
                                    );
                                  }}
                                  onKeyDown={(e) => {
                                    // Allow Enter key to work normally
                                    if (e.key === "Enter") {
                                      // Let the default behavior happen
                                      return;
                                    }
                                  }}
                                  placeholder="Traders and Distributors
Partnership
General Enquiry
Add as many options as you need..."
                                />
                                {(field.options || []).length > 0 && (
                                  <div className="options-preview">
                                    <div className="options-preview-header">
                                      <span className="options-preview-icon">👁️</span>
                                      <span className="options-preview-title">Preview ({field.options.length} option{field.options.length !== 1 ? 's' : ''})</span>
                                    </div>
                                    <div className="options-preview-list">
                                      {field.options.map((opt, optIndex) => (
                                        <div key={optIndex} className="options-preview-item">
                                          <span className="options-preview-number">{optIndex + 1}</span>
                                          <span className="options-preview-text">{opt || '(empty)'}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <small className="form-hint">
                                <strong>Instructions:</strong> Enter each dropdown option on a separate line. 
                                Each line will become a selectable option in the dropdown menu. 
                                Empty lines will be ignored. <strong>There is no limit</strong> - you can add as many options as needed. 
                                The textarea is resizable (drag the bottom-right corner) and scrollable. 
                                The preview above shows how your options will appear.
                              </small>
                            </div>
                          )}

                          {field.type === "select" && (
                            <div className="form-group">
                              <label className="admin-label">
                                Default Value
                              </label>
                              <small className="form-hint">
                                Enter the option that should be pre-selected in
                                the dropdown. Must match one of the options
                                above.
                              </small>
                              <input
                                type="text"
                                className="admin-input"
                                value={field.defaultValue || ""}
                                onChange={(e) =>
                                  handleTellUsFormFieldChange(
                                    index,
                                    "defaultValue",
                                    e.target.value
                                  )
                                }
                                placeholder="Bulk Orders"
                              />
                            </div>
                          )}

                          {field.type === "textarea" && (
                            <div className="form-group">
                              <label className="admin-label">Rows</label>
                              <small className="form-hint">
                                Set the number of visible rows for the textarea
                                field. Users can still scroll if content exceeds
                                this.
                              </small>
                              <input
                                type="number"
                                className="admin-input"
                                value={field.rows || 5}
                                onChange={(e) =>
                                  handleTellUsFormFieldChange(
                                    index,
                                    "rows",
                                    parseInt(e.target.value, 10) || 5
                                  )
                                }
                                placeholder="5"
                              />
                            </div>
                          )}

                          <div className="form-group">
                            <label className="admin-label">
                              <input
                                type="checkbox"
                                className="admin-checkbox"
                                checked={field.required !== false}
                                onChange={(e) =>
                                  handleTellUsFormFieldChange(
                                    index,
                                    "required",
                                    e.target.checked
                                  )
                                }
                              />
                              <span>Required field</span>
                            </label>
                            <small className="form-hint">
                              When checked, users must fill this field before
                              submitting the form. Required fields are marked
                              with an asterisk.
                            </small>
                          </div>
                        </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-form-fields-message">
                        <div className="empty-state-icon">📝</div>
                        <h5>No Form Fields Yet</h5>
                        <p>Start building your contact form by adding form fields.</p>
                        <button
                          type="button"
                          className="admin-btn admin-btn-primary"
                          onClick={handleAddTellUsFormField}
                          style={{ marginTop: "12px" }}
                        >
                          + Add Your First Field
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="section-save-button">
                    <button
                      onClick={handleSave}
                      className="admin-btn admin-btn-primary"
                      disabled={saving || loading || !config}
                    >
                      {saving ? "💾 Saving..." : "💾 Save Tell Us Section"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
