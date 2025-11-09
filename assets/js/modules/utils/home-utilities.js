/**
 * Home Page Utilities
 * Utility functions extracted from home-modular.js for better organization
 * 
 * @module utils/home-utilities
 */

import { querySelector, querySelectorAll } from './dom-registry.js';
import { CSS_CLASSES } from './constants.js';

/**
 * Set animation delays for tags and cards based on their index
 * @function setAnimationDelays
 */
export function setAnimationDelays() {
    // Set animation delays for tags
    querySelectorAll(`.${CSS_CLASSES.TAG}`).forEach((tag, index) => {
        tag.style.setProperty('--tag-index', index);
    });

    // Set animation delays for cards
    querySelectorAll(`.${CSS_CLASSES.CARD}`).forEach((card, index) => {
        card.style.setProperty('--card-index', index);
    });
}

/**
 * Automatically resize text in card text containers to fit available space
 * @function autoSizeText
 */
export function autoSizeText() {
    const textContainers = querySelectorAll(`.${CSS_CLASSES.CARD_TEXT}`);

    textContainers.forEach(container => {
        if (!container.querySelector('span')) {
            container.innerHTML = `<span>${container.textContent.trim()}</span>`;
        }
        const textSpan = container.querySelector('span');
        if (!textSpan) return;

        const style = window.getComputedStyle(container);
        const paddingTop = parseFloat(style.paddingTop);
        const paddingBottom = parseFloat(style.paddingBottom);
        const paddingLeft = parseFloat(style.paddingLeft);
        const paddingRight = parseFloat(style.paddingRight);

        const availableHeight = container.clientHeight - paddingTop - paddingBottom;
        const availableWidth = container.clientWidth - paddingLeft - paddingRight;

        textSpan.style.fontSize = ''; 
        let currentFontSize = parseFloat(window.getComputedStyle(textSpan).fontSize);

        while (
            (textSpan.scrollHeight > availableHeight || textSpan.scrollWidth > availableWidth) && 
            currentFontSize > 8
        ) {
            currentFontSize--;
            textSpan.style.fontSize = `${currentFontSize}px`;
        }
    });
}

/**
 * Initialize click handler for intro image with random emoji/text animations
 * @function initializeIntroImageClick
 */
export function initializeIntroImageClick() {
    const introImage = querySelector(`.${CSS_CLASSES.INTRO_IMAGE} img`);
    if (!introImage) return;
    
    introImage.style.cursor = 'pointer';
    
    // Random messages for the 25% text case
    const randomMessages = [
        "Bro you so smart",
        "Bro you looks so cool",
        "Bro let's collaborate on a new paper",
        "Bro your research is fire",
        "Bro your qubits are coherent AF",
        "Bro you're going places",
        "Bro your code is cleaner than my room",
        "Bro teach me your ways",
        "+1s",
        "+1s"
    ];
    
    introImage.addEventListener('click', (event) => {
        const rect = introImage.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const random = Math.random();
        let content;
        let isEmoji = true;
        
        // 50% thumbs up, 25% heart, 25% random text
        if (random < 0.5) {
            content = '👍';
        } else if (random < 0.75) {
            content = '❤️';
        } else {
            content = randomMessages[Math.floor(Math.random() * randomMessages.length)];
            isEmoji = false;
        }
        
        const element = document.createElement('div');
        element.textContent = content;
        element.className = isEmoji ? 'thumbs-up-emoji emoji-only' : 'thumbs-up-emoji text-bubble';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        
        const container = querySelector(`.${CSS_CLASSES.INTRO_IMAGE}`);
        if (container) {
            container.appendChild(element);
            
            // Remove the element after animation completes
            setTimeout(() => {
                element.remove();
            }, 1000);
        }
    });
}

