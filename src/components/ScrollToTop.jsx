import { useEffect, useLayoutEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  // Comprehensive scroll function that tries all possible methods
  const scrollToTop = useCallback(() => {
    // Try all scroll methods to ensure it works regardless of scroll container
    try {
      // Method 1: window.scrollTo (most reliable)
      window.scrollTo(0, 0);
      
      // Method 2: window.scrollTo with options (for smooth scroll prevention)
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    } catch (e) {
      // Fallback
      window.scrollTo(0, 0);
    }
    
    // Method 3: Direct scrollTop assignment for documentElement
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
    }
    
    // Method 4: Direct scrollTop assignment for body
    if (document.body) {
      document.body.scrollTop = 0;
      document.body.scrollLeft = 0;
    }
    
    // Method 5: Check for root element
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.scrollTop = 0;
      rootElement.scrollLeft = 0;
    }
    
    // Method 6: Check for App container
    const appContainer = document.querySelector('.App');
    if (appContainer) {
      appContainer.scrollTop = 0;
      appContainer.scrollLeft = 0;
    }
    
    // Method 7: Try scrollIntoView on html element
    try {
      if (document.documentElement) {
        document.documentElement.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  // Disable browser's automatic scroll restoration on mount
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    // Also scroll on initial mount
    scrollToTop();
  }, [scrollToTop]);

  // Use useLayoutEffect to scroll synchronously before browser paint
  // This prevents visible glitching
  useLayoutEffect(() => {
    scrollToTop();
  }, [pathname, scrollToTop]);

  // Use useEffect with strategic delays to catch late-loading content
  // This ensures scroll works even if content loads after initial render
  useEffect(() => {
    // Immediate scroll
    scrollToTop();
    
    // Scroll after next frame (catches content that renders after paint)
    let rafId2 = null;
    const rafId1 = requestAnimationFrame(() => {
      scrollToTop();
      
      // Double RAF for better coverage
      rafId2 = requestAnimationFrame(() => {
        scrollToTop();
      });
    });
    
    // Scroll after short delays (catches images and async content)
    const timeoutId1 = setTimeout(() => {
      scrollToTop();
    }, 50);
    
    const timeoutId2 = setTimeout(() => {
      scrollToTop();
    }, 150);
    
    const timeoutId3 = setTimeout(() => {
      scrollToTop();
    }, 300);

    return () => {
      cancelAnimationFrame(rafId1);
      if (rafId2 !== null) {
        cancelAnimationFrame(rafId2);
      }
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
    };
  }, [pathname, scrollToTop]);

  return null;
}

