import React from "react";
//import './SectionTag.css';

// Star symbols that can appear in tags
const STAR_SYMBOLS = [
  "★",
  "☆",
  "✦",
  "✧",
  "✩",
  "✪",
  "✫",
  "✬",
  "✭",
  "✮",
  "✯",
  "✰",
];

export default function SectionTag({ label = "OUR BRANDS" }) {
  if (!label) return <span className="tag">{label}</span>;

  // Extract all stars from the beginning of the label
  let stars = [];
  let remainingText = label;

  // Keep extracting stars from the start
  while (remainingText.length > 0) {
    let found = false;
    for (const star of STAR_SYMBOLS) {
      if (remainingText.startsWith(star)) {
        stars.push(star);
        remainingText = remainingText.substring(star.length).trim();
        found = true;
        break;
      }
    }
    if (!found) break;
  }

  // If we found stars, render them separately
  if (stars.length > 0) {
    return (
      <span className="tag">
        <span className="tag-stars">{stars.join("")}</span>
        {remainingText && <span className="tag-text">{remainingText}</span>}
      </span>
    );
  }

  // No stars found, render as normal
  return <span className="tag">{label}</span>;
}
