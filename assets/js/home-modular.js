/**
 * Home Page Module - Modular Version
 * Replaces home.js with ES6 module-based architecture
 */

import { loadNews } from './modules/components/news-loader.js';
import { setAnimationDelays, autoSizeText, initializeIntroImageClick } from './modules/utils/home-utilities.js';

/**
 * Initialize home page
 * @function initHomePage
 * @async
 */
async function initHomePage() {
    setAnimationDelays();
    autoSizeText();
    initializeIntroImageClick();
    loadNews();

    // Set up resize listener for auto-sizing
    window.addEventListener('resize', autoSizeText);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initHomePage);
