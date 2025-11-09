/**
 * Constants Module
 * Centralizes all magic strings, IDs, and configuration values
 * Prevents typos and enables safe refactoring
 * 
 * @module utils/constants
 */

/**
 * Theme IDs used throughout the application
 * @constant {Object}
 */
export const THEME_IDS = {
    SUPERCONDUCTING: 'superconducting',
    QEC: 'qec',
    TENSOR: 'tensor',
    NEURAL: 'neural'
};

/**
 * Data attribute names for event delegation
 * @constant {Object}
 */
export const DATA_ATTRIBUTES = {
    ACTION: 'data-action',
    ACTION_PARAM: 'data-action-param',
    CAPTION: 'data-caption',
    STOP_PROPAGATION: 'data-stop-propagation'
};

/**
 * Supported action types for event delegation
 * @constant {Object}
 */
export const ACTIONS = {
    CLOSE_SEARCH: 'close-search',
    TOGGLE_SEARCH: 'toggle-search',
    CLOSE_CARD: 'close-card',
    CLOSE_EXPANDED_CARD: 'close-expanded-card',
    CLOSE_PHOTO: 'close-photo',
    CLOSE_EXPANDED_PHOTO: 'close-expanded-photo',
    TOGGLE_MOBILE_MENU: 'toggle-mobile-menu',
    EXPAND_THEME: 'expand-theme',
    EXPAND_CARD: 'expand-card',
    EXPAND_PHOTO: 'expand-photo',
    SEARCH: 'search'
};

/**
 * CSS class names used throughout the application
 * @constant {Object}
 */
export const CSS_CLASSES = {
    ACTIVE: 'active',
    SEARCH_ACTIVE: 'search-active',
    DARK_MODE: 'dark-mode',
    SEARCH_CONTAINER: 'search-container',
    NEWS_ITEM: 'news-item',
    CARD_TEXT: 'card-text',
    INTRO_IMAGE: 'intro-image',
    TAG: 'tag',
    CARD: 'card',
    FIGURE_CAPTION: 'figure-caption'
};

/**
 * API endpoints and data file paths
 * @constant {Object}
 */
export const API_ENDPOINTS = {
    PROJECTS_DATA: '/projects-data.json',
    NEWS_FEED: '/news-feed.json',
    SEARCH_INDEX: '/assets/search-index.json',
    TIMELINE_DATA: '/timeline-data.json'
};

/**
 * Default configuration values
 * @constant {Object}
 */
export const CONFIG = {
    NEWS_PREVIEW_LIMIT: 6,
    SEARCH_DEBOUNCE_MS: 300,
    SEARCH_RESULTS_LIMIT: 10,
    ERROR_AUTO_REMOVE_MS: 5000
};

