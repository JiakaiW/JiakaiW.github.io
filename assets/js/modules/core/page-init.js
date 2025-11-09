/**
 * Page Initialization Module
 * Handles common page setup tasks and registers services in the service registry
 * 
 * @module core/page-init
 */

import { overlayManager } from './overlay-manager.js';
import { searchManager } from './search-manager.js';
import { mobileMenuManager } from '../utils/mobile-menu.js';
import { setupEventDelegation } from '../utils/event-delegation.js';
import { registerService, SERVICE_NAMES } from '../utils/service-registry.js';
import { getElement, ELEMENT_IDS } from '../utils/dom-registry.js';
import { CSS_CLASSES } from '../utils/constants.js';

// Register services in service registry
registerService(SERVICE_NAMES.OVERLAY_MANAGER, overlayManager);
registerService(SERVICE_NAMES.SEARCH_MANAGER, searchManager);
registerService(SERVICE_NAMES.MOBILE_MENU_MANAGER, mobileMenuManager);

/**
 * Initialize page setup
 * @function initPage
 */
function initPage() {
    // Always use dark mode
    document.body.classList.add(CSS_CLASSES.DARK_MODE);

    // Set up event delegation for data-action attributes
    setupEventDelegation();

    // Add figure-caption class to captions (without numbering)
    document.querySelectorAll('img').forEach(img => {
        const caption = img.nextElementSibling;
        if (caption && caption.tagName.toLowerCase() === 'p') {
            caption.classList.add('figure-caption');
        }
    });

    // Set up search input handler (for direct event listeners, event delegation also handles data-action="search")
    const searchInput = getElement(ELEMENT_IDS.SEARCH_INPUT);
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const resultsContainer = getElement(ELEMENT_IDS.SEARCH_RESULTS);
            searchManager.handleSearch(e.target.value, resultsContainer);
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            overlayManager.toggleSearch();
        }
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', initPage);

