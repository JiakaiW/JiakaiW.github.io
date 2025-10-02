/**
 * News page JavaScript - loads and displays all news items
 */

document.addEventListener('DOMContentLoaded', () => {
    loadAllNews();
});

async function loadAllNews() {
    const container = document.getElementById('allNewsContainer');
    if (!container) return;

    try {
        // Fetch the news feed JSON
        const feedResponse = await fetch('/news-feed.json');
        if (!feedResponse.ok) {
            throw new Error('Failed to fetch news feed');
        }
        
        const feedData = await feedResponse.json();
        const newsItems = feedData.news;

        if (newsItems.length === 0) {
            container.innerHTML = '<p class="no-news">No news items available.</p>';
            return;
        }

        // Render all news items (already sorted by date in JSON)
        container.innerHTML = newsItems.map((item, index) => 
            renderNewsItem(item, index)
        ).join('');

    } catch (error) {
        console.error('Error loading news:', error);
        container.innerHTML = '<p class="error-message">Failed to load news. Please try again later.</p>';
    }
}

function renderNewsItem(item, index) {
    const categoryColors = {
        publication: { bg: 'rgba(46, 204, 113, 0.15)', text: '#2ecc71', border: 'rgba(46, 204, 113, 0.3)' },
        talk: { bg: 'rgba(241, 196, 15, 0.15)', text: '#f1c40f', border: 'rgba(241, 196, 15, 0.3)' },
        software: { bg: 'rgba(52, 152, 219, 0.15)', text: '#3498db', border: 'rgba(52, 152, 219, 0.3)' },
        news: { bg: 'rgba(155, 89, 182, 0.15)', text: '#9b59b6', border: 'rgba(155, 89, 182, 0.3)' },
        opportunity: { bg: 'rgba(231, 76, 60, 0.15)', text: '#e74c3c', border: 'rgba(231, 76, 60, 0.3)' }
    };

    const categoryStyle = categoryColors[item.category] || categoryColors.news;
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

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

