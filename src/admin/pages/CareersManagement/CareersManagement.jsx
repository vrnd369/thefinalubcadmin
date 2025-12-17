import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import InlineFontEditor from "../../components/BrandPageEditor/InlineFontEditor";
import { renderFontStyling } from "../../components/BrandPageEditor/renderFontStyling";
import ImageSelector from "../../components/ImageSelector/ImageSelector";
import LiveCareersPreview from "../../components/LiveCareersPreview/LiveCareersPreview";
import {
  getCareersConfig,
  saveCareersConfig,
  importCareersFromLive,
  hasCareersConfig,
} from "../../services/careersService";
import "./CareersManagement.css";

export default function CareersManagement() {
  const [config, setConfig] = useState(null);
  const [originalConfig, setOriginalConfig] = useState(null); // Track original saved config
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [livePreviewData, setLivePreviewData] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCareersConfig();
      if (data) {
        setConfig(data);
        setOriginalConfig(JSON.parse(JSON.stringify(data))); // Deep copy for comparison
        setLivePreviewData(data);
      } else {
        setConfig({
          pageTitle: "Careers - UBC | United Brothers Company",
          hero: {
            badgeText: "★ Opportunity",
            title: "Life at\nUnited Brothers",
            subtitle:
              "At the United Brothers Company, we are more than just a team; we are a family of innovators, creators, and professionals.",
          },
          whySection: {
            badgeText: "★ Why",
            title: "Why Join Us?",
            cards: [],
          },
          openingsSection: {
            badgeText: "★ Join Us",
            title: "Our Openings",
            jobs: [],
          },
          formSettings: {
            requirementLabel: "Requirement",
            requirementOptions: [
              "Full-time",
              "Part-time",
              "Contract",
              "Internship",
            ],
            submitButtonText: "Submit",
          },
        });
        const defaultConfig = {
          pageTitle: "Careers - UBC | United Brothers Company",
          hero: {
            badgeText: "★ Opportunity",
            title: "Life at\nUnited Brothers",
            subtitle:
              "At the United Brothers Company, we are more than just a team; we are a family of innovators, creators, and professionals.",
          },
          whySection: {
            badgeText: "★ Why",
            title: "Why Join Us?",
            cards: [],
          },
          openingsSection: {
            badgeText: "★ Join Us",
            title: "Our Openings",
            jobs: [],
          },
          formSettings: {
            requirementLabel: "Requirement",
            requirementOptions: [
              "Full-time",
              "Part-time",
              "Contract",
              "Internship",
            ],
            submitButtonText: "Submit",
          },
        };
        setOriginalConfig(JSON.parse(JSON.stringify(defaultConfig))); // Deep copy
        setLivePreviewData({
          pageTitle: "Careers - UBC | United Brothers Company",
          hero: {
            badgeText: "★ Opportunity",
            title: "Life at\nUnited Brothers",
            subtitle:
              "At the United Brothers Company, we are more than just a team; we are a family of innovators, creators, and professionals.",
          },
          whySection: {
            badgeText: "★ Why",
            title: "Why Join Us?",
            cards: [],
          },
          openingsSection: {
            badgeText: "★ Join Us",
            title: "Our Openings",
            jobs: [],
          },
          formSettings: {
            requirementLabel: "Requirement",
            requirementOptions: [
              "Full-time",
              "Part-time",
              "Contract",
              "Internship",
            ],
            submitButtonText: "Submit",
          },
        });
      }
    } catch (err) {
      console.error("Error loading careers config:", err);
      setError("Failed to load careers settings. Please try again.");
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

  const handleHeroChange = (field, value) => {
    updateConfig((prev) => ({
      ...prev,
      hero: {
        ...(prev.hero || {}),
        [field]: value,
      },
    }));
  };

  const handleWhyChange = (field, value) => {
    updateConfig((prev) => ({
      ...prev,
      whySection: {
        ...(prev.whySection || {}),
        [field]: value,
      },
    }));
  };

  const handleWhyCardChange = (index, field, value) => {
    updateConfig((prev) => {
      const cards = prev.whySection?.cards || [];
      const next = [...cards];
      next[index] = { ...next[index], [field]: value };
      return {
        ...prev,
        whySection: {
          ...(prev.whySection || {}),
          cards: next,
        },
      };
    });
  };

  const handleAddWhyCard = () => {
    updateConfig((prev) => ({
      ...prev,
      whySection: {
        ...(prev.whySection || {}),
        cards: [
          ...(prev.whySection?.cards || []),
          {
            id: `why-${Date.now()}`,
            title: "",
            text: "",
            icon: "",
          },
        ],
      },
    }));
  };

  const handleDeleteWhyCard = (index) => {
    updateConfig((prev) => {
      const cards = prev.whySection?.cards || [];
      return {
        ...prev,
        whySection: {
          ...(prev.whySection || {}),
          cards: cards.filter((_, i) => i !== index),
        },
      };
    });
  };

  const handleOpeningsChange = (field, value) => {
    updateConfig((prev) => ({
      ...prev,
      openingsSection: {
        ...(prev.openingsSection || {}),
        [field]: value,
      },
    }));
  };

  const handleJobChange = (index, field, value) => {
    updateConfig((prev) => {
      const jobs = prev.openingsSection?.jobs || [];
      const next = [...jobs];
      next[index] = { ...next[index], [field]: value };
      return {
        ...prev,
        openingsSection: {
          ...(prev.openingsSection || {}),
          jobs: next,
        },
      };
    });
  };

  const handleAddJob = () => {
    updateConfig((prev) => ({
      ...prev,
      openingsSection: {
        ...(prev.openingsSection || {}),
        jobs: [
          ...(prev.openingsSection?.jobs || []),
          {
            id: `job-${Date.now()}`,
            title: "",
            date: "",
            blurb: "",
            description: "",
            enabled: true,
            order: (prev.openingsSection?.jobs || []).length + 1,
          },
        ],
      },
    }));
  };

  const handleDeleteJob = (index) => {
    updateConfig((prev) => {
      const jobs = prev.openingsSection?.jobs || [];
      return {
        ...prev,
        openingsSection: {
          ...(prev.openingsSection || {}),
          jobs: jobs.filter((_, i) => i !== index),
        },
      };
    });
  };

  const handleFormSettingsChange = (field, value) => {
    updateConfig((prev) => ({
      ...prev,
      formSettings: {
        ...(prev.formSettings || {}),
        [field]: value,
      },
    }));
  };

  const handleRequirementOptionsChange = (value) => {
    const options = value
      .split("\n")
      .map((opt) => opt.trim())
      .filter(Boolean);
    handleFormSettingsChange("requirementOptions", options);
  };

  const handleCancel = () => {
    if (originalConfig) {
      const confirmReset = window.confirm(
        "Are you sure you want to cancel? All unsaved changes will be lost."
      );
      if (confirmReset) {
        setConfig(JSON.parse(JSON.stringify(originalConfig))); // Reset to original
        setLivePreviewData(JSON.parse(JSON.stringify(originalConfig)));
      }
    }
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
      await saveCareersConfig(config);
      setOriginalConfig(JSON.parse(JSON.stringify(config))); // Update original after save
      setLivePreviewData(config);
      setSuccess("Careers settings saved successfully!");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error saving careers config:", err);
      setError("Failed to save careers settings. Please try again.");
      alert("Error saving careers settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleImportFromLive = async () => {
    try {
      const exists = await hasCareersConfig();
      if (exists) {
        const confirm = window.confirm(
          "A Careers configuration already exists.\n\nImporting from the live page will overwrite many fields.\n\nDo you want to continue?"
        );
        if (!confirm) return;
      }

      setImporting(true);
      setError(null);
      const imported = await importCareersFromLive();
      setConfig(imported);
      setOriginalConfig(JSON.parse(JSON.stringify(imported))); // Deep copy
      setLivePreviewData(imported);
      setSuccess("Imported Careers page settings from the live page.");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error importing careers config:", err);
      setError(`Failed to import from live page: ${err.message}`);
      alert(`Error importing from live page: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <AdminLayout currentPage="careers">
      <div className="careers-management">
        <div className="careers-management-header">
          <div className="header-content">
            <div className="header-title-section">
              <h1 className="admin-heading-1">Careers Page Management</h1>
              <p className="header-description">
                Manage every detail of your Careers page: hero content, Why Join
                Us, openings, and Join Us form settings.
              </p>
            </div>
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
              title="Import settings from the live Careers page"
            >
              {importing ? (
                <>
                  <span className="spinner-small"></span>
                  Importing...
                </>
              ) : (
                <>
                  <span className="btn-icon">📥</span>
                  Import from Live
                </>
              )}
            </button>
            {hasUnsavedChanges() && (
              <button
                onClick={handleCancel}
                className="admin-btn admin-btn-secondary cancel-btn"
                disabled={saving || loading || !config}
                title="Discard all unsaved changes"
              >
                <span className="btn-icon">❌</span>
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              className={`admin-btn admin-btn-primary save-btn ${
                hasUnsavedChanges() ? "has-changes" : ""
              }`}
              disabled={saving || loading || !config}
              title={
                hasUnsavedChanges()
                  ? "Save your changes"
                  : "Save current settings"
              }
            >
              {saving ? (
                <>
                  <span className="spinner-small"></span>
                  Saving...
                </>
              ) : hasUnsavedChanges() ? (
                <>
                  <span className="btn-icon">💾</span>
                  Update Changes
                </>
              ) : (
                <>
                  <span className="btn-icon">💾</span>
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>

        {success && (
          <div className="careers-success-alert">
            <div className="success-content">
              <span className="success-icon">✅</span>
              <span className="success-message">{success}</span>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="success-close"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="careers-error-alert">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <span className="error-message">{error}</span>
            </div>
            <div className="error-actions">
              <button
                onClick={loadConfig}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                Retry
              </button>
              <button
                onClick={() => setError(null)}
                className="error-close"
                aria-label="Close error"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Sticky Save Bar */}
        {hasUnsavedChanges() && (
          <div className="sticky-save-bar">
            <div className="sticky-save-content">
              <div className="sticky-save-info">
                <span className="sticky-save-icon">💾</span>
                <span className="sticky-save-text">
                  You have unsaved changes
                </span>
              </div>
              <div className="sticky-save-actions">
                <button
                  onClick={handleCancel}
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  disabled={saving || loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="admin-btn admin-btn-primary admin-btn-sm"
                  disabled={saving || loading}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading || !config ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p className="admin-text">Loading careers settings...</p>
          </div>
        ) : (
          <div className="careers-split-layout">
            {/* Live Preview Section - 50% */}
            <div className="careers-preview-section admin-card">
              <div className="preview-header">
                <div className="preview-header-content">
                  <div className="preview-header-icon">👁️</div>
                  <div>
                    <h2 className="admin-heading-3">Live Preview</h2>
                    <p className="preview-description">
                      See how your careers page looks. Changes appear in
                      real-time as you edit.
                    </p>
                  </div>
                </div>
                <div className="preview-controls">
                  <button
                    onClick={() => setLivePreviewData(config)}
                    className="admin-btn admin-btn-secondary preview-refresh-btn"
                    title="Refresh preview"
                  >
                    <span className="btn-icon">🔄</span>
                    Refresh
                  </button>
                </div>
              </div>
              <div className="careers-preview-container">
                <LiveCareersPreview previewConfig={livePreviewData || config} />
              </div>
            </div>

            {/* Edit Console Section - 50% */}
            <div className="careers-editor admin-card">
              {/* Basic / Hero */}
              <div className="form-section">
                <div className="section-header-with-icon">
                  <div className="section-icon">🎯</div>
                  <div>
                    <h3 className="section-title">Hero Section</h3>
                    <p className="section-description">
                      Configure the main hero section that appears at the top of
                      your Careers page
                    </p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="admin-label">
                    Page Title (Browser Tab)
                  </label>
                  <small className="form-hint">
                    The title that appears in the browser tab when visitors view
                    the Careers page. This is also used for SEO.
                  </small>
                  <input
                    type="text"
                    className="admin-input"
                    value={config.pageTitle || ""}
                    onChange={(e) =>
                      updateConfig({ pageTitle: e.target.value })
                    }
                    placeholder="Careers - UBC | United Brothers Company"
                  />
                </div>

                <div className="form-group">
                  <ImageSelector
                    value={config.hero?.backgroundImage || ""}
                    onChange={(url) => handleHeroChange("backgroundImage", url)}
                    label="Hero Background Image"
                  />
                  <small className="form-hint">
                    Upload or select the background image for the hero section.
                    This image appears behind the hero text content. Recommended
                    size: 1920x1080px or larger.
                  </small>
                </div>

                <div className="form-group">
                  <label className="admin-label">Hero Badge Text</label>
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
                          "➤",
                          "➜",
                          "➣",
                          "○",
                          "◎",
                          "─",
                          "━",
                          "╋",
                        ].includes(config.hero?.badgeText?.charAt(0))
                          ? config.hero.badgeText.charAt(0)
                          : ""
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          const currentText = config.hero?.badgeText || "";
                          const restOfText = currentText.substring(1).trim();
                          handleHeroChange(
                            "badgeText",
                            val +
                              (restOfText ? " " + restOfText : " Opportunity")
                          );
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
                      value={config.hero?.badgeText || ""}
                      onChange={(e) =>
                        handleHeroChange("badgeText", e.target.value)
                      }
                      placeholder="★ Opportunity"
                    />
                  </div>
                  <small className="form-hint">
                    Pick a star icon from the dropdown or type any custom symbol
                    or emoji. This badge appears at the top of the hero section.
                  </small>
                </div>

                <div className="form-group">
                  <InlineFontEditor
                    label="Hero Title (supports inline font formatting, use \\n for line breaks)"
                    value={config.hero?.title || ""}
                    onChange={(value) => handleHeroChange("title", value)}
                    placeholder={"Life at\nUnited Brothers"}
                    helpText="Use \\n for line breaks, and formatting tools to style any word or line. This is the main heading of the hero section."
                  />
                </div>

                <div className="form-group">
                  <InlineFontEditor
                    label="Hero Subtitle"
                    value={config.hero?.subtitle || ""}
                    onChange={(value) => handleHeroChange("subtitle", value)}
                    placeholder="At the United Brothers Company, we are more than just a team..."
                    helpText="Supports inline font formatting for emphasising key phrases. This subtitle appears below the hero title."
                  />
                </div>

                {/* Hero Title Font Styling */}
                {renderFontStyling(
                  "heroTitle",
                  "Hero Title",
                  config.hero?.styles || {},
                  (field, value) => {
                    const currentStyles = config.hero?.styles || {};
                    handleHeroChange("styles", {
                      ...currentStyles,
                      [field]: value,
                    });
                  }
                )}

                {/* Hero Subtitle Font Styling */}
                {renderFontStyling(
                  "heroSubtitle",
                  "Hero Subtitle",
                  config.hero?.styles || {},
                  (field, value) => {
                    const currentStyles = config.hero?.styles || {};
                    handleHeroChange("styles", {
                      ...currentStyles,
                      [field]: value,
                    });
                  }
                )}

                {/* Section Save Button */}
                <div className="section-actions">
                  {hasUnsavedChanges() && (
                    <button
                      onClick={handleCancel}
                      className="admin-btn admin-btn-secondary section-cancel-btn"
                      disabled={saving || loading || !config}
                      title="Discard all unsaved changes"
                    >
                      <span className="btn-icon">❌</span>
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    className={`admin-btn admin-btn-primary section-save-btn ${
                      hasUnsavedChanges() ? "has-changes" : ""
                    }`}
                    disabled={saving || loading || !config}
                    title={
                      hasUnsavedChanges()
                        ? "Save all changes"
                        : "Save current settings"
                    }
                  >
                    {saving ? (
                      <>
                        <span className="spinner-small"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">💾</span>
                        {hasUnsavedChanges() ? "Save Changes" : "Save Settings"}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Why Join Us */}
              <div className="form-section">
                <div className="section-header-with-icon">
                  <div className="section-icon">⭐</div>
                  <div>
                    <h3 className="section-title">Why Join Us Section</h3>
                    <p className="section-description">
                      Showcase the benefits and reasons why candidates should
                      join your team
                    </p>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="admin-label">Badge Text</label>
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
                            "➤",
                            "➜",
                            "➣",
                            "○",
                            "◎",
                            "─",
                            "━",
                            "╋",
                          ].includes(config.whySection?.badgeText?.charAt(0))
                            ? config.whySection.badgeText.charAt(0)
                            : ""
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            const currentText =
                              config.whySection?.badgeText || "";
                            const restOfText = currentText.substring(1).trim();
                            handleWhyChange(
                              "badgeText",
                              val + (restOfText ? " " + restOfText : " Why")
                            );
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
                        value={config.whySection?.badgeText || ""}
                        onChange={(e) =>
                          handleWhyChange("badgeText", e.target.value)
                        }
                        placeholder="★ Why"
                      />
                    </div>
                    <small className="form-hint">
                      Pick a star icon from the dropdown or type any custom
                      symbol or emoji. This badge appears above the "Why Join
                      Us" section title.
                    </small>
                  </div>
                  <div className="form-group">
                    <label className="admin-label">Section Title</label>
                    <small className="form-hint">
                      Enter the main title for the "Why Join Us" section. This
                      appears prominently above the benefit cards.
                    </small>
                    <input
                      type="text"
                      className="admin-input"
                      value={config.whySection?.title || ""}
                      onChange={(e) => handleWhyChange("title", e.target.value)}
                      placeholder="Why Join Us?"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <div className="section-header">
                    <h4 className="section-subtitle">Why Cards</h4>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={handleAddWhyCard}
                    >
                      + Add Card
                    </button>
                  </div>

                  {(config.whySection?.cards || []).map((card, index) => (
                    <div key={card.id || index} className="array-item-editor">
                      <div className="array-item-header">
                        <h5>Card {index + 1}</h5>
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger"
                          onClick={() => handleDeleteWhyCard(index)}
                        >
                          Delete
                        </button>
                      </div>

                      <div className="form-group">
                        <ImageSelector
                          value={card.icon || ""}
                          onChange={(url) =>
                            handleWhyCardChange(index, "icon", url)
                          }
                          label="Card Icon"
                          isIcon={true}
                        />
                        <small className="form-hint">
                          Upload an icon image for this benefit card. Icons will
                          be displayed above the card title to visually
                          represent the benefit.
                        </small>
                      </div>

                      <div className="form-group">
                        <InlineFontEditor
                          label="Card Title (use \\n for line breaks)"
                          value={card.title || ""}
                          onChange={(value) =>
                            handleWhyCardChange(index, "title", value)
                          }
                          placeholder="Nurture Your\nPotential"
                          helpText="Use inline formatting for any words; \\n creates a new line."
                        />
                      </div>

                      <div className="form-group">
                        <InlineFontEditor
                          label="Card Text"
                          value={card.text || ""}
                          onChange={(value) =>
                            handleWhyCardChange(index, "text", value)
                          }
                          placeholder="We invest in our people through continuous learning..."
                          helpText="Supports inline formatting for emphasising phrases."
                        />
                      </div>
                    </div>
                  ))}

                  {(config.whySection?.cards || []).length === 0 && (
                    <div
                      className="form-hint"
                      style={{ padding: "16px", textAlign: "center" }}
                    >
                      No Why Join Us cards yet. Click &quot;+ Add Card&quot; to
                      create them.
                    </div>
                  )}
                </div>

                {/* Section Save Button */}
                <div className="section-actions">
                  {hasUnsavedChanges() && (
                    <button
                      onClick={handleCancel}
                      className="admin-btn admin-btn-secondary section-cancel-btn"
                      disabled={saving || loading || !config}
                      title="Discard all unsaved changes"
                    >
                      <span className="btn-icon">❌</span>
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    className={`admin-btn admin-btn-primary section-save-btn ${
                      hasUnsavedChanges() ? "has-changes" : ""
                    }`}
                    disabled={saving || loading || !config}
                    title={
                      hasUnsavedChanges()
                        ? "Save all changes"
                        : "Save current settings"
                    }
                  >
                    {saving ? (
                      <>
                        <span className="spinner-small"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">💾</span>
                        {hasUnsavedChanges() ? "Save Changes" : "Save Settings"}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Openings / Join Us */}
              <div className="form-section">
                <div className="section-header-with-icon">
                  <div className="section-icon">💼</div>
                  <div>
                    <h3 className="section-title">
                      Openings / Join Us Section
                    </h3>
                    <p className="section-description">
                      Manage job openings and application form settings
                    </p>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="admin-label">Badge Text</label>
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
                            "➤",
                            "➜",
                            "➣",
                            "○",
                            "◎",
                            "─",
                            "━",
                            "╋",
                          ].includes(
                            config.openingsSection?.badgeText?.charAt(0)
                          )
                            ? config.openingsSection.badgeText.charAt(0)
                            : ""
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            const currentText =
                              config.openingsSection?.badgeText || "";
                            const restOfText = currentText.substring(1).trim();
                            handleOpeningsChange(
                              "badgeText",
                              val + (restOfText ? " " + restOfText : " Join Us")
                            );
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
                        value={config.openingsSection?.badgeText || ""}
                        onChange={(e) =>
                          handleOpeningsChange("badgeText", e.target.value)
                        }
                        placeholder="★ Join Us"
                      />
                    </div>
                    <small className="form-hint">
                      Pick a star icon from the dropdown or type any custom
                      symbol or emoji. This badge appears above the job openings
                      section title.
                    </small>
                  </div>
                  <div className="form-group">
                    <label className="admin-label">Section Title</label>
                    <small className="form-hint">
                      Enter the main title for the job openings section. This
                      appears above the list of available positions.
                    </small>
                    <input
                      type="text"
                      className="admin-input"
                      value={config.openingsSection?.title || ""}
                      onChange={(e) =>
                        handleOpeningsChange("title", e.target.value)
                      }
                      placeholder="Our Openings"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <div className="section-header">
                    <h4 className="section-subtitle">Jobs</h4>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={handleAddJob}
                    >
                      + Add Job
                    </button>
                  </div>

                  {(config.openingsSection?.jobs || [])
                    .slice()
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((job, index) => (
                      <div key={job.id || index} className="array-item-editor">
                        <div className="array-item-header">
                          <h5>Job {index + 1}</h5>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            onClick={() => handleDeleteJob(index)}
                          >
                            Delete
                          </button>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label className="admin-label">Job Title</label>
                            <small className="form-hint">
                              Enter the job position title (e.g., "Community
                              Manager", "Software Engineer").
                            </small>
                            <input
                              type="text"
                              className="admin-input"
                              value={job.title || ""}
                              onChange={(e) =>
                                handleJobChange(index, "title", e.target.value)
                              }
                              placeholder="Community Manager"
                            />
                          </div>
                          <div className="form-group">
                            <label className="admin-label">Posted Date</label>
                            <small className="form-hint">
                              Enter when this job was posted (e.g., "10th Mar
                              2025", "March 10, 2025").
                            </small>
                            <input
                              type="text"
                              className="admin-input"
                              value={job.date || ""}
                              onChange={(e) =>
                                handleJobChange(index, "date", e.target.value)
                              }
                              placeholder="10th Mar 2025"
                            />
                          </div>
                          <div className="form-group">
                            <label className="admin-label">Order</label>
                            <small className="form-hint">
                              Set the display order for this job. Lower numbers
                              appear first in the list.
                            </small>
                            <input
                              type="number"
                              className="admin-input"
                              value={job.order || 0}
                              onChange={(e) =>
                                handleJobChange(
                                  index,
                                  "order",
                                  e.target.value
                                    ? parseInt(e.target.value, 10)
                                    : 0
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <InlineFontEditor
                            label="Short Blurb"
                            value={job.blurb || ""}
                            onChange={(value) =>
                              handleJobChange(index, "blurb", value)
                            }
                            placeholder="We're looking for a warm, people-first individual..."
                            helpText="This appears in the job list. Supports inline font formatting."
                          />
                        </div>

                        <div className="form-group">
                          <InlineFontEditor
                            label="Full Description (shown in Apply modal)"
                            value={job.description || ""}
                            onChange={(value) =>
                              handleJobChange(index, "description", value)
                            }
                            placeholder="As a Community Manager, you'll be the heart of our coworking space..."
                            helpText="Supports inline formatting and multiple paragraphs."
                          />
                        </div>

                        <div className="form-group">
                          <label className="admin-label">
                            <input
                              type="checkbox"
                              className="admin-checkbox"
                              checked={job.enabled !== false}
                              onChange={(e) =>
                                handleJobChange(
                                  index,
                                  "enabled",
                                  e.target.checked
                                )
                              }
                            />
                            <span>Enable this job</span>
                          </label>
                          <small className="form-hint">
                            When enabled, this job will be visible to visitors.
                            Disabled jobs are hidden from the careers page.
                          </small>
                        </div>
                      </div>
                    ))}

                  {(config.openingsSection?.jobs || []).length === 0 && (
                    <div
                      className="form-hint"
                      style={{ padding: "16px", textAlign: "center" }}
                    >
                      No jobs added yet. Click &quot;+ Add Job&quot; to start
                      listing openings.
                    </div>
                  )}
                </div>

                {/* Section Save Button */}
                <div className="section-actions">
                  {hasUnsavedChanges() && (
                    <button
                      onClick={handleCancel}
                      className="admin-btn admin-btn-secondary section-cancel-btn"
                      disabled={saving || loading || !config}
                      title="Discard all unsaved changes"
                    >
                      <span className="btn-icon">❌</span>
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    className={`admin-btn admin-btn-primary section-save-btn ${
                      hasUnsavedChanges() ? "has-changes" : ""
                    }`}
                    disabled={saving || loading || !config}
                    title={
                      hasUnsavedChanges()
                        ? "Save all changes"
                        : "Save current settings"
                    }
                  >
                    {saving ? (
                      <>
                        <span className="spinner-small"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">💾</span>
                        {hasUnsavedChanges() ? "Save Changes" : "Save Settings"}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Join Us Form Settings */}
              <div className="form-section">
                <div className="section-header-with-icon">
                  <div className="section-icon">📝</div>
                  <div>
                    <h3 className="section-title">Join Us Form Settings</h3>
                    <p className="section-description">
                      Configure the application form that appears in the Apply
                      modal
                    </p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="admin-label">Requirement Label</label>
                  <small className="form-hint">
                    The label text for the requirement/employment type dropdown
                    in the application form.
                  </small>
                  <input
                    type="text"
                    className="admin-input"
                    value={config.formSettings?.requirementLabel || ""}
                    onChange={(e) =>
                      handleFormSettingsChange(
                        "requirementLabel",
                        e.target.value
                      )
                    }
                    placeholder="Requirement"
                  />
                </div>

                <div className="form-group">
                  <label className="admin-label">
                    Requirement Options (one per line)
                  </label>
                  <small className="form-hint">
                    Enter each employment type option on a separate line. These
                    will appear as options in the requirement dropdown.
                  </small>
                  <textarea
                    className="admin-input"
                    rows="4"
                    value={(config.formSettings?.requirementOptions || []).join(
                      "\n"
                    )}
                    onChange={(e) =>
                      handleRequirementOptionsChange(e.target.value)
                    }
                    placeholder={"Full-time\nPart-time\nContract\nInternship"}
                  />
                </div>

                <div className="form-group">
                  <label className="admin-label">Submit Button Text</label>
                  <small className="form-hint">
                    The text displayed on the submit button in the job
                    application form.
                  </small>
                  <input
                    type="text"
                    className="admin-input"
                    value={config.formSettings?.submitButtonText || ""}
                    onChange={(e) =>
                      handleFormSettingsChange(
                        "submitButtonText",
                        e.target.value
                      )
                    }
                    placeholder="Submit"
                  />
                </div>

                {/* Section Save Button */}
                <div className="section-actions">
                  {hasUnsavedChanges() && (
                    <button
                      onClick={handleCancel}
                      className="admin-btn admin-btn-secondary section-cancel-btn"
                      disabled={saving || loading || !config}
                      title="Discard all unsaved changes"
                    >
                      <span className="btn-icon">❌</span>
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    className={`admin-btn admin-btn-primary section-save-btn ${
                      hasUnsavedChanges() ? "has-changes" : ""
                    }`}
                    disabled={saving || loading || !config}
                    title={
                      hasUnsavedChanges()
                        ? "Save all changes"
                        : "Save current settings"
                    }
                  >
                    {saving ? (
                      <>
                        <span className="spinner-small"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">💾</span>
                        {hasUnsavedChanges() ? "Save Changes" : "Save Settings"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
