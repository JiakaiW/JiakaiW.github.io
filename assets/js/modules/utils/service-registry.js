/**
 * Service Registry Module
 * Centralizes service access to eliminate global dependencies
 * Provides a clean way to access services without polluting window object
 * 
 * @module utils/service-registry
 */

/**
 * Service registry for accessing services across modules
 * @type {Map<string, Object>}
 */
const services = new Map();

/**
 * Register a service in the registry
 * @param {string} name - Service name
 * @param {Object} service - Service instance
 */
export function registerService(name, service) {
    services.set(name, service);
}

/**
 * Get a service from the registry
 * @param {string} name - Service name
 * @returns {Object|undefined} Service instance or undefined if not found
 */
export function getService(name) {
    return services.get(name);
}

/**
 * Check if a service is registered
 * @param {string} name - Service name
 * @returns {boolean} True if service is registered
 */
export function hasService(name) {
    return services.has(name);
}

/**
 * Service names constants
 * @constant {Object}
 */
export const SERVICE_NAMES = {
    OVERLAY_MANAGER: 'overlayManager',
    SEARCH_MANAGER: 'searchManager',
    MOBILE_MENU_MANAGER: 'mobileMenuManager',
    THEME_MANAGER: 'themeManager'
};

