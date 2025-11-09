/**
 * Gallery Utilities
 * Handles gallery scrolling functionality
 * 
 * @module utils/gallery
 */

import { querySelector } from './dom-registry.js';

/**
 * Scroll the gallery container horizontally
 * @function scrollGallery
 * @param {number} direction - Scroll direction (-1 for left, 1 for right)
 */
export function scrollGallery(direction) {
    const container = querySelector('.gallery-container');
    if (!container) return;

    const galleryItem = container.querySelector('.gallery-item');
    if (!galleryItem) return;

    const itemWidth = galleryItem.offsetWidth + 20;
    const scrollAmount = direction * itemWidth;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

