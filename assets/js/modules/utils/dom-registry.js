/**
 * DOM Element Registry Utility
 * Centralizes DOM element queries to eliminate duplication and improve maintainability
 * 
 * @module utils/dom-registry
 */

/**
 * Registry of commonly accessed DOM elements
 * Elements are cached after first access for performance
 * @type {Map<string, HTMLElement>}
 */
const elementCache = new Map();

/**
 * Element ID constants to prevent typos and enable refactoring
 * @constant {Object}
 */
export const ELEMENT_IDS = {
    // Overlay elements
    CARD_OVERLAY: 'cardOverlay',
    EXPANDED_CONTENT: 'expandedContent',
    PHOTO_OVERLAY: 'photoOverlay',
    EXPANDED_PHOTO_CONTENT: 'expandedPhotoContent',
    
    // Search elements
    SEARCH_OVERLAY: 'searchOverlay',
    SEARCH_INPUT: 'searchInput',
    SEARCH_RESULTS: 'searchResults',
    SEARCH_CONTAINER: 'searchContainer',
    
    // News elements
    NEWS_CONTAINER: 'newsContainer',
    ALL_NEWS_CONTAINER: 'allNewsContainer',
    
    // Theme preview containers
    SUPERCONDUCTING_PREVIEW: 'superconducting-preview',
    QEC_PREVIEW: 'qec-preview',
    TENSOR_PREVIEW: 'tensor-preview',
    NEURAL_PREVIEW: 'neural-preview'
};

/**
 * Get a DOM element by ID with caching
 * @param {string} id - Element ID
 * @param {boolean} useCache - Whether to use cache (default: true)
 * @returns {HTMLElement|null} The element or null if not found
 */
export function getElement(id, useCache = true) {
    if (useCache && elementCache.has(id)) {
        return elementCache.get(id);
    }
    
    const element = document.getElementById(id);
    if (element && useCache) {
        elementCache.set(id, element);
    }
    
    return element;
}

/**
 * Get multiple elements by their IDs
 * @param {string[]} ids - Array of element IDs
 * @returns {Object<string, HTMLElement|null>} Object mapping IDs to elements
 */
export function getElements(ids) {
    const result = {};
    ids.forEach(id => {
        result[id] = getElement(id);
    });
    return result;
}

/**
 * Clear the element cache (useful for testing or when DOM changes significantly)
 */
export function clearCache() {
    elementCache.clear();
}

/**
 * Invalidate a specific element in the cache (useful when element is removed/replaced)
 * @param {string} id - Element ID to invalidate
 */
export function invalidateCache(id) {
    elementCache.delete(id);
}

/**
 * Query selector wrapper with optional caching
 * @param {string} selector - CSS selector
 * @param {HTMLElement} root - Root element to search from (default: document)
 * @returns {HTMLElement|null} First matching element or null
 */
export function querySelector(selector, root = document) {
    return root.querySelector(selector);
}

/**
 * Query selector all wrapper
 * @param {string} selector - CSS selector
 * @param {HTMLElement} root - Root element to search from (default: document)
 * @returns {NodeList} All matching elements
 */
export function querySelectorAll(selector, root = document) {
    return root.querySelectorAll(selector);
}

/**
 * Get element by ID using constant (type-safe wrapper)
 * @param {string} idConstant - Element ID from ELEMENT_IDS constant
 * @returns {HTMLElement|null} The element or null if not found
 */
export function getElementById(idConstant) {
    return getElement(idConstant);
}

