/**
 * Mobile Menu Manager
 * Handles mobile navigation menu toggle
 * 
 * @module utils/mobile-menu
 */

import { querySelector, querySelectorAll } from './dom-registry.js';
import { CSS_CLASSES } from './constants.js';
import { handleFetchError } from './error-handler.js';

/**
 * Manages mobile navigation menu toggle functionality
 * @class MobileMenuManager
 */
class MobileMenuManager {
    /**
     * Create a new MobileMenuManager instance
     * @constructor
     */
    constructor() {
        this.hamburger = null;
        this.navMenu = null;
        this.init();
    }

    /**
     * Initialize the mobile menu manager by caching DOM elements and setting up event listeners
     * @method init
     */
    init() {
        this.hamburger = querySelector('.hamburger');
        this.navMenu = querySelector('.nav-menu');

        // Close menu when clicking on a link
        document.addEventListener('DOMContentLoaded', () => {
            const menuLinks = querySelectorAll('.nav-menu .menu-link > a');
            menuLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (this.hamburger && this.navMenu && this.navMenu.classList.contains(CSS_CLASSES.ACTIVE)) {
                        this.hamburger.classList.remove(CSS_CLASSES.ACTIVE);
                        this.navMenu.classList.remove(CSS_CLASSES.ACTIVE);
                    }
                });
            });
        });
    }

    /**
     * Toggle mobile menu visibility
     * @method toggle
     */
    toggle() {
        if (this.hamburger && this.navMenu) {
            this.hamburger.classList.toggle(CSS_CLASSES.ACTIVE);
            this.navMenu.classList.toggle(CSS_CLASSES.ACTIVE);
        } else {
            handleFetchError(
                new Error('Could not find hamburger or nav-menu elements'),
                'toggle mobile menu',
                null
            );
        }
    }
}

// Export singleton instance
export const mobileMenuManager = new MobileMenuManager();

// Export class for testing
export { MobileMenuManager };

