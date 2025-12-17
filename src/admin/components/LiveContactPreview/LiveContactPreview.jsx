import React, { useMemo, useState } from "react";
import "../../../pages/Contact.css";
import "../../../components/TellUs.css";
import TellUsSection from "../../../components/DynamicSections/TellUsSection";
import { parseInlineFormatting } from "../BrandPageEditor/InlineFontEditor";

const DEFAULT_LOCATIONS = {
  corporate: {
    key: "corporate",
    name: "Corporate Office",
    address:
      "H.No. 8-2-334/60 & 61, Road No. 5, Banjara Hills, Hyderabad-500034, Telangana.",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.5!2d78.4250!3d17.4230!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb91d8b8b8b8b9%3A0x3b8b8b8b8b8b8b8b!2sRoad+No.+5%2C+Banjara+Hills%2C+Hyderabad%2C+Telangana+500034!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin",
    directionsUrl:
      "https://www.google.com/maps/search/?api=1&query=H.No.+8-2-334%2F60+%26+61%2C+Road+No.+5%2C+Banjara+Hills%2C+Hyderabad-500034%2C+Telangana",
  },
  mfg: {
    key: "mfg",
    name: "Mfg. Office & Facility",
    address:
      "Sy. No. 810-812, 820 & 821, Gummadidala (Village & Mandal) – 502313, Sangareddy District, Telangana.",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.5!2d78.4250!3d17.4230!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb91d8b8b8b8b9%3A0x3b8b8b8b8b8b8b8b!2sGummadidala%2C+Telangana+502313!5e0!3m2!1sen!2sin!4v1234567890124!5m2!1sen!2sin",
    directionsUrl:
      "https://www.google.com/maps/search/?api=1&query=Sy.+No.+810-812%2C+820+%26+821%2C+Gummadidala%2C+Sangareddy+District%2C+Telangana+502313",
  },
};

export default function LiveContactPreview({ previewConfig }) {
  const [selectedLocationKey, setSelectedLocationKey] = useState(null);

  const config = previewConfig || null;

  const locationsByKey = useMemo(() => {
    if (!config || !config.locations) return {};
    const map = {};
    config.locations.forEach((loc) => {
      if (loc && loc.key) {
        map[loc.key] = loc;
      }
    });
    return map;
  }, [config]);

  const currentLocation = useMemo(() => {
    const key =
      selectedLocationKey ||
      config?.defaultLocationKey ||
      (config?.locations && config.locations[0]?.key) ||
      null;
    if (key && locationsByKey[key]) {
      const cmsLoc = locationsByKey[key];
      const fallback = DEFAULT_LOCATIONS[key] || {};
      return { ...fallback, ...cmsLoc };
    }
    if (key && DEFAULT_LOCATIONS[key]) {
      return DEFAULT_LOCATIONS[key];
    }
    if (config && config.locations && config.locations[0]) {
      const first = config.locations[0];
      const fallback = first.key ? DEFAULT_LOCATIONS[first.key] || {} : {};
      return { ...fallback, ...first };
    }
    return DEFAULT_LOCATIONS.corporate;
  }, [selectedLocationKey, locationsByKey, config]);

  const infoPanelStyle = useMemo(() => {
    if (!config || !config.infoPanel) return {};
    const ip = config.infoPanel;
    const style = {};
    // Only allow backgroundColor to be edited - dimensions are fixed in CSS
    if (ip.backgroundColor) style.backgroundColor = ip.backgroundColor;
    return style;
  }, [config]);

  const mapContainerStyle = useMemo(() => {
    if (!config || !config.mapContainer) return {};
    const mc = config.mapContainer;
    const style = {};
    // Only allow backgroundColor and borderRadius to be edited - dimensions are fixed in CSS
    if (mc.backgroundColor) style.background = mc.backgroundColor;
    if (mc.borderRadius != null) style.borderRadius = `${mc.borderRadius}px`;
    return style;
  }, [config]);

  const mapFilter =
    config?.mapContainer?.grayscale === false ? "none" : "grayscale(100%)";

  const directionsButtonStyle = useMemo(() => {
    if (!config || !config.directionsButton) return {};
    const btn = config.directionsButton;
    const style = {};
    if (btn.backgroundColor) style.background = btn.backgroundColor;
    if (btn.textColor) style.color = btn.textColor;
    return style;
  }, [config]);

  const handleInfoLocationClick = (locationKey) => {
    if (!locationKey) return;
    setSelectedLocationKey(locationKey);
  };

  const headingContent = useMemo(() => {
    if (!config || !config.heading) return "Get in touch with us";
    const text = String(config.heading);
    const parts = text.split("\\n");
    return parts.map((line, idx) => (
      <React.Fragment key={idx}>
        {parseInlineFormatting(line)}
        {idx < parts.length - 1 && <br />}
      </React.Fragment>
    ));
  }, [config]);

  const bannerStar = config?.bannerTagStar || "★";
  const bannerText = config?.bannerTagText || "CONTACT US";
  const infoItems = config?.infoItems || [];

  if (!config) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "#64748b",
          fontSize: "0.875rem",
        }}
      >
        Start editing to see live preview
      </div>
    );
  }

  return (
    <div className="live-contact-preview">
      <main
        className="contact-page"
        style={{
          margin: 0,
          padding: 0,
          minHeight: "auto",
          width: "max-content",
          minWidth: "100%",
          maxWidth: "none",
          overflowX: "visible",
        }}
      >
        <div className="contact-banner">
          <div className="container">
            <span className="tag">
              <span className="contact-tag-star">{bannerStar}</span>
              <span className="contact-tag-text">{bannerText}</span>
            </span>
          </div>
        </div>

        <div className="container contact-main">
          <h1 className="contact-heading">{headingContent}</h1>

          <div className="contact-content">
            <div className="contact-info-panel" style={infoPanelStyle}>
              {infoItems.length > 0 ? (
                infoItems.map((item, index) => {
                  const isLocation = item.type === "location";
                  const isActive =
                    isLocation &&
                    item.locationKey &&
                    item.locationKey === selectedLocationKey;

                  const itemClass =
                    isLocation && index < 2
                      ? `contact-item ${isActive ? "active" : ""}`
                      : "contact-item";

                  const handleClick = () => {
                    if (isLocation && item.locationKey) {
                      handleInfoLocationClick(item.locationKey);
                    }
                  };

                  return (
                    <div
                      key={item.id || index}
                      className={itemClass}
                      onClick={isLocation ? handleClick : undefined}
                    >
                      {item.title && (
                        <h3>{parseInlineFormatting(item.title)}</h3>
                      )}
                      {item.text && (
                        <p>
                          {(item.text || "").split("\n").map((line, i, arr) => (
                            <React.Fragment key={i}>
                              {parseInlineFormatting(line)}
                              {i < arr.length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <>
                  <div
                    className={`contact-item ${
                      selectedLocationKey === "corporate" ? "active" : ""
                    }`}
                    onClick={() => setSelectedLocationKey("corporate")}
                  >
                    <h3>Corporate Office</h3>
                    <p>
                      H.No. 8-2-334/60 &amp; 61, Road No. 5,
                      <br />
                      Banjara Hills, Hyderabad-500034, Telangana.
                    </p>
                  </div>

                  <div
                    className={`contact-item ${
                      selectedLocationKey === "mfg" ? "active" : ""
                    }`}
                    onClick={() => setSelectedLocationKey("mfg")}
                  >
                    <h3>Mfg. Office &amp; Facility</h3>
                    <p>
                      Sy. No. 810-812, 820 &amp; 821,
                      <br />
                      Gummadidala (Village &amp; Mandal) –<br />
                      502313, Sangareddy District,
                      <br />
                      Telangana.
                    </p>
                  </div>

                  <div className="contact-item">
                    <h3>Email</h3>
                    <p>marketing@soilkingfoods.com</p>
                  </div>

                  <div className="contact-item">
                    <h3>Call us</h3>
                    <p>+91 8143150953 | 04023399533</p>
                  </div>
                </>
              )}
            </div>

            <div className="contact-map-container" style={mapContainerStyle}>
              <div className="map-wrapper">
                {currentLocation && currentLocation.mapEmbed ? (
                  <iframe
                    key={
                      currentLocation.key ||
                      currentLocation.id ||
                      selectedLocationKey ||
                      "default"
                    }
                    src={currentLocation.mapEmbed}
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: mapFilter }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`UBC ${currentLocation.name || "Location"} Map`}
                  ></iframe>
                ) : null}
              </div>
              {currentLocation && currentLocation.directionsUrl && (
                <button
                  className="get-directions-btn"
                  style={directionsButtonStyle}
                  onClick={() =>
                    window.open(currentLocation.directionsUrl, "_blank")
                  }
                >
                  {config?.directionsButton?.text || "Get Directions"}
                </button>
              )}
            </div>
          </div>
        </div>

        {config?.tellUsSection ? (
          <TellUsSection
            content={{
              tagStar: config.tellUsSection.tagStar,
              tagText: config.tellUsSection.tagText,
              heading: config.tellUsSection.heading,
              description: config.tellUsSection.description,
              submitButtonText: config.tellUsSection.submitButtonText,
              formFields: config.tellUsSection.formFields,
            }}
            styles={{
              backgroundColor: config.tellUsSection.backgroundColor,
              buttonBackgroundColor: config.tellUsSection.buttonBackgroundColor,
              buttonTextColor: config.tellUsSection.buttonTextColor,
            }}
          />
        ) : (
          <TellUsSection />
        )}
      </main>
    </div>
  );
}
