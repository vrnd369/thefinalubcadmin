import React, { useState, useRef, useEffect } from "react";
import "./EyebrowTextEditor.css";

const STAR_OPTIONS = [
  { symbol: "★", label: "Black Star" },
  { symbol: "☆", label: "White Star" },
  { symbol: "✦", label: "Four Pointed Star" },
  { symbol: "✧", label: "Four Pointed White Star" },
  { symbol: "✩", label: "Stress Outlined Star" },
  { symbol: "✪", label: "Circled White Star" },
  { symbol: "✫", label: "Open Center Black Star" },
  { symbol: "✬", label: "Black Center White Star" },
  { symbol: "✭", label: "Outlined Black Star" },
  { symbol: "✮", label: "Heavy Outlined Black Star" },
  { symbol: "✯", label: "Pinwheel Star" },
  { symbol: "✰", label: "Shadowed White Star" },
  { symbol: "⭐", label: "White Medium Star" },
  { symbol: "🌟", label: "Glowing Star" },
  { symbol: "💫", label: "Dizzy" },
  { symbol: "✨", label: "Sparkles" },
  { symbol: "🔯", label: "Six Pointed Star" },
  { symbol: "⚡", label: "Lightning" },
  { symbol: "❋", label: "Eight Pointed Star" },
  { symbol: "✺", label: "Sixteen Pointed Star" },
];

export default function EyebrowTextEditor({
  value,
  onChange,
  placeholder,
  label = "Eyebrow Text",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSymbolSelect = (symbol) => {
    if (!value || value.trim() === "") {
      // If field is empty, just add the symbol
      onChange(symbol);
    } else {
      // If field has text, add space and symbol at the beginning
      onChange(`${symbol} ${value}`);
    }
    setIsOpen(false);
  };

  return (
    <div className="form-group">
      <label className="admin-label">{label}</label>
      <div className="eyebrow-text-editor">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="admin-input"
          placeholder={placeholder}
          style={{ flex: 1 }}
        />
        <div className="eyebrow-dropdown-container" ref={dropdownRef}>
          <button
            type="button"
            className="eyebrow-dropdown-btn"
            onClick={() => setIsOpen(!isOpen)}
            title="Insert Star/Emoji"
          >
            ⭐
          </button>
          {isOpen && (
            <div className="eyebrow-dropdown-menu">
              <div className="eyebrow-dropdown-header">Select Symbol</div>
              <div className="eyebrow-dropdown-grid">
                {STAR_OPTIONS.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    className="eyebrow-dropdown-item"
                    onClick={() => handleSymbolSelect(option.symbol)}
                    title={option.label}
                  >
                    {option.symbol}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
