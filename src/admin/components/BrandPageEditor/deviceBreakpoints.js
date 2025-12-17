/**
 * Hardcoded device breakpoints matching Brands.css
 * These breakpoints are fixed and match the CSS media queries exactly
 */

export const DEVICE_BREAKPOINTS = {
  MOBILE_MAX: 767, // <= 767px is mobile
  TABLET_MIN: 768, // >= 768px is tablet
  TABLET_MAX: 1023, // <= 1023px is tablet
  DESKTOP_MIN: 1024, // >= 1024px is desktop
};

/**
 * Detect device type based on window width
 * @param {number} width - Window inner width
 * @returns {'mobile'|'tablet'|'desktop'}
 */
export const detectDevice = (width) => {
  if (width <= DEVICE_BREAKPOINTS.MOBILE_MAX) {
    return "mobile";
  } else if (
    width >= DEVICE_BREAKPOINTS.TABLET_MIN &&
    width <= DEVICE_BREAKPOINTS.TABLET_MAX
  ) {
    return "tablet";
  } else {
    // width >= DEVICE_BREAKPOINTS.DESKTOP_MIN
    return "desktop";
  }
};

/**
 * Get device type from current window
 * @returns {'mobile'|'tablet'|'desktop'}
 */
export const getCurrentDevice = () => {
  if (typeof window !== "undefined") {
    return detectDevice(window.innerWidth);
  }
  return "desktop"; // Default fallback
};
