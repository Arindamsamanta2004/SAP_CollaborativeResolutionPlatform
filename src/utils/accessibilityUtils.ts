/**
 * Accessibility utility functions for the SAP CRP Demo application
 * Implements WCAG 2.1 compliance helpers
 */

/**
 * Creates an accessible announcement for screen readers
 * @param message The message to announce
 * @param priority Whether the announcement is polite (default) or assertive
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  // Create or get the live region element
  let liveRegion = document.getElementById('accessibility-live-region');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'accessibility-live-region';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);
  } else {
    liveRegion.setAttribute('aria-live', priority);
  }
  
  // Set the message
  liveRegion.textContent = message;
  
  // Clear the message after a delay (optional)
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = '';
    }
  }, 3000);
};

/**
 * Adds keyboard focus trap to modal dialogs
 * @param dialogRef Reference to the dialog element
 * @param focusableSelector Selector for focusable elements
 * @returns Cleanup function
 */
export const trapFocus = (dialogRef: HTMLElement, focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') => {
  const focusableElements = dialogRef.querySelectorAll(focusableSelector);
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  // Set initial focus
  firstElement?.focus();
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
    
    // Close on escape
    if (e.key === 'Escape') {
      const closeButton = dialogRef.querySelector('[data-close-dialog]') as HTMLElement;
      closeButton?.click();
    }
  };
  
  dialogRef.addEventListener('keydown', handleTabKey);
  
  // Return cleanup function
  return () => {
    dialogRef.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Enhances a component with keyboard navigation
 * @param containerRef Reference to the container element
 * @param itemSelector Selector for navigable items
 * @param onSelect Callback when an item is selected
 * @param vertical Whether navigation is vertical (true) or horizontal (false)
 */
export const enableKeyboardNavigation = (
  containerRef: HTMLElement,
  itemSelector: string,
  onSelect: (item: HTMLElement) => void,
  vertical = true
) => {
  const items = containerRef.querySelectorAll(itemSelector);
  let currentIndex = -1;
  
  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key;
    const itemsArray = Array.from(items) as HTMLElement[];
    
    // Find current focused item
    currentIndex = itemsArray.findIndex(item => item === document.activeElement);
    
    if (vertical && (key === 'ArrowDown' || key === 'ArrowUp')) {
      e.preventDefault();
      
      if (key === 'ArrowDown') {
        currentIndex = (currentIndex + 1) % items.length;
      } else {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
      }
      
      (items[currentIndex] as HTMLElement).focus();
    } else if (!vertical && (key === 'ArrowRight' || key === 'ArrowLeft')) {
      e.preventDefault();
      
      if (key === 'ArrowRight') {
        currentIndex = (currentIndex + 1) % items.length;
      } else {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
      }
      
      (items[currentIndex] as HTMLElement).focus();
    } else if (key === 'Enter' || key === ' ') {
      e.preventDefault();
      if (currentIndex >= 0) {
        onSelect(items[currentIndex] as HTMLElement);
      }
    }
  };
  
  containerRef.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => {
    containerRef.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Adds skip link functionality for keyboard users
 */
export const setupSkipToMainContent = () => {
  const skipLink = document.getElementById('skip-to-main');
  const mainContent = document.getElementById('main-content');
  
  if (skipLink && mainContent) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      
      // Remove tabindex after focus to prevent weird focus behavior
      setTimeout(() => {
        mainContent.removeAttribute('tabindex');
      }, 1000);
    });
  }
};

/**
 * Checks contrast ratio between foreground and background colors
 * @param foreground Foreground color in hex format
 * @param background Background color in hex format
 * @returns Contrast ratio
 */
export const checkContrastRatio = (foreground: string, background: string): number => {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };
  
  // Calculate relative luminance
  const getLuminance = (color: { r: number, g: number, b: number }) => {
    const { r, g, b } = color;
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };
  
  const color1 = hexToRgb(foreground);
  const color2 = hexToRgb(background);
  
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  
  const brightest = Math.max(luminance1, luminance2);
  const darkest = Math.min(luminance1, luminance2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};