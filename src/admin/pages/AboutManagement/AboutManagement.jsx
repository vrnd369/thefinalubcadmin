import React, { useState, useEffect, useRef, useCallback } from "react";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import AboutSectionCard from "../../components/AboutSectionCard/AboutSectionCard";
import AboutSectionEditor from "../../components/AboutSectionEditor/AboutSectionEditor";
import LiveAboutSectionPreview from "../../components/LiveAboutSectionPreview/LiveAboutSectionPreview";
import DynamicAbout from "../../../components/DynamicAbout";
import {
  getAboutSections,
  deleteAboutSection,
  updateAboutSection,
} from "../../services/aboutService";
import {
  importLiveAboutSections,
  checkExistingAboutSections,
} from "../../services/aboutImportService";
import "./AboutManagement.css";

export default function AboutManagement() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);
  const [livePreviewData, setLivePreviewData] = useState(null);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const editorRef = useRef(null);

  const findDuplicates = useCallback(
    (sectionsList = sections) => {
      const typeMap = {};
      const duplicatesList = [];

      sectionsList.forEach((section) => {
        if (!section.type) return;

        if (!typeMap[section.type]) {
          typeMap[section.type] = [];
        }
        typeMap[section.type].push(section);
      });

      Object.keys(typeMap).forEach((type) => {
        if (typeMap[type].length > 1) {
          const sorted = typeMap[type].sort((a, b) => {
            const orderA = a.order ?? 999;
            const orderB = b.order ?? 999;
            if (orderA !== orderB) return orderA - orderB;

            const dateA = a.createdAt || a.id;
            const dateB = b.createdAt || b.id;
            return dateA.localeCompare(dateB);
          });

          duplicatesList.push({
            type,
            primary: sorted[0],
            duplicates: sorted.slice(1),
            total: sorted.length,
          });
        }
      });

      setDuplicates(duplicatesList);
      return duplicatesList;
    },
    [sections]
  );

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAboutSections();
      setSections(data);
      // Check for duplicates whenever sections are loaded
      findDuplicates(data);
    } catch (err) {
      console.error("Error fetching about sections:", err);
      setError("Failed to load about sections. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [findDuplicates]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Delete duplicate sections
  const handleDeleteDuplicates = async (duplicateGroup) => {
    const duplicateIds = duplicateGroup.duplicates.map((d) => d.id);
    const sectionNames = duplicateGroup.duplicates.map((d) => d.name || d.type).join(", ");

    const confirm = window.confirm(
      `Are you sure you want to delete ${duplicateIds.length} duplicate section(s) of type "${duplicateGroup.type}"?\n\n` +
        `Sections to delete:\n${sectionNames}\n\n` +
        `This will keep: "${duplicateGroup.primary.name || duplicateGroup.primary.type}"\n\n` +
        `This action cannot be undone.`
    );

    if (!confirm) return;

    try {
      // Delete all duplicates
      const deletePromises = duplicateIds.map((id) => deleteAboutSection(id));
      await Promise.all(deletePromises);
      
      alert(`Successfully deleted ${duplicateIds.length} duplicate section(s).`);
      await fetchSections();
      
      // If no more duplicates, close the duplicates view
      const remainingDuplicates = findDuplicates();
      if (remainingDuplicates.length === 0) {
        setShowDuplicates(false);
      }
    } catch (err) {
      console.error("Error deleting duplicates:", err);
      alert(`Error deleting duplicates: ${err.message}`);
    }
  };

  // Delete all duplicates at once
  const handleDeleteAllDuplicates = async () => {
    const allDuplicateIds = duplicates.flatMap((group) =>
      group.duplicates.map((d) => d.id)
    );
    const totalCount = allDuplicateIds.length;

    if (totalCount === 0) {
      alert("No duplicates found!");
      return;
    }

    const confirm = window.confirm(
      `Are you sure you want to delete ALL ${totalCount} duplicate section(s)?\n\n` +
        `This will keep the first section of each type and delete all duplicates.\n\n` +
        `This action cannot be undone.`
    );

    if (!confirm) return;

    try {
      const deletePromises = allDuplicateIds.map((id) => deleteAboutSection(id));
      await Promise.all(deletePromises);
      
      alert(`Successfully deleted ${totalCount} duplicate section(s).`);
      await fetchSections();
      setShowDuplicates(false);
    } catch (err) {
      console.error("Error deleting all duplicates:", err);
      alert(`Error deleting duplicates: ${err.message}`);
    }
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setShowAddForm(false);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this section? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteAboutSection(id);
      await fetchSections();
      alert("Section deleted successfully!");
    } catch (err) {
      console.error("Error deleting section:", err);
      alert("Error deleting section. Please try again.");
    }
  };

  const handleToggleEnable = async (id, enabled) => {
    try {
      await updateAboutSection(id, { enabled });
      await fetchSections();
    } catch (err) {
      console.error("Error toggling section:", err);
      alert("Error updating section. Please try again.");
    }
  };

  const handleSave = async () => {
    // If editor ref exists, trigger form submission
    if (editorRef.current) {
      editorRef.current.submit();
    } else {
      // Fallback: just refresh and close
      await fetchSections();
      setEditingSection(null);
      setShowAddForm(false);
      setLivePreviewData(null);
    }
  };

  const handleSaveComplete = async () => {
    await fetchSections();
    setEditingSection(null);
    setShowAddForm(false);
    setLivePreviewData(null);
  };

  const handleCancel = () => {
    setEditingSection(null);
    setShowAddForm(false);
  };

  const handleImportLiveWebsite = async () => {
    // Check if sections already exist
    const hasExisting = await checkExistingAboutSections();

    if (hasExisting && sections.length > 0) {
      const confirm = window.confirm(
        "You already have sections in the database. Importing will UPDATE existing sections with the same type and ADD any new sections.\n\n" +
          "This will NOT create duplicates - existing sections will be updated with the imported data.\n\n" +
          "Do you want to continue?"
      );
      if (!confirm) return;
    }

    const finalConfirm = window.confirm(
      "This will import all sections from your live About page into the CMS.\n\n" +
        "This includes:\n" +
        "- Hero Section (image)\n" +
        "- Leaders Section (founders & current leaders)\n" +
        "- Founding Story Section\n" +
        "- Vision Section\n" +
        "- Mission Section\n" +
        "- Infrastructure Section\n" +
        "- Certification Section\n" +
        "- Sustainability Section\n" +
        "- Media & News Section\n\n" +
        "Continue?"
    );

    if (!finalConfirm) return;

    try {
      setImporting(true);
      setError(null);
      const result = await importLiveAboutSections();
      
      // Build detailed message
      const updatedSections = result.sections.filter(s => s.action === "updated");
      const addedSections = result.sections.filter(s => s.action === "added");
      
      let message = `✅ ${result.message}\n\n`;
      
      if (updatedSections.length > 0) {
        message += `Updated sections (${updatedSections.length}):\n${updatedSections.map(s => `- ${s.name}`).join("\n")}\n\n`;
      }
      
      if (addedSections.length > 0) {
        message += `Added sections (${addedSections.length}):\n${addedSections.map(s => `- ${s.name}`).join("\n")}`;
      }
      
      alert(message);
      await fetchSections();
    } catch (err) {
      console.error("Error importing about sections:", err);
      setError(`Failed to import sections: ${err.message}`);
      alert(`Error importing sections: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <AdminLayout currentPage="about">
      <div className="about-management">
        <div className="about-management-header">
          <div>
            <h1 className="admin-heading-1">About Us Management</h1>
            <p className="admin-text-sm admin-mt-sm">
              Manage all sections of your About Us page. Edit text, images,
              icons, alignment, dimensions, and more.
            </p>
          </div>
          <div className="header-actions">
            {duplicates.length > 0 && (
              <button
                onClick={() => setShowDuplicates(!showDuplicates)}
                className="admin-btn admin-btn-secondary"
                style={{ backgroundColor: "#f59e0b", color: "white", borderColor: "#f59e0b" }}
                title={`Found ${duplicates.length} duplicate section type(s). Click to manage.`}
              >
                ⚠️ Duplicates ({duplicates.length})
              </button>
            )}
            <button
              onClick={handleImportLiveWebsite}
              className="admin-btn admin-btn-secondary"
              disabled={importing}
              title="Import all sections from the live About page"
            >
              {importing ? "⏳ Importing..." : "📥 Import from Live Website"}
            </button>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingSection(null);
              }}
              className="admin-btn admin-btn-primary"
            >
              + Add New Section
            </button>
          </div>
        </div>

        {error && (
          <div className="admin-alert admin-alert-error">
            {error}
            <button
              onClick={fetchSections}
              className="admin-btn admin-btn-secondary admin-mt-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Duplicates Management Panel */}
        {showDuplicates && duplicates.length > 0 && (
          <div className="admin-card admin-mt-md" style={{ border: "2px solid #f59e0b" }}>
            <div style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div>
                  <h2 className="admin-heading-3" style={{ color: "#f59e0b", margin: 0 }}>
                    ⚠️ Duplicate Sections Found
                  </h2>
                  <p className="admin-text-sm admin-mt-sm" style={{ color: "#6b7280" }}>
                    Found {duplicates.length} section type(s) with multiple entries. 
                    You can delete duplicates to keep only one section per type.
                  </p>
                </div>
                <button
                  onClick={() => setShowDuplicates(false)}
                  className="admin-btn admin-btn-secondary"
                  style={{ marginLeft: "1rem" }}
                >
                  ✕ Close
                </button>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <button
                  onClick={handleDeleteAllDuplicates}
                  className="admin-btn admin-btn-danger"
                  style={{ marginRight: "0.5rem" }}
                >
                  🗑️ Delete All Duplicates ({duplicates.reduce((sum, g) => sum + g.duplicates.length, 0)})
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {duplicates.map((group, index) => (
                  <div
                    key={group.type}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "1rem",
                      backgroundColor: "#fef3c7",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <div>
                        <h3 className="admin-heading-4" style={{ margin: 0, color: "#92400e" }}>
                          Type: <strong>{group.type}</strong>
                        </h3>
                        <p className="admin-text-sm" style={{ color: "#78350f", marginTop: "0.25rem" }}>
                          {group.total} section(s) found - {group.duplicates.length} duplicate(s)
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteDuplicates(group)}
                        className="admin-btn admin-btn-danger"
                        style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
                      >
                        Delete {group.duplicates.length} Duplicate(s)
                      </button>
                    </div>

                    <div style={{ marginTop: "0.75rem" }}>
                      <div style={{ marginBottom: "0.5rem" }}>
                        <strong style={{ color: "#059669" }}>✓ Keeping:</strong>
                        <div style={{ marginLeft: "1rem", marginTop: "0.25rem", padding: "0.5rem", backgroundColor: "#d1fae5", borderRadius: "4px" }}>
                          <span style={{ fontWeight: 500 }}>{group.primary.name || group.primary.type}</span>
                          <span style={{ fontSize: "0.75rem", color: "#6b7280", marginLeft: "0.5rem" }}>
                            (ID: {group.primary.id}, Order: {group.primary.order ?? 0})
                          </span>
                        </div>
                      </div>

                      <div>
                        <strong style={{ color: "#dc2626" }}>✗ Duplicates to delete:</strong>
                        <div style={{ marginLeft: "1rem", marginTop: "0.25rem" }}>
                          {group.duplicates.map((dup) => (
                            <div
                              key={dup.id}
                              style={{
                                padding: "0.5rem",
                                backgroundColor: "#fee2e2",
                                borderRadius: "4px",
                                marginBottom: "0.25rem",
                              }}
                            >
                              <span>{dup.name || dup.type}</span>
                              <span style={{ fontSize: "0.75rem", color: "#6b7280", marginLeft: "0.5rem" }}>
                                (ID: {dup.id}, Order: {dup.order ?? 0})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Always render content area to prevent layout shifts */}
        {loading && sections.length === 0 ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p className="admin-text">Loading about sections...</p>
          </div>
        ) : (
          <>
            {/* Split Layout: Preview Left, Editor Right when editing */}
            {showAddForm || editingSection ? (
              <div className="about-management-split-layout">
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
                    </div>
                  </div>
                  <div className="split-preview-container">
                    {livePreviewData ? (
                      <div className="split-preview-wrapper">
                        <LiveAboutSectionPreview
                          sectionData={livePreviewData}
                          allSections={sections}
                        />
                      </div>
                    ) : (
                      <div className="split-preview-wrapper">
                        <DynamicAbout />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Editor */}
                <div className="split-editor-panel">
                  <AboutSectionEditor
                    ref={editorRef}
                    section={editingSection}
                    onSave={handleSaveComplete}
                    onCancel={handleCancel}
                    onLiveUpdate={setLivePreviewData}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Sections List */}
                {sections.length === 0 ? (
                  <div className="admin-empty-state">
                    <p className="admin-text">No about sections found.</p>
                    <p className="admin-text-sm admin-mt-sm">
                      Import sections from your live About page or create your
                      first section manually.
                    </p>
                    <div className="empty-state-actions">
                      <button
                        onClick={handleImportLiveWebsite}
                        className="admin-btn admin-btn-secondary admin-mt-md"
                        disabled={importing}
                      >
                        {importing
                          ? "⏳ Importing..."
                          : "📥 Import from Live Website"}
                      </button>
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="admin-btn admin-btn-primary admin-mt-md"
                      >
                        Create Your First Section
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="about-sections-grid">
                    {sections.slice(0, 10).map((section) => (
                      <AboutSectionCard
                        key={section.id}
                        section={section}
                        onEdit={() => handleEdit(section)}
                        onDelete={() => handleDelete(section.id)}
                        onToggleEnable={handleToggleEnable}
                        onUpdate={handleSave}
                        onCancel={handleCancel}
                        isEditing={editingSection?.id === section.id}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
