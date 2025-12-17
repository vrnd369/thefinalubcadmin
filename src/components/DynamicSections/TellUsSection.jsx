import React, { useState } from "react";
import "../TellUs.css";
import { submitForm } from "../../admin/services/formSubmissionService";
import { parseInlineFormatting } from "../../admin/components/BrandPageEditor/InlineFontEditor";

export default function TellUsSection({ content, styles = {} }) {
  // Initialize form data from content formFields (matching enquiry form structure)
  const getInitialFormData = () => {
    const fields = content?.formFields || [];
    const initialData = {};
    fields.forEach((field) => {
      if (field.type === "select" && field.defaultValue) {
        initialData[field.name] = field.defaultValue;
      } else {
        initialData[field.name] = "";
      }
    });
    // Fallback to default structure if no fields
    if (Object.keys(initialData).length === 0) {
      return {
        firstName: "",
        lastName: "",
        email: "",
        requirement: "Traders and distributors",
        message: "",
      };
    }
    return initialData;
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

  // Extract styles - only non-dimension properties
  const backgroundColor = styles?.backgroundColor || "#000000";
  const buttonBackgroundColor = styles?.buttonBackgroundColor || "#323790";
  const buttonTextColor = styles?.buttonTextColor || "#FFFFFF";
  const textAlignment = content?.textAlignment || "left";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await submitForm(formData);
      setSubmitStatus("success");
      // Reset form using getInitialFormData
      setFormData(getInitialFormData());
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
      // Clear error message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get form fields from content or use defaults (matching enquiry form structure)
  const formFields = content?.formFields || [
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      placeholder: "John",
      required: true,
      order: 1,
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
      placeholder: "Smith",
      required: true,
      order: 2,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "john@gmail.com",
      required: true,
      order: 3,
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
        "General Enquiry",
      ],
      order: 4,
    },
    {
      name: "message",
      label: "Message",
      type: "textarea",
      placeholder: "Your message here...",
      required: false,
      rows: 5,
      order: 5,
    },
  ];

  // Sort fields by order property (like enquiry form)
  const sortedFields = formFields
    ? [...formFields].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  // Handle tag - can be full string or separate star and text
  const tagStar =
    content?.tagStar || (content?.tag ? content.tag.split(" ")[0] : "★");
  const tagText =
    content?.tagText ||
    (content?.tag
      ? content.tag.replace(/^[★☆✦✧✺✶✸❋●◦◆◇•✱✳︎✴︎➤➜➣○◎─━╋]\s*/, "").trim()
      : "TELL US");
  const heading = content?.heading || "Tell Us\nWhat You Need";
  const description =
    content?.description ||
    "Whether it's bulk orders, private\nlabeling, or partnerships —\nwe're here to help.";
  const submitButtonText = content?.submitButtonText || "Submit Form";

  // Build inline styles - only colors and text alignment, NO dimensions
  const sectionStyle = {
    backgroundColor, // Only colors allowed
  };

  const leftStyle = {
    textAlign: textAlignment, // Text alignment OK
  };

  // No contentStyle or formStyle - dimensions handled by CSS

  const buttonStyle = {
    backgroundColor: buttonBackgroundColor,
    color: buttonTextColor,
    // Dimensions handled by CSS
  };

  return (
    <section className="tell-us-section" style={sectionStyle}>
      <div className="container">
        <div className="tell-us-content">
          <div className="tell-us-left" style={leftStyle}>
            <span className="tell-us-tag">
              <span className="tell-us-star">{tagStar}</span>
              <span className="tell-us-tag-text">{tagText}</span>
            </span>
            {heading && (
              <h2 className="tell-us-heading">
                {String(heading)
                  .split(/\\n|\n/)
                  .map((line, index, arr) => (
                    <React.Fragment key={index}>
                      {parseInlineFormatting(line)}
                      {index < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))}
              </h2>
            )}
            {description && (
              <p className="tell-us-description">
                {description.split("\n").map((line, index, arr) => (
                  <React.Fragment key={index}>
                    {parseInlineFormatting(line)}
                    {index < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            )}
          </div>
          <div className="tell-us-right">
            <form className="tell-us-form" onSubmit={handleSubmit}>
              {sortedFields.map((field, index) => {
                const fieldId = `tell-us-${field.name}`;
                // For select fields, use defaultValue if formData doesn't have a value
                const fieldValue = field.type === "select" 
                  ? (formData[field.name] || field.defaultValue || "")
                  : (formData[field.name] || "");

                return (
                  <div key={index} className="form-group">
                    <div className="input-wrapper">
                      <label htmlFor={fieldId} className="input-label">
                        {field.label}
                        {field.required && <span style={{ color: "red" }}> *</span>}
                      </label>
                      {field.type === "select" ? (
                        <select
                          id={fieldId}
                          name={field.name}
                          value={fieldValue}
                          onChange={handleChange}
                          required={field.required !== false}
                        >
                          {field.placeholder && !field.defaultValue && (
                            <option value="" disabled>
                              {field.placeholder}
                            </option>
                          )}
                          {field.options?.map((option, optIndex) => (
                            <option key={optIndex} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "textarea" ? (
                        <textarea
                          id={fieldId}
                          name={field.name}
                          rows={field.rows || 5}
                          value={formData[field.name] || ""}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          required={field.required !== false}
                        ></textarea>
                      ) : field.type === "email" ? (
                        <input
                          type="email"
                          id={fieldId}
                          name={field.name}
                          value={formData[field.name] || ""}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          required={field.required !== false}
                        />
                      ) : (
                        <input
                          type={field.type || "text"}
                          id={fieldId}
                          name={field.name}
                          value={formData[field.name] || ""}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          required={field.required !== false}
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              {submitStatus === "success" && (
                <div
                  style={{
                    padding: "16px",
                    background: "rgba(34, 197, 94, 0.2)",
                    color: "#86efac",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    borderRadius: "12px",
                    marginBottom: "24px",
                    textAlign: "center",
                    fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
                    fontSize: "14px",
                  }}
                >
                  Thank you! Your enquiry has been submitted successfully.
                </div>
              )}

              {submitStatus === "error" && (
                <div
                  style={{
                    padding: "16px",
                    background: "rgba(239, 68, 68, 0.2)",
                    color: "#fca5a5",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "12px",
                    marginBottom: "24px",
                    textAlign: "center",
                    fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
                    fontSize: "14px",
                  }}
                >
                  There was an error submitting your enquiry. Please try again.
                </div>
              )}

              <button
                type="submit"
                className="tell-us-submit-btn"
                style={buttonStyle}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : submitButtonText}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
