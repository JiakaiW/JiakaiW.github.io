/**
 * Event Delegation Utility
 * Handles event delegation for data-action attributes
 * Replaces inline event handlers with declarative data attributes
 * 
 * @module utils/event-delegation
 */

import { overlayManager } from '../core/overlay-manager.js';
import { mobileMenuManager } from './mobile-menu.js';
import { getService, SERVICE_NAMES } from './service-registry.js';
import { ACTIONS, DATA_ATTRIBUTES } from './constants.js';
import { getElement, ELEMENT_IDS } from './dom-registry.js';

/**
 * Event delegation handler for data-action attributes
 * Maps data-action values to corresponding functions
 */
export function setupEventDelegation() {
    // Use event delegation on document body
    document.body.addEventListener('click', (e) => {
        // Handle case where e.target might be a text node
        let clickTarget = e.target;
        if (clickTarget.nodeType === Node.TEXT_NODE) {
            clickTarget = clickTarget.parentElement;
        }
        
        // CRITICAL FIX: Check if the clicked element itself has data-action FIRST
        // This prevents parent actions (like theme-block's expand-theme) from being triggered
        // when clicking on child elements (like links with expand-card)
        let actionElement = null;
        let action = null;
        let actionParam = null;
        let caption = null;
        
        // First, check if the clicked element itself has data-action
        if (clickTarget && clickTarget.hasAttribute && clickTarget.hasAttribute(DATA_ATTRIBUTES.ACTION)) {
            actionElement = clickTarget;
            action = clickTarget.getAttribute(DATA_ATTRIBUTES.ACTION);
            actionParam = clickTarget.getAttribute(DATA_ATTRIBUTES.ACTION_PARAM);
            caption = clickTarget.getAttribute(DATA_ATTRIBUTES.CAPTION);
            
            console.log('[Event Delegation] Found action on clicked element:', {
                element: clickTarget,
                tagName: clickTarget.tagName,
                className: clickTarget.className,
                action: action,
                actionParam: actionParam
            });
            
            // Stop propagation to prevent parent handlers from receiving the event
            e.stopPropagation();
        } else {
            // Only search parents if the clicked element doesn't have its own action
            // Handle stop propagation for overlay containers (check parent elements)
            const stopPropagationElement = clickTarget?.closest(`[${DATA_ATTRIBUTES.STOP_PROPAGATION}]`);
        if (stopPropagationElement) {
            e.stopPropagation();
            // Don't prevent default for elements inside stop-propagation containers
            // unless they have their own data-action
                actionElement = clickTarget?.closest(`[${DATA_ATTRIBUTES.ACTION}]`);
            if (actionElement && actionElement !== stopPropagationElement) {
                    action = actionElement.getAttribute(DATA_ATTRIBUTES.ACTION);
                    actionParam = actionElement.getAttribute(DATA_ATTRIBUTES.ACTION_PARAM);
                    caption = actionElement.getAttribute(DATA_ATTRIBUTES.CAPTION);
                } else {
                    return; // No action found, exit early
        }
            } else {
                // Find the closest element with data-action attribute (walking up the tree)
                actionElement = clickTarget?.closest(`[${DATA_ATTRIBUTES.ACTION}]`);
                
                if (!actionElement) {
                    console.log('[Event Delegation] No action found for element:', clickTarget);
                    return;
                }
                
                action = actionElement.getAttribute(DATA_ATTRIBUTES.ACTION);
                actionParam = actionElement.getAttribute(DATA_ATTRIBUTES.ACTION_PARAM);
                caption = actionElement.getAttribute(DATA_ATTRIBUTES.CAPTION);
                
                console.log('[Event Delegation] Found action on parent element:', {
                    clickedElement: clickTarget,
                    actionElement: actionElement,
                    action: action,
                    actionParam: actionParam
                });
            }
        }
        
        // Debug logging for all actions
        console.log('[Event Delegation] Handling action:', {
            action: action,
            actionParam: actionParam,
            element: actionElement,
            tagName: actionElement?.tagName,
            className: actionElement?.className
        });

        handleAction(action, actionParam, e, caption);
    });

    // Handle input events for search
    document.body.addEventListener('input', (e) => {
        const target = e.target;
        if (target.hasAttribute(DATA_ATTRIBUTES.ACTION) && 
            target.getAttribute(DATA_ATTRIBUTES.ACTION) === ACTIONS.SEARCH) {
            const resultsContainer = getElement(ELEMENT_IDS.SEARCH_RESULTS);
            const searchManager = getService(SERVICE_NAMES.SEARCH_MANAGER);
            if (resultsContainer && searchManager) {
                searchManager.handleSearch(target.value, resultsContainer);
            }
        }
    });
}

/**
 * Handle a data-action attribute action
 * @param {string} action - The action to perform
 * @param {string} actionParam - Optional parameter for the action
 * @param {Event} e - The event object
 * @param {string} caption - Optional caption for photo expansion
 */
function handleAction(action, actionParam, e, caption) {
    console.log('[Event Delegation] handleAction called:', {
        action: action,
        actionParam: actionParam,
        caption: caption,
        target: e.target,
        currentTarget: e.currentTarget
    });
    
    // Prevent default for actions that don't navigate
    if (action && !action.startsWith('navigate-')) {
        e.preventDefault();
        console.log('[Event Delegation] Prevented default for action:', action);
    }

    // Route actions to appropriate handlers
    switch (action) {
        case ACTIONS.CLOSE_SEARCH:
            overlayManager.closeSearch();
            break;
        
        case ACTIONS.TOGGLE_SEARCH:
            overlayManager.toggleSearch();
            break;
        
        case ACTIONS.CLOSE_CARD:
        case ACTIONS.CLOSE_EXPANDED_CARD:
            overlayManager.closeCard();
            break;
        
        case ACTIONS.CLOSE_PHOTO:
        case ACTIONS.CLOSE_EXPANDED_PHOTO:
            overlayManager.closeCard(); // Photos use card overlay
            break;
        
        case ACTIONS.TOGGLE_MOBILE_MENU:
            mobileMenuManager.toggle();
            break;
        
        case ACTIONS.EXPAND_THEME:
            if (actionParam) {
                const themeManager = getService(SERVICE_NAMES.THEME_MANAGER);
                if (themeManager && themeManager.expandTheme) {
                    themeManager.expandTheme(actionParam);
                }
            }
            break;
        
        case ACTIONS.EXPAND_CARD:
            console.log('[Event Delegation] EXPAND_CARD action triggered:', {
                actionParam: actionParam,
                overlayManagerExists: !!overlayManager
            });
            if (actionParam && overlayManager) {
                console.log('[Event Delegation] Calling overlayManager.expandCard with:', actionParam);
                overlayManager.expandCard(actionParam);
            } else {
                console.error('[Event Delegation] Cannot expand card - missing actionParam or overlayManager:', {
                    actionParam: actionParam,
                    overlayManagerExists: !!overlayManager
                });
            }
            break;
        
        case ACTIONS.EXPAND_PHOTO:
            if (actionParam && overlayManager) {
                overlayManager.expandPhoto(actionParam, caption || '');
            }
            break;
        
        default:
            // Allow other actions to bubble up or be handled elsewhere
            break;
    }
}

