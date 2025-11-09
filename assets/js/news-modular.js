/**
 * News Page Module - Modular Version
 * Replaces news.js with ES6 module-based architecture
 */

import { loadAllNews } from './modules/components/news-manager.js';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAllNews();
});

