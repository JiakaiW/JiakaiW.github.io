/**
 * News Manager Module
 * Unified news loading and display functionality
 * Handles both homepage preview and full news page
 * 
 * @module components/news-manager
 */

import { handleFetchError } from '../utils/error-handler.js';
import { getElement, ELEMENT_IDS } from '../utils/dom-registry.js';
import { API_ENDPOINTS, CONFIG } from '../utils/constants.js';

/**
 * Category color definitions for news items
 * @constant {Object}
 */
const CATEGORY_COLORS = {
    publication: { bg: 'rgba(46, 204, 113, 0.15)', text: '#2ecc71', border: 'rgba(46, 204, 113, 0.3)' },
    talk: { bg: 'rgba(241, 196, 15, 0.15)', text: '#f1c40f', border: 'rgba(241, 196, 15, 0.3)' },
    software: { bg: 'rgba(52, 152, 219, 0.15)', text: '#3498db', border: 'rgba(52, 152, 219, 0.3)' },
    news: { bg: 'rgba(155, 89, 182, 0.15)', text: '#9b59b6', border: 'rgba(155, 89, 182, 0.3)' },
    opportunity: { bg: 'rgba(231, 76, 60, 0.15)', text: '#e74c3c', border: 'rgba(231, 76, 60, 0.3)' }
};

/**
 * Load and display news items (unified function to eliminate duplication)
 * @function loadNewsItems
 * @param {string} containerId - ID of container element
 * @param {number|null} limit - Maximum number of items to show (null for all)
 * @param {boolean} showViewAll - Whether to show "View All" button if limited
 * @async
 * @private
 */
async function loadNewsItems(containerId, limit = null, showViewAll = false) {
    const container = getElement(containerId);
    if (!container) return;

    try {
        const newsItems = await fetchNewsData();
        if (!newsItems || newsItems.length === 0) {
            container.innerHTML = '<p class="no-news">No news items available.</p>';
            return;
        }

        // Apply limit if specified
        const displayItems = limit ? newsItems.slice(0, limit) : newsItems;
        const hasMore = limit && newsItems.length > limit;

        // Render news items (already sorted by date in JSON)
        let html = displayItems.map((item, index) => 
            renderNewsItem(item, index)
        ).join('');

        // Add "View All News" button if needed
        if (showViewAll && hasMore) {
            html += `
                <div class="view-all-news-container">
                    <a href="/news/" class="view-all-news-button">
                        View All News (${newsItems.length} total)
                        <span class="arrow">→</span>
                    </a>
                </div>
            `;
        }

        container.innerHTML = html;

    } catch (error) {
        handleFetchError(error, 'load news', container);
    }
}

/**
 * Load and display news items on the homepage (first 6 items)
 * @function loadNews
 * @async
 */
export async function loadNews() {
    await loadNewsItems(
        ELEMENT_IDS.NEWS_CONTAINER,
        CONFIG.NEWS_PREVIEW_LIMIT,
        true
    );
}

/**
 * Load and display all news items on the news page
 * @function loadAllNews
 * @async
 */
export async function loadAllNews() {
    await loadNewsItems(ELEMENT_IDS.ALL_NEWS_CONTAINER, null, false);
}

/**
 * Fetch news data from JSON feed
 * @function fetchNewsData
 * @async
 * @returns {Promise<Array>} Array of news items
 * @private
 */
async function fetchNewsData() {
    const feedResponse = await fetch(API_ENDPOINTS.NEWS_FEED);
    if (!feedResponse.ok) {
        throw new Error('Failed to fetch news feed');
    }
    
    const feedData = await feedResponse.json();
    return feedData.news || [];
}

/**
 * Render a single news item as HTML
 * @function renderNewsItem
 * @param {Object} item - News item object with title, content, date, category, link
 * @param {number} index - Index of the news item (for animation delay)
 * @returns {string} HTML string for the news item
 * @private
 */
function renderNewsItem(item, index) {
    const categoryStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.news;
    const formattedDate = formatDate(item.date);
    
    const linkHtml = item.link 
        ? `<a href="${item.link}" class="news-link">Read more →</a>` 
        : '';

    return `
        <div class="news-item" style="--item-index: ${index}; --category-bg: ${categoryStyle.bg}; --category-border: ${categoryStyle.border};">
            <div class="news-header">
                <span class="news-category" style="background: ${categoryStyle.bg}; color: ${categoryStyle.text}; border: 1px solid ${categoryStyle.border};">
                    ${item.category}
                </span>
                <span class="news-date">${formattedDate}</span>
            </div>
            <h3 class="news-title">${item.title}</h3>
            <p class="news-content">${item.content}</p>
            ${linkHtml}
        </div>
    `;
}

/**
 * Format a date string to a readable format
 * @function formatDate
 * @param {string} dateStr - Date string to format
 * @returns {string} Formatted date string
 * @private
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

