# Fixed Dimensions Guide - CMS & Live Website

## Overview
All icons, images, and videos in the CMS dashboard and live website now use **exact fixed dimensions** matching the main website design.

## Fixed Dimensions Implemented

### 1. **Hero Section**
- **Section Height**: `1226px` (fixed)
- **Video**: 
  - Width: `100%`
  - Height: `100%`
  - Object-fit: `cover`
  - Object-position: `center center`

### 2. **Feature Cards Icons (Why Section)**
- **Desktop (≥769px)**:
  - Icon Container: `60px × 60px` (fixed)
  - Icon Image: `60px × 60px` (fixed)
  - Object-fit: `contain`

- **Tablet (≤1024px)**:
  - Icon Container: `54px × 54px` (fixed)
  - Icon Image: `27px × 27px` (fixed)

- **Mobile (≤720px)**:
  - Icon Container: `50px × 50px` (fixed)
  - Icon Image: `25px × 25px` (fixed)

### 3. **Images in CMS Dashboard**
- **Preview Images (Section Cards)**:
  - Width: `100%`
  - Max-height: `200px`
  - Min-height: `150px`
  - Object-fit: `cover`
  - Object-position: `center center`

- **Image Selector Preview**:
  - Width: `200px` (fixed)
  - Height: `150px` (fixed)
  - Object-fit: `cover`

- **Image Selector Grid Items**:
  - Height: `120px` (fixed)
  - Object-fit: `cover`

### 4. **Text + Image Section**
- Images maintain aspect ratio
- Width: `100%`
- Height: `auto`
- Object-fit: `cover`

## CSS Classes Added

### Dynamic Sections CSS (`DynamicSections.css`)
- `.dynamic-hero-section` - Fixed hero height (1226px)
- `.dynamic-hero-video` - Fixed video dimensions
- `.dynamic-why-icon` - Fixed icon container (60px × 60px)
- `.dynamic-image-container` - Fixed image container
- `.dynamic-video` - Fixed video dimensions

## Responsive Breakpoints

### Desktop (≥769px)
- Hero: 1226px height
- Icons: 60px × 60px

### Tablet (≤1024px)
- Hero: Auto height
- Icons: 54px × 54px container, 27px × 27px image

### Mobile (≤720px)
- Hero: Auto height
- Icons: 50px × 50px container, 25px × 25px image

## Implementation Details

### Hero Section
```css
.dynamic-hero-section {
  height: 1226px !important;
  min-height: 1226px !important;
}

.dynamic-hero-video {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}
```

### Feature Icons
```css
.dynamic-why-icon {
  width: 60px !important;
  height: 60px !important;
  min-width: 60px !important;
  max-width: 60px !important;
  min-height: 60px !important;
  max-height: 60px !important;
}
```

## Benefits

✅ **Consistent Sizing** - All images/icons maintain exact dimensions
✅ **No Distortion** - Object-fit ensures proper aspect ratio
✅ **Responsive** - Dimensions adjust at breakpoints
✅ **Professional Look** - Fixed dimensions prevent layout shifts
✅ **CMS Preview** - Preview shows exact dimensions as live site

## Files Modified

1. `src/components/DynamicSections/HeroSection.jsx` - Fixed hero dimensions
2. `src/components/DynamicSections/FeatureCardsSection.jsx` - Fixed icon dimensions
3. `src/components/DynamicSections/TextImageSection.jsx` - Fixed image dimensions
4. `src/components/DynamicSections/DynamicSections.css` - New CSS file with fixed dimensions
5. `src/admin/components/HomeSectionCard/HomeSectionCard.css` - Fixed preview image dimensions
6. `src/admin/components/ImageSelector/ImageSelector.css` - Fixed image selector dimensions

## Testing

To verify fixed dimensions:
1. Check hero section height is exactly 1226px
2. Verify icons are exactly 60px × 60px on desktop
3. Check images maintain proper aspect ratio
4. Test responsive breakpoints for icon size changes
5. Verify CMS preview shows same dimensions as live site

## Notes

- All dimensions use `!important` to ensure they override any conflicting styles
- Object-fit: `cover` for videos/images ensures they fill containers properly
- Object-fit: `contain` for icons ensures they don't get cropped
- Responsive breakpoints match the main website exactly

