/**
 * Search Manager Module
 * Handles search functionality with Lunr.js
 * 
 * @module core/search-manager
 */

import { handleFetchError } from '../utils/error-handler.js';
import { API_ENDPOINTS, CONFIG } from '../utils/constants.js';

/**
 * Manages site-wide search functionality using Lunr.js
 * @class SearchManager
 */
class SearchManager {
    /**
     * Create a new SearchManager instance
     * @constructor
     */
    constructor() {
        this.searchIndex = null;
        this.searchData = null;
        this.debounceTimeout = null;
        this.init();
    }

    /**
     * Initialize the search manager by loading and building the search index
     * @method init
     * @async
     */
    async init() {
        try {
            const response = await fetch(API_ENDPOINTS.SEARCH_INDEX);
            if (!response.ok) {
                throw new Error(`Failed to fetch search index: ${response.statusText}`);
            }
            this.searchData = await response.json();

            // Build Lunr index
            const searchData = this.searchData;
            this.searchIndex = lunr(function() {
                this.ref('url');
                this.field('title');
                this.field('content');

                searchData.forEach(doc => {
                    this.add(doc);
                });
            });
        } catch (error) {
            handleFetchError(error, 'initialize search', null);
        }
    }

    /**
     * Handle search input with debouncing
     * @method handleSearch
     * @param {string} query - Search query string
     * @param {HTMLElement} resultsContainer - DOM element to display search results
     */
    handleSearch(query, resultsContainer) {
        clearTimeout(this.debounceTimeout);

        this.debounceTimeout = setTimeout(() => {
            if (!query.trim()) {
                if (resultsContainer) {
                    resultsContainer.innerHTML = '';
                }
                return;
            }

            if (!this.searchIndex) {
                if (resultsContainer) {
                    resultsContainer.innerHTML = '<div class="search-error">Search index not loaded</div>';
                }
                return;
            }

            try {
                const results = this.searchIndex.search(query);
                if (!resultsContainer) return;

                if (results.length === 0) {
                    resultsContainer.innerHTML = '<div class="search-no-results">No results found</div>';
                    return;
                }

                const formattedResults = results
                    .slice(0, CONFIG.SEARCH_RESULTS_LIMIT)
                    .map(result => {
                        const doc = this.searchData.find(d => d.url === result.ref);
                        const preview = doc.content.substring(0, 150) + '...';
                        return `
                            <div class="search-result-item">
                                <a href="${doc.url}">
                                    <h3>${doc.title}</h3>
                                    <p>${preview}</p>
                                </a>
                            </div>
                        `;
                    })
                    .join('');

                resultsContainer.innerHTML = formattedResults;
            } catch (error) {
                handleFetchError(error, 'perform search', resultsContainer);
            }
        }, CONFIG.SEARCH_DEBOUNCE_MS);
    }
}

// Export singleton instance
export const searchManager = new SearchManager();

// Export class for testing
export { SearchManager };

