/**
 * Overlay Manager Module
 * Consolidates overlay logic for card expansion, photo expansion, and search
 * Eliminates code duplication between main.js and home.js
 * 
 * @module core/overlay-manager
 */

import { getElement, ELEMENT_IDS } from '../utils/dom-registry.js';
import { handleFetchError } from '../utils/error-handler.js';

/**
 * Manages all overlay functionality including card expansion, photo expansion, and search overlay
 * @class OverlayManager
 */
class OverlayManager {
    constructor() {
        this.cardOverlay = null;
        this.cardContent = null;
        this.searchOverlay = null;
        this.searchInput = null;
        this.searchResults = null;
        // Initialize immediately if DOM is ready, otherwise wait
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the overlay manager by caching DOM elements and setting up event listeners
     * @method init
     */
    init() {
        // Cache DOM elements using centralized registry
        this.cardOverlay = getElement(ELEMENT_IDS.CARD_OVERLAY);
        this.cardContent = getElement(ELEMENT_IDS.EXPANDED_CONTENT);
        this.searchOverlay = getElement(ELEMENT_IDS.SEARCH_OVERLAY);
        this.searchInput = getElement(ELEMENT_IDS.SEARCH_INPUT);
        this.searchResults = getElement(ELEMENT_IDS.SEARCH_RESULTS);

        // Ensure overlays are hidden on initialization
        if (this.cardOverlay) {
            this.cardOverlay.hidden = true;
            this.cardOverlay.classList.remove('active');
            this.cardOverlay.style.display = 'none';
            this.cardOverlay.style.visibility = 'hidden';
            this.cardOverlay.style.top = '0';
        }
        
        const photoOverlay = getElement(ELEMENT_IDS.PHOTO_OVERLAY);
        if (photoOverlay) {
            photoOverlay.hidden = true;
            photoOverlay.style.display = 'none';
            photoOverlay.style.visibility = 'hidden';
        }

        // Set up keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.searchOverlay?.classList.contains('search-active')) {
                    this.closeSearch();
                }
                if (this.cardOverlay?.classList.contains('active') || 
                    this.cardOverlay?.style.display === 'flex') {
                    this.closeCard();
                }
            }
        });
    }

    /**
     * Show overlay with provided content HTML
     * Unified method for displaying overlay content (eliminates duplication)
     * Used by expandCard(), expandPhoto(), and theme-manager.expandTheme()
     * @param {string} contentHtml - HTML content to display in overlay
     * @param {Object} options - Configuration options
     * @param {boolean} options.useLegacyDisplay - Use display:flex instead of class (for backward compatibility)
     * @returns {boolean} True if overlay was shown successfully, false otherwise
     */
    showOverlayWithContent(contentHtml, options = {}) {
        if (!this.cardOverlay || !this.cardContent) {
            console.error('[Overlay] Card overlay elements not found');
            handleFetchError(
                new Error('Card overlay elements not found'),
                'show overlay',
                null
            );
            return false;
        }

        // Defensive check: don't show overlay if content is empty
        if (!contentHtml || !contentHtml.trim()) {
            console.warn('[Overlay] Attempted to show overlay with empty content');
            return false;
        }

        // Set content first
        this.cardContent.innerHTML = contentHtml;

        // Properly remove hidden attribute (setting hidden = false doesn't remove the attribute)
        this.cardOverlay.removeAttribute('hidden');
        
        // Reset any inline positioning that might interfere
        // Overlay is position: fixed, so it should be at top: 0, not scroll position
        this.cardOverlay.style.top = '0';
        this.cardOverlay.style.left = '0';

        // Add active class FIRST (required by CSS)
        this.cardOverlay.classList.add('active');
        
        // Then set display styles - ensure they're set explicitly
            this.cardOverlay.style.display = 'flex';
            this.cardOverlay.style.visibility = 'visible';
        this.cardOverlay.style.opacity = '1';
        
        // Ensure expanded-card is visible
        const expandedCard = this.cardOverlay.querySelector('.expanded-card');
        if (expandedCard) {
            expandedCard.style.display = 'flex';
            expandedCard.style.visibility = 'visible';
            expandedCard.style.position = 'relative';
            expandedCard.style.zIndex = '1';
            
            // Use CSS backdrop-filter for glass effect (shows DOM content, not just background image)
            // No WebGL needed - CSS backdrop-filter handles DOM content blurring natively
        }

        // Verify overlay is actually visible before freezing page
        // Use requestAnimationFrame to ensure CSS has applied
        requestAnimationFrame(() => {
            const computedStyle = window.getComputedStyle(this.cardOverlay);
            const expandedCard = this.cardOverlay.querySelector('.expanded-card');
            const expandedCardStyle = expandedCard ? window.getComputedStyle(expandedCard) : null;
            
            const isVisible = this.cardOverlay && 
                            !this.cardOverlay.hasAttribute('hidden') &&
                            this.cardOverlay.classList.contains('active') &&
                            computedStyle.display !== 'none' &&
                            computedStyle.visibility !== 'hidden' &&
                            computedStyle.opacity !== '0';
            
            // Also check if expanded-card is visible
            const cardVisible = expandedCard && 
                              expandedCardStyle &&
                              expandedCardStyle.display !== 'none' &&
                              expandedCardStyle.visibility !== 'hidden';
            
            // Check content
            const hasContent = this.cardContent && this.cardContent.innerHTML.trim().length > 0;
            
            // Log detailed state
            console.log('[Overlay] Detailed visibility check:', {
                overlay: {
                    exists: !!this.cardOverlay,
                    hasHidden: this.cardOverlay?.hasAttribute('hidden'),
                    hasActive: this.cardOverlay?.classList.contains('active'),
                    display: computedStyle.display,
                    visibility: computedStyle.visibility,
                    opacity: computedStyle.opacity,
                    zIndex: computedStyle.zIndex,
                    position: computedStyle.position,
                    top: computedStyle.top,
                    left: computedStyle.left,
                    width: computedStyle.width,
                    height: computedStyle.height,
                    rect: this.cardOverlay?.getBoundingClientRect()
                },
                expandedCard: {
                    exists: !!expandedCard,
                    display: expandedCardStyle?.display,
                    visibility: expandedCardStyle?.visibility,
                    rect: expandedCard?.getBoundingClientRect()
                },
                content: {
                    exists: !!this.cardContent,
                    hasContent: hasContent,
                    contentLength: this.cardContent?.innerHTML.length
                },
                isVisible: isVisible,
                cardVisible: cardVisible
            });
            
            if (isVisible && cardVisible && hasContent) {
                // Only freeze scrolling if overlay is actually visible
        document.body.style.overflow = 'hidden';
                console.log('[Overlay] Overlay shown successfully, scrolling frozen');
            } else {
                console.error('[Overlay] Overlay failed visibility check:', {
                    overlayVisible: isVisible,
                    cardVisible: cardVisible,
                    hasContent: hasContent
                });
                // Restore scrolling if overlay didn't show
                document.body.style.overflow = '';
            }
        });

        return true;
    }

    /**
     * Expand a card by fetching content from a URL
     * @param {string} cardId - The card identifier or URL path
     * @param {Object} options - Configuration options
     * @param {boolean} options.useLegacyDisplay - Use display:flex instead of class (for backward compatibility)
     */
    async expandCard(cardId, options = {}) {
        if (!this.cardOverlay || !this.cardContent) {
            handleFetchError(
                new Error('Card overlay elements not found'),
                'initialize card overlay',
                null
            );
            return;
        }

        // Determine fetch path (declare outside try for error handling)
        let fetchPath;

        try {
            // Determine fetch path
            if (cardId.startsWith('/') || cardId.startsWith('http')) {
                // Already a full path - normalize to .html extension
                fetchPath = cardId;
                // Remove trailing slash if present
                if (fetchPath.endsWith('/')) {
                    fetchPath = fetchPath.slice(0, -1);
                }
                // Append .html if not already present and not an external URL
                if (!fetchPath.startsWith('http') && !fetchPath.endsWith('.html')) {
                    fetchPath = fetchPath + '.html';
                }
            } else if (cardId.includes('past_projects')) {
                fetchPath = `/${cardId}.html`;
            } else {
                fetchPath = `/potential_directions/${cardId}.html`;
            }

            console.log('[Card Expansion] Fetching URL:', fetchPath);
            console.log('[Card Expansion] Original cardId:', cardId);

            const response = await fetch(fetchPath);
            console.log('[Card Expansion] Response status:', response.status, response.statusText);
            console.log('[Card Expansion] Response headers:', {
                'content-type': response.headers.get('content-type'),
                'content-length': response.headers.get('content-length')
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch ${fetchPath}: ${response.status} ${response.statusText}`);
            }

            const html = await response.text();
            console.log('[Card Expansion] HTML received, length:', html.length);
            console.log('[Card Expansion] HTML preview:', html.substring(0, 500));
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Check for parser errors
            const parserError = doc.querySelector('parsererror');
            if (parserError) {
                console.error('[Card Expansion] HTML parser error:', parserError.textContent);
                throw new Error(`Failed to parse HTML from ${fetchPath}`);
            }
            
            const mainElement = doc.querySelector('main');
            console.log('[Card Expansion] Main element found:', !!mainElement);
            
            if (mainElement) {
                console.log('[Card Expansion] Main element HTML length:', mainElement.innerHTML.length);
                console.log('[Card Expansion] Main element preview:', mainElement.innerHTML.substring(0, 200));
            }
            
            const mainContent = mainElement?.innerHTML || '';

            // Check if content is empty
            if (!mainContent.trim()) {
                console.error('[Card Expansion] Main content is empty');
                console.error('[Card Expansion] Available elements:', Array.from(doc.querySelectorAll('*')).map(el => el.tagName).slice(0, 10));
                throw new Error(`No content found in ${fetchPath}. The page may be empty or the selector failed. Available elements: ${doc.querySelectorAll('*').length}`);
            }

            console.log('[Card Expansion] Content loaded successfully, length:', mainContent.length);
            console.log('[Card Expansion] Content preview:', mainContent.substring(0, 200));

            // Use unified method to show overlay with content
            const shown = this.showOverlayWithContent(mainContent, options);
            if (!shown) {
                console.error('[Card Expansion] Failed to show overlay, restoring scrolling');
                document.body.style.overflow = '';
            }
        } catch (error) {
            console.error('[Card Expansion] Error:', error);
            console.error('[Card Expansion] Error stack:', error.stack);
            
            // Show error message in overlay so user can see what went wrong
            const errorMessage = `<div style="padding: 2em; text-align: center;">
                <h2>Error Loading Content</h2>
                <p>${error.message}</p>
                <p style="margin-top: 1em; font-size: 0.9em; color: #888;">URL attempted: ${cardId}</p>
                <p style="margin-top: 0.5em; font-size: 0.85em; color: #666;">Fetch path: ${fetchPath || 'N/A'}</p>
                <button id="error-close-btn" style="margin-top: 1em; padding: 0.5em 1em; cursor: pointer; background: #5d8fb3; color: white; border: none; border-radius: 4px;">Close</button>
            </div>`;
            
            const errorShown = this.showOverlayWithContent(errorMessage, options);
            if (!errorShown) {
                // If we can't show error in overlay, restore scrolling immediately
                console.error('[Card Expansion] Failed to show error overlay, restoring scrolling');
                document.body.style.overflow = '';
            } else {
                // Set up close button handler
                requestAnimationFrame(() => {
                    const closeBtn = this.cardContent?.querySelector('#error-close-btn');
                    if (closeBtn) {
                        closeBtn.addEventListener('click', () => {
                            this.closeCard();
                        });
                    } else {
                        console.warn('[Card Expansion] Close button not found in error overlay');
                    }
                });
            }
            
            // Also log to console for debugging
            handleFetchError(error, 'load card content', null);
            
            // Safety timeout: restore scrolling if overlay doesn't show within 2 seconds
            setTimeout(() => {
                if (this.cardOverlay && 
                    (this.cardOverlay.hasAttribute('hidden') || 
                     !this.cardOverlay.classList.contains('active') ||
                     window.getComputedStyle(this.cardOverlay).display === 'none')) {
                    console.warn('[Card Expansion] Safety timeout: overlay not visible after 2s, restoring scrolling');
                    document.body.style.overflow = '';
                }
            }, 2000);
        }
    }

    /**
     * Close the expanded card overlay
     * @method closeCard
     */
    closeCard() {
        if (!this.cardOverlay) {
            // Even if overlay doesn't exist, ensure scrolling is restored
            document.body.style.overflow = '';
            return;
        }

        // No cleanup needed - CSS backdrop-filter doesn't require JavaScript cleanup

        // Hide overlay completely
        this.cardOverlay.setAttribute('hidden', '');
        this.cardOverlay.style.display = 'none';
        this.cardOverlay.style.visibility = 'hidden';
        this.cardOverlay.classList.remove('active');
        this.cardOverlay.style.top = '0';
        
        // Always restore scrolling
        document.body.style.overflow = '';
        console.log('[Overlay] Card closed, scrolling restored');

        // Clear content
        if (this.cardContent) {
            this.cardContent.innerHTML = '';
        }
    }

    /**
     * Expand a photo in the overlay
     * @param {string} src - Image source URL
     * @param {string} caption - Image caption
     */
    expandPhoto(src, caption) {
        const photoContent = `
            <img src="${src}" alt="${caption}" style="max-width: 100%; max-height: 80vh; object-fit: contain;">
            <p style="text-align: center; margin-top: 1em;">${caption}</p>
        `;

        // Use unified method to show overlay with content
        this.showOverlayWithContent(photoContent);
    }

    /**
     * Toggle search overlay visibility
     * @method toggleSearch
     */
    toggleSearch() {
        if (!this.searchOverlay || !this.searchInput) return;

        const isActive = this.searchOverlay.classList.contains('search-active');
        this.searchOverlay.classList.toggle('search-active');
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.classList.toggle('search-active');
        }

        if (!isActive) {
            this.searchInput.focus();
        }
    }

    /**
     * Close search overlay and clear results
     * @method closeSearch
     */
    closeSearch() {
        if (!this.searchOverlay) return;

        this.searchOverlay.classList.remove('search-active');
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.classList.remove('search-active');
        }

        if (this.searchResults) {
            this.searchResults.innerHTML = '';
        }
    }
}

// Export singleton instance
export const overlayManager = new OverlayManager();

// Export class for testing
export { OverlayManager };

