/**
 * Error Handler Utility
 * Provides consistent error handling and user-friendly error displays
 * 
 * @module utils/error-handler
 */

/**
 * Error severity levels
 * @enum {string}
 */
export const ErrorSeverity = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical'
};

/**
 * Display a user-friendly error message
 * @function showError
 * @param {string} message - Error message to display
 * @param {ErrorSeverity} severity - Severity level (default: ERROR)
 * @param {HTMLElement} container - Container element to display error in (optional)
 */
export function showError(message, severity = ErrorSeverity.ERROR, container = null) {
    const errorClass = `error-${severity}`;
    const errorIcon = getErrorIcon(severity);
    
    const errorHtml = `
        <div class="error-message ${errorClass}">
            <span class="error-icon">${errorIcon}</span>
            <span class="error-text">${message}</span>
        </div>
    `;

    if (container) {
        container.innerHTML = errorHtml;
    } else {
        // Create a temporary container if none provided
        const tempContainer = document.createElement('div');
        tempContainer.className = 'error-container';
        tempContainer.innerHTML = errorHtml;
        document.body.appendChild(tempContainer);
        
        // Auto-remove after 5 seconds for non-critical errors
        if (severity !== ErrorSeverity.CRITICAL) {
            setTimeout(() => {
                tempContainer.remove();
            }, 5000);
        }
    }

    // Log to console for debugging
    logError(message, severity);
}

/**
 * Get icon for error severity
 * @function getErrorIcon
 * @param {ErrorSeverity} severity - Severity level
 * @returns {string} Icon character
 * @private
 */
function getErrorIcon(severity) {
    switch (severity) {
        case ErrorSeverity.INFO:
            return 'ℹ️';
        case ErrorSeverity.WARNING:
            return '⚠️';
        case ErrorSeverity.ERROR:
            return '❌';
        case ErrorSeverity.CRITICAL:
            return '🚨';
        default:
            return '❌';
    }
}

/**
 * Log error to console with appropriate level
 * @function logError
 * @param {string} message - Error message
 * @param {ErrorSeverity} severity - Severity level
 * @private
 */
function logError(message, severity) {
    switch (severity) {
        case ErrorSeverity.INFO:
            console.info(`[INFO] ${message}`);
            break;
        case ErrorSeverity.WARNING:
            console.warn(`[WARNING] ${message}`);
            break;
        case ErrorSeverity.ERROR:
            console.error(`[ERROR] ${message}`);
            break;
        case ErrorSeverity.CRITICAL:
            console.error(`[CRITICAL] ${message}`);
            break;
    }
}

/**
 * Handle fetch errors consistently
 * @function handleFetchError
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred (e.g., "loading news")
 * @param {HTMLElement} container - Container to display error in
 * @returns {string} User-friendly error message
 */
export function handleFetchError(error, context, container = null) {
    let message = `Failed to ${context}. `;
    
    if (error.message.includes('Failed to fetch')) {
        message += 'Please check your internet connection and try again.';
    } else if (error.message.includes('404')) {
        message += 'The requested resource was not found.';
    } else if (error.message.includes('500')) {
        message += 'Server error. Please try again later.';
    } else {
        message += 'Please try again later.';
    }

    showError(message, ErrorSeverity.ERROR, container);
    return message;
}

/**
 * Wrap an async function with error handling
 * @function withErrorHandling
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Context for error messages
 * @param {HTMLElement} container - Container for error display
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(fn, context, container = null) {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            handleFetchError(error, context, container);
            throw error; // Re-throw for caller to handle if needed
        }
    };
}

