/**
 * Overlay Initialization Utility
 * Immediately hides overlays on page load to prevent flash of visibility
 * Must run synchronously before other scripts to prevent FOUC
 * 
 * Note: This file is loaded as a regular script (not module) for early execution,
 * so it cannot use ES6 imports. IDs are hardcoded to match ELEMENT_IDS constants.
 */

// Overlay element IDs (must match ELEMENT_IDS in dom-registry.js)
const overlayIds = ['cardOverlay', 'photoOverlay'];
    
    const hideOverlay = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.hidden = true;
            element.style.display = 'none';
            element.style.visibility = 'hidden';
            return true;
        }
        return false;
    };
    
/**
 * Immediately hide overlay elements to prevent flash of visibility
 * This function runs as soon as the script loads, before DOMContentLoaded
 * Uses multiple strategies to ensure overlays are hidden as early as possible
 * @function hideOverlaysImmediately
 * Note: Not exported since this file is loaded as a regular script, not a module
 */
function hideOverlaysImmediately() {
        overlayIds.forEach(hideOverlay);
}

// Auto-execute on module load to prevent FOUC
(function() {
    'use strict';
    
    // Strategy 1: Try immediately if DOM is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        hideOverlaysImmediately();
    }
    
    // Strategy 2: Use DOMContentLoaded for early execution
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideOverlaysImmediately, { once: true, passive: true });
    }
    
    // Strategy 3: Use MutationObserver to catch elements as they're added
    // This handles cases where elements are added dynamically
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(() => {
            const allHidden = overlayIds.every(id => {
                const element = document.getElementById(id);
                return !element || (element.hidden && element.style.display === 'none');
            });
            
            if (allHidden) {
                observer.disconnect();
            } else {
                hideOverlaysImmediately();
            }
        });
        
        // Start observing when DOM is available
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                if (document.body) {
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                }
            }, { once: true });
        }
    }
})();

