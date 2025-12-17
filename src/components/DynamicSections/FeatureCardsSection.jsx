import React, { useState, useEffect } from "react";
import "../WhySection.css";
import "./DynamicSections.css";
import { resolveImageUrl } from "../../utils/imageUtils";
import { parseInlineFormatting } from "../../admin/components/BrandPageEditor/InlineFontEditor";

const FeatureCard = ({ card, index }) => {
  const [iconUrl, setIconUrl] = useState("");

  useEffect(() => {
    const loadIcon = async () => {
      if (card.icon) {
        const url = await resolveImageUrl(card.icon);
        setIconUrl(url || "");
      } else {
        setIconUrl("");
      }
    };
    loadIcon();
  }, [card.icon]);

  return (
    <div className="why-card">
      {iconUrl && (
        <div className="why-icon dynamic-why-icon">
          <img src={iconUrl} alt={card.title || `Feature ${index + 1}`} />
        </div>
      )}
      {card.title && (
        <h3
          dangerouslySetInnerHTML={{
            __html: card.title.replace(/\n/g, "<br />"),
          }}
        />
      )}
      {card.description && (
        <p className="why-desc-4">{parseInlineFormatting(card.description)}</p>
      )}
    </div>
  );
};

export default function FeatureCardsSection({ content, styles = {} }) {
  const textAlignment = content?.textAlignment || "left";
  const cards = content?.cards || [];

  // Extract styles with defaults
  const backgroundColor = styles?.backgroundColor;
  const sectionPaddingTop = styles?.sectionPaddingTop;
  const sectionPaddingBottom = styles?.sectionPaddingBottom;
  const containerMaxWidth = styles?.containerMaxWidth;

  // Build section style
  const sectionStyle = {
    ...(backgroundColor && { backgroundColor }),
    ...(sectionPaddingTop !== undefined && {
      paddingTop: `${sectionPaddingTop}px`,
    }),
    ...(sectionPaddingBottom !== undefined && {
      paddingBottom: `${sectionPaddingBottom}px`,
    }),
  };

  const containerStyle = {
    textAlign: textAlignment,
    ...(containerMaxWidth !== undefined &&
      containerMaxWidth !== null && { maxWidth: `${containerMaxWidth}px` }),
  };

  return (
    <section className="why-section section" style={sectionStyle}>
      <div className="container" style={containerStyle}>
        {content?.tag && <span className="tag why-tag">{content.tag}</span>}
        {content?.heading && (
          <h2 className="why-heading">
            {content.heading.split('\n').map((line, i, arr) => (
              <React.Fragment key={i}>
                {parseInlineFormatting(line)}
                {i < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </h2>
        )}
        {content?.subtitle && (
          <p className="lead why-subtitle">
            {content.subtitle.split("\n").map((line, i, arr) => (
              <React.Fragment key={i}>
                {parseInlineFormatting(line)}
                {i < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        )}

        <div className="why-features">
          {cards.map((card, index) => (
            <FeatureCard key={index} card={card} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
