/**
 * Home Page Module - Modular Version
 * Replaces home.js with ES6 module-based architecture
 */

import { ThemeManager } from './modules/components/theme-manager.js';
import { loadNews } from './modules/components/news-loader.js';
import { setAnimationDelays, autoSizeText, initializeIntroImageClick } from './modules/utils/home-utilities.js';
import { registerService, SERVICE_NAMES } from './modules/utils/service-registry.js';

// Global instance for backward compatibility
let themeManager;

/**
 * Initialize home page
 * @function initHomePage
 * @async
 */
async function initHomePage() {
    themeManager = new ThemeManager();
    
    // Register theme manager in service registry
    registerService(SERVICE_NAMES.THEME_MANAGER, themeManager);
    
    // Load projects data asynchronously
    await themeManager.loadProjectsData();
    
    // Populate previews after data is loaded
    themeManager.populatePreviews();
    
    // Initialize other components
    setAnimationDelays();
    autoSizeText();
    initializeIntroImageClick();
    loadNews();
    
    // Set up resize listener for auto-sizing
    window.addEventListener('resize', autoSizeText);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initHomePage);

