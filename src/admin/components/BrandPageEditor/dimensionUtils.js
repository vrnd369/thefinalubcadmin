/**
 * Utility functions for managing brand page dimensions
 */

/**
 * Get default dimensions for a section and device
 */
export const getDefaultDimensions = (section, device = "desktop") => {
  const defaults = {
    hero: {
      desktop: {
        paddingTop: 240,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 0,
        marginBottom: 0,
        containerPadding: 24,
        gap: 0,
        height: 1077,
        minHeight: 1077,
        maxHeight: 1077,
        titleFontSize: 68,
        leadFontSize: 18,
        leadMaxWidth: 820,
      },
      tablet: {
        paddingTop: 240,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 0,
        marginBottom: 0,
        containerPadding: 24,
        gap: 0,
        height: 1077,
        minHeight: 1077,
        maxHeight: 1077,
        titleFontSize: 56,
        leadFontSize: 16,
        leadMaxWidth: 720,
      },
      mobile: {
        paddingTop: 180,
        paddingBottom: 60,
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 0,
        marginBottom: 0,
        containerPadding: 20,
        gap: 0,
        height: "auto",
        minHeight: 600,
        maxHeight: "none",
        titleFontSize: 36,
        leadFontSize: 14,
        leadMaxWidth: "100%",
      },
    },
    about: {
      desktop: {
        paddingTop: 100,
        paddingBottom: 100,
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 0,
        marginBottom: 0,
        containerPadding: 24,
        gap: 48,
        gridGap: 48,
        titleFontSize: 44,
        paragraphFontSize: 22,
      },
      tablet: {
        paddingTop: 100,
        paddingBottom: 100,
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 0,
        marginBottom: 0,
        containerPadding: 24,
        gap: 40,
        gridGap: 40,
        titleFontSize: 40,
        paragraphFontSize: 20,
      },
      mobile: {
        paddingTop: 80,
        paddingBottom: 80,
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 0,
        marginBottom: 0,
        containerPadding: 20,
        gap: 32,
        gridGap: 32,
        titleFontSize: 36,
        paragraphFontSize: 18,
      },
    },
    standFor: {
      desktop: {
        paddingTop: 100,
        paddingBottom: 100,
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 0,
        marginBottom: 0,
        containerPadding: 24,
        gap: 48,
        gridGap: 48,
        titleFontSize: 44,
        paragraphFontSize: 22,
      },
      tablet: {
        paddingTop: 100,
        paddingBottom: 100,
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 0,
        marginBottom: 0,
        containerPadding: 24,
        gap: 40,
        gridGap: 40,
        titleFontSize: 40,
        paragraphFontSize: 20,
      },
      mobile: {
        paddingTop: 80,
        paddingBottom: 80,
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 0,
        marginBottom: 0,
        containerPadding: 20,
        gap: 32,
        gridGap: 32,
        titleFontSize: 36,
        paragraphFontSize: 18,
      },
    },
    why: {
      desktop: {
        paddingTop: 100,
        paddingBottom: 100,
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 0,
        marginBottom: 0,
        containerPadding: 24,
        gap: 48,
        gridGap: 48,
        titleFontSize: 44,
        paragraphFontSize: 22,
      },
      tablet: {
        paddingTop: 100,
        paddingBottom: 100,
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 0,
        marginBottom: 0,
        containerPadding: 24,
        gap: 40,
        gridGap: 40,
        titleFontSize: 40,
        paragraphFontSize: 20,
      },
      mobile: {
        paddingTop: 80,
        paddingBottom: 80,
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 0,
        marginBottom: 0,
        containerPadding: 20,
        gap: 32,
        gridGap: 32,
        titleFontSize: 36,
        paragraphFontSize: 18,
      },
    },
    products: {
      desktop: {
        paddingTop: 90,
        paddingBottom: 90,
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 0,
        marginBottom: 0,
        containerPadding: 24,
        gap: 24,
        cardWidth: 360,
        cardHeight: 370,
        cardGap: 24,
        imageHeight: 211,
        bodyHeight: 159,
      },
      tablet: {
        paddingTop: 90,
        paddingBottom: 90,
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 0,
        marginBottom: 0,
        containerPadding: 24,
        gap: 24,
        cardWidth: 360,
        cardHeight: 370,
        cardGap: 24,
        imageHeight: 211,
        bodyHeight: 159,
      },
      mobile: {
        paddingTop: 80,
        paddingBottom: 80,
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 0,
        marginBottom: 0,
        containerPadding: 20,
        gap: 20,
        cardWidth: "calc(50% - 10px)",
        cardHeight: "auto",
        minHeight: 340,
        cardGap: 20,
        imageHeight: "auto",
        minImageHeight: 180,
        bodyHeight: "auto",
        minBodyHeight: 120,
      },
    },
  };

  return defaults[section]?.[device] || {};
};

/**
 * Get dimensions for a section and device, with fallback to defaults
 */
export const getDimensions = (dimensions, section, device = "desktop") => {
  if (!dimensions || !dimensions[section]) {
    return getDefaultDimensions(section, device);
  }
  return {
    ...getDefaultDimensions(section, device),
    ...dimensions[section][device],
  };
};

/**
 * Generate CSS custom properties from dimensions
 */
export const generateDimensionCSS = (
  dimensions,
  section,
  device = "desktop"
) => {
  const dims = getDimensions(dimensions, section, device);
  const cssVars = {};

  Object.keys(dims).forEach((key) => {
    const value = dims[key];
    if (value !== null && value !== undefined) {
      const cssKey = `--${section}-${key
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase()}`;
      cssVars[cssKey] = typeof value === "number" ? `${value}px` : value;
    }
  });

  return cssVars;
};

/**
 * Generate inline styles for a section based on dimensions
 */
export const getSectionStyles = (dimensions, section, device = "desktop") => {
  const dims = getDimensions(dimensions, section, device);
  const styles = {};

  if (dims.paddingTop !== undefined) {
    styles.paddingTop =
      typeof dims.paddingTop === "number"
        ? `${dims.paddingTop}px`
        : dims.paddingTop;
  }
  if (dims.paddingBottom !== undefined) {
    styles.paddingBottom =
      typeof dims.paddingBottom === "number"
        ? `${dims.paddingBottom}px`
        : dims.paddingBottom;
  }
  if (dims.paddingLeft !== undefined) {
    styles.paddingLeft =
      typeof dims.paddingLeft === "number"
        ? `${dims.paddingLeft}px`
        : dims.paddingLeft;
  }
  if (dims.paddingRight !== undefined) {
    styles.paddingRight =
      typeof dims.paddingRight === "number"
        ? `${dims.paddingRight}px`
        : dims.paddingRight;
  }
  if (dims.marginTop !== undefined) {
    styles.marginTop =
      typeof dims.marginTop === "number"
        ? `${dims.marginTop}px`
        : dims.marginTop;
  }
  if (dims.marginBottom !== undefined) {
    styles.marginBottom =
      typeof dims.marginBottom === "number"
        ? `${dims.marginBottom}px`
        : dims.marginBottom;
  }
  if (dims.height !== undefined && section === "hero") {
    styles.height =
      typeof dims.height === "number" ? `${dims.height}px` : dims.height;
  }
  if (dims.minHeight !== undefined) {
    styles.minHeight =
      typeof dims.minHeight === "number"
        ? `${dims.minHeight}px`
        : dims.minHeight;
  }
  if (dims.maxHeight !== undefined && dims.maxHeight !== "none") {
    styles.maxHeight =
      typeof dims.maxHeight === "number"
        ? `${dims.maxHeight}px`
        : dims.maxHeight;
  }

  return styles;
};
