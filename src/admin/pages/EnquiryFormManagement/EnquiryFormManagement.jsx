import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import Navbar from "../../../components/Navbar";
import {
  getEnquiryFormConfig,
  setEnquiryFormConfig,
} from "../../services/enquiryFormService";
import "./EnquiryFormManagement.css";

export default function EnquiryFormManagement() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [refreshNavbar, setRefreshNavbar] = useState(0);
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const existing = await getEnquiryFormConfig();
      setConfig(existing);
    } catch (err) {
      console.error("Error loading enquiry form config:", err);
      setError("Failed to load enquiry form settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (updates) => {
    setConfig((prev) => ({
      ...prev,
      ...updates,
    }));
    // Refresh navbar preview
    setRefreshNavbar((prev) => prev + 1);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await setEnquiryFormConfig(config);
      alert("Enquiry form settings saved successfully!");
      // Refresh navbar to show changes
      setRefreshNavbar((prev) => prev + 1);
    } catch (err) {
      console.error("Error saving enquiry form config:", err);
      setError("Failed to save enquiry form settings. Please try again.");
      alert("Error saving enquiry form settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        "Are you sure you want to reset all enquiry form settings to default? This cannot be undone."
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      await getEnquiryFormConfig();
      // Force default values
      setConfig({
        title: "Enquiry Form",
        subtitle: "Tell us what you need",
        buttonText: "Submit Form",
        submittingText: "Submitting...",
        successMessage: "Thank you! Your enquiry has been submitted successfully.",
        errorMessage: "There was an error submitting your enquiry. Please try again.",
        fields: [
          {
            name: "firstName",
            label: "First Name",
            type: "text",
            placeholder: "John",
            required: true,
            order: 1
          },
          {
            name: "lastName",
            label: "Last Name",
            type: "text",
            placeholder: "Smith",
            required: true,
            order: 2
          },
          {
            name: "email",
            label: "Email",
            type: "email",
            placeholder: "john@gmail.com",
            required: true,
            order: 3
          },
          {
            name: "requirement",
            label: "Requirement",
            type: "select",
            placeholder: "Select requirement",
            required: true,
            defaultValue: "Traders and distributors",
            options: [
              "Traders and distributors",
              "Partnership",
              "General Enquiry"
            ],
            order: 4
          },
          {
            name: "message",
            label: "Message",
            type: "textarea",
            placeholder: "Your message here...",
            required: false,
            rows: 5,
            order: 5
          }
        ]
      });
      setRefreshNavbar((prev) => prev + 1);
      alert("Enquiry form settings reset to default.");
    } catch (err) {
      console.error("Error resetting enquiry form config:", err);
      alert("Error resetting enquiry form settings.");
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    const newField = {
      name: `field${Date.now()}`,
      label: "New Field",
      type: "text",
      placeholder: "",
      required: false,
      order: (config.fields?.length || 0) + 1
    };
    updateConfig({
      fields: [...(config.fields || []), newField]
    });
    setEditingFieldIndex(config.fields?.length || 0);
  };

  const updateField = (index, updates) => {
    const newFields = [...(config.fields || [])];
    newFields[index] = { ...newFields[index], ...updates };
    updateConfig({ fields: newFields });
  };

  const deleteField = (index) => {
    if (!window.confirm("Are you sure you want to delete this field?")) {
      return;
    }
    const newFields = config.fields.filter((_, i) => i !== index);
    // Reorder fields
    newFields.forEach((field, i) => {
      field.order = i + 1;
    });
    updateConfig({ fields: newFields });
  };

  const moveField = (index, direction) => {
    const newFields = [...config.fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    newFields.forEach((field, i) => {
      field.order = i + 1;
    });
    updateConfig({ fields: newFields });
  };

  const addOption = (fieldIndex) => {
    const field = config.fields[fieldIndex];
    const newOptions = [...(field.options || []), "New Option"];
    updateField(fieldIndex, { options: newOptions });
  };

  const updateOption = (fieldIndex, optionIndex, value) => {
    const field = config.fields[fieldIndex];
    const newOptions = [...field.options];
    newOptions[optionIndex] = value;
    updateField(fieldIndex, { options: newOptions });
  };

  const deleteOption = (fieldIndex, optionIndex) => {
    const field = config.fields[fieldIndex];
    const newOptions = field.options.filter((_, i) => i !== optionIndex);
    updateField(fieldIndex, { options: newOptions });
  };

  if (loading || !config) {
    return (
      <AdminLayout currentPage="enquiry-form">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p className="admin-text">Loading enquiry form settings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="enquiry-form">
      <div className="enquiry-form-management">
        <div className="enquiry-form-header">
          <div>
            <h1 className="admin-heading-1">Enquiry Form Management</h1>
            <p className="admin-text-sm admin-mt-sm">
              Customize the enquiry form that appears in the navbar. Edit form fields, labels, placeholders, and messages.
            </p>
          </div>
          <div className="enquiry-form-actions">
            <button
              onClick={handleReset}
              className="admin-btn admin-btn-secondary"
              disabled={saving}
            >
              🔄 Reset to Default
            </button>
            <button
              onClick={handleSave}
              className="admin-btn admin-btn-primary"
              disabled={saving}
            >
              {saving ? "💾 Saving..." : "💾 Save Settings"}
            </button>
          </div>
        </div>

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

        {/* Live Preview */}
        <div className="enquiry-form-preview-section">
          <div className="preview-header">
            <h2 className="admin-heading-3">Live Form Preview</h2>
            <p className="admin-text-sm">
              See how your enquiry form looks. Click the "Enquiry Form" button in the navbar to test.
            </p>
          </div>
          <div className="enquiry-form-preview-container">
            <div className="preview-wrapper" style={{ position: "relative", paddingTop: "100px" }}>
              <Navbar key={refreshNavbar} />
            </div>
          </div>
        </div>

        <div className="enquiry-form-editor admin-card">
          {/* General Settings */}
          <div className="form-section">
            <h3 className="section-title">General Settings</h3>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Form Title</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.title || "Enquiry Form"}
                  onChange={(e) => updateConfig({ title: e.target.value })}
                  placeholder="Enquiry Form"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Form Subtitle</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.subtitle || "Tell us what you need"}
                  onChange={(e) => updateConfig({ subtitle: e.target.value })}
                  placeholder="Tell us what you need"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Submit Button Text</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.buttonText || "Submit Form"}
                  onChange={(e) => updateConfig({ buttonText: e.target.value })}
                  placeholder="Submit Form"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Submitting Button Text</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.submittingText || "Submitting..."}
                  onChange={(e) => updateConfig({ submittingText: e.target.value })}
                  placeholder="Submitting..."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Success Message</label>
                <textarea
                  className="admin-input"
                  value={config.successMessage || ""}
                  onChange={(e) => updateConfig({ successMessage: e.target.value })}
                  placeholder="Thank you! Your enquiry has been submitted successfully."
                  rows={2}
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Error Message</label>
                <textarea
                  className="admin-input"
                  value={config.errorMessage || ""}
                  onChange={(e) => updateConfig({ errorMessage: e.target.value })}
                  placeholder="There was an error submitting your enquiry. Please try again."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-section">
            <div className="section-header">
              <h3 className="section-title">Form Fields</h3>
              <button
                onClick={addField}
                className="admin-btn admin-btn-secondary"
              >
                + Add Field
              </button>
            </div>

            {config.fields && config.fields.length > 0 ? (
              <div className="fields-list">
                {config.fields
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((field, index) => {
                    const actualIndex = config.fields.findIndex(f => f.name === field.name);
                    return (
                      <div key={field.name || index} className="field-editor admin-card">
                        <div className="field-header">
                          <div className="field-title">
                            <h4 className="admin-heading-4">
                              {field.label || `Field ${index + 1}`}
                            </h4>
                            <span className="field-type-badge">{field.type}</span>
                          </div>
                          <div className="field-actions">
                            <button
                              onClick={() => moveField(actualIndex, "up")}
                              className="admin-btn admin-btn-secondary"
                              disabled={actualIndex === 0}
                              title="Move up"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveField(actualIndex, "down")}
                              className="admin-btn admin-btn-secondary"
                              disabled={actualIndex === config.fields.length - 1}
                              title="Move down"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => setEditingFieldIndex(editingFieldIndex === actualIndex ? null : actualIndex)}
                              className="admin-btn admin-btn-secondary"
                              title="Edit"
                            >
                              {editingFieldIndex === actualIndex ? "✕" : "✏️"}
                            </button>
                            <button
                              onClick={() => deleteField(actualIndex)}
                              className="admin-btn admin-btn-danger"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {editingFieldIndex === actualIndex && (
                          <div className="field-editor-form">
                            <div className="form-row">
                              <div className="form-group">
                                <label className="admin-label">Field Name (ID)</label>
                                <input
                                  type="text"
                                  className="admin-input"
                                  value={field.name || ""}
                                  onChange={(e) => updateField(actualIndex, { name: e.target.value })}
                                  placeholder="firstName"
                                />
                                <small className="form-hint">Internal identifier (no spaces, lowercase)</small>
                              </div>
                              <div className="form-group">
                                <label className="admin-label">Field Label</label>
                                <input
                                  type="text"
                                  className="admin-input"
                                  value={field.label || ""}
                                  onChange={(e) => updateField(actualIndex, { label: e.target.value })}
                                  placeholder="First Name"
                                />
                              </div>
                            </div>

                            <div className="form-row">
                              <div className="form-group">
                                <label className="admin-label">Field Type</label>
                                <select
                                  className="admin-select"
                                  value={field.type || "text"}
                                  onChange={(e) => {
                                    const updates = { type: e.target.value };
                                    if (e.target.value !== "select") {
                                      delete updates.options;
                                    } else if (!field.options) {
                                      updates.options = ["Option 1"];
                                    }
                                    updateField(actualIndex, updates);
                                  }}
                                >
                                  <option value="text">Text</option>
                                  <option value="email">Email</option>
                                  <option value="textarea">Textarea</option>
                                  <option value="select">Select (Dropdown)</option>
                                </select>
                              </div>
                              <div className="form-group">
                                <label className="admin-label">Placeholder</label>
                                <input
                                  type="text"
                                  className="admin-input"
                                  value={field.placeholder || ""}
                                  onChange={(e) => updateField(actualIndex, { placeholder: e.target.value })}
                                  placeholder="Enter text..."
                                />
                              </div>
                            </div>

                            {field.type === "textarea" && (
                              <div className="form-group">
                                <label className="admin-label">Rows</label>
                                <input
                                  type="number"
                                  className="admin-input"
                                  value={field.rows || 5}
                                  onChange={(e) => updateField(actualIndex, { rows: parseInt(e.target.value) || 5 })}
                                  min="1"
                                  max="20"
                                />
                              </div>
                            )}

                            {field.type === "select" && (
                              <div className="form-group">
                                <label className="admin-label">Options</label>
                                <div className="options-list">
                                  {field.options && field.options.map((option, optIndex) => (
                                    <div key={optIndex} className="option-item">
                                      <input
                                        type="text"
                                        className="admin-input"
                                        value={option}
                                        onChange={(e) => updateOption(actualIndex, optIndex, e.target.value)}
                                        placeholder="Option value"
                                      />
                                      <button
                                        onClick={() => deleteOption(actualIndex, optIndex)}
                                        className="admin-btn admin-btn-danger"
                                        title="Delete option"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => addOption(actualIndex)}
                                    className="admin-btn admin-btn-secondary"
                                  >
                                    + Add Option
                                  </button>
                                </div>
                                <div className="form-group admin-mt-sm">
                                  <label className="admin-label">Default Value</label>
                                  <input
                                    type="text"
                                    className="admin-input"
                                    value={field.defaultValue || ""}
                                    onChange={(e) => updateField(actualIndex, { defaultValue: e.target.value })}
                                    placeholder="Default option"
                                  />
                                </div>
                              </div>
                            )}

                            <div className="form-row">
                              <div className="form-group">
                                <label className="admin-label">
                                  <input
                                    type="checkbox"
                                    checked={field.required || false}
                                    onChange={(e) => updateField(actualIndex, { required: e.target.checked })}
                                  />
                                  <span style={{ marginLeft: "8px" }}>Required Field</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="admin-empty-state">
                <p className="admin-text">No fields added yet.</p>
                <button
                  onClick={addField}
                  className="admin-btn admin-btn-primary admin-mt-md"
                >
                  Add Your First Field
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

