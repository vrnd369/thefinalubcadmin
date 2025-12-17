# Live Preview Feature - Home Management CMS

## Overview
The Live Preview feature allows you to see your home page in real-time within the CMS dashboard. You can preview changes immediately after saving them.

## Features

### 1. **Component Preview Mode** (Default)
- Renders the actual Home component directly in the dashboard
- Shows the current state of your home page
- Fast and responsive
- Best for seeing component structure

### 2. **Iframe Preview Mode**
- Shows your live website in an iframe
- Displays the actual published website
- Updates when you refresh
- Best for seeing the exact user experience

### 3. **Auto-Refresh**
- Preview automatically refreshes when you:
  - Save a section
  - Delete a section
  - Enable/disable a section
  - Import sections
  - Load sections

### 4. **Manual Refresh**
- Click the "🔄 Refresh" button to manually refresh the preview
- Useful if changes don't appear automatically

## How to Use

### Viewing the Preview
1. Navigate to `/admin/home` (Home Management)
2. Scroll down to see the "Live Home Page Preview" section
3. The preview appears below the header and above the sections list

### Switching Preview Modes
1. Click "🖼️ Switch to Live URL" to view in iframe mode
2. Click "📄 Switch to Component" to view in component mode
3. Use iframe mode to see the actual live website
4. Use component mode for faster preview of component structure

### Refreshing the Preview
- **Automatic**: Preview refreshes when you save, delete, or toggle sections
- **Manual**: Click the "🔄 Refresh" button

## Preview Behavior

### Component Mode
- Shows the Home component as it's currently coded
- Displays static components (Hero, BrandsSection, WhySection, etc.)
- **Note**: If you want to see CMS changes in this mode, you need to make `Home.jsx` dynamic to fetch from Firebase

### Iframe Mode
- Shows your actual live website
- Displays whatever is currently published
- **Note**: CMS changes will only appear here if your live website is fetching from Firebase

## Making Preview Show CMS Changes

To see your CMS changes in the preview, you have two options:

### Option 1: Make Home.jsx Dynamic (Recommended)
Update `src/pages/Home.jsx` to fetch sections from Firebase:

```javascript
import React, { useState, useEffect } from 'react';
import { getHomeSections } from '../admin/services/homeService';
// ... import section renderers

export default function Home() {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const loadSections = async () => {
      try {
        const allSections = await getHomeSections();
        const enabled = allSections
          .filter(s => s.enabled)
          .sort((a, b) => a.order - b.order);
        setSections(enabled);
      } catch (error) {
        console.error('Error loading sections:', error);
        // Fallback to static components
      }
    };
    loadSections();
  }, []);

  // Render sections dynamically based on type
  // ...
}
```

### Option 2: Use Iframe Mode
- Keep Home.jsx static
- Use iframe mode to see your live website
- Deploy changes to see them in preview

## Preview Styling

The preview is styled to:
- Show the full home page in a scrollable container
- Maintain proper spacing and layout
- Display at a comfortable size (max 80vh height)
- Be responsive on mobile devices

## Tips

1. **For Development**: Use Component mode for faster iteration
2. **For Production**: Use Iframe mode to see the actual user experience
3. **After Changes**: Always refresh to see latest updates
4. **Mobile Preview**: The preview is responsive and shows mobile layout

## Troubleshooting

**Preview not showing?**
- Check browser console for errors
- Make sure Home component is imported correctly
- Try refreshing manually

**Changes not appearing?**
- Make sure you clicked "Save" on the section
- Try clicking the refresh button
- Check if the section is enabled
- If using component mode, make sure Home.jsx is dynamic

**Iframe not loading?**
- Check if your website URL is correct
- Make sure CORS allows iframe embedding
- Try component mode instead

## Benefits

✅ **See Changes Immediately** - No need to navigate away from CMS
✅ **Two Preview Modes** - Component or iframe based on your needs
✅ **Auto-Refresh** - Preview updates automatically after saves
✅ **Easy Comparison** - See before/after changes side by side
✅ **Better UX** - Visual feedback for all your edits

