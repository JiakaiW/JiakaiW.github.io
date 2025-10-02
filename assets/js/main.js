// Initialize search index
let searchIndex;
let searchData;

// Fetch and build search index
async function initSearch() {
    try {
        const response = await fetch('/assets/search-index.json');
        searchData = await response.json();
        
        // Build Lunr index
        searchIndex = lunr(function() {
            this.ref('url');
            this.field('title');
            this.field('content');
            
            searchData.forEach(doc => {
                this.add(doc);
            });
        });
    } catch (error) {
        console.error('Error initializing search:', error);
    }
}

// Initialize search when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initSearch();
    
    // Always use dark mode
    document.body.classList.add('dark-mode');

    // Add prefix to figure captions
    let figIdx = 1;
    document.querySelectorAll('img').forEach(img => {
        const caption = img.nextElementSibling;
        if (caption && caption.tagName.toLowerCase() === 'p') {
            caption.classList.add('figure-caption');
            caption.textContent = `Fig. ${figIdx++}: ${caption.textContent}`;
        }
    });
});

// Search functionality
let searchDebounceTimeout;

function handleSearch(event) {
    const query = event.target.value;
    
    clearTimeout(searchDebounceTimeout);
    
    searchDebounceTimeout = setTimeout(() => {
        if (!query.trim()) {
            document.getElementById('searchResults').innerHTML = '';
            return;
        }

        try {
            const results = searchIndex.search(query);
            const resultsContainer = document.getElementById('searchResults');
            
            if (results.length === 0) {
                resultsContainer.innerHTML = '<div class="search-no-results">No results found</div>';
                return;
            }

            const formattedResults = results
                .slice(0, 10)
                .map(result => {
                    const doc = searchData.find(d => d.url === result.ref);
                    const preview = doc.content.substring(0, 150) + '...';
                    return `
                        <div class="search-result-item">
                            <a href="${doc.url}">
                                <h3>${doc.title}</h3>
                                <p>${preview}</p>
                            </a>
                        </div>
                    `;
                })
                .join('');

            resultsContainer.innerHTML = formattedResults;
        } catch (error) {
            console.error('Search error:', error);
            document.getElementById('searchResults').innerHTML = 
                '<div class="search-error">An error occurred while searching</div>';
        }
    }, 300);
}

function toggleSearch() {
    const overlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const isActive = overlay.classList.contains('search-active');
    
    overlay.classList.toggle('search-active');
    document.querySelector('.search-container').classList.toggle('search-active');
    
    if (!isActive) {
        searchInput.focus();
    }
}

function closeSearch() {
    document.getElementById('searchOverlay').classList.remove('search-active');
    document.querySelector('.search-container').classList.remove('search-active');
    document.getElementById('searchResults').innerHTML = '';
}

function scrollGallery(direction) {
    const container = document.querySelector('.gallery-container');
    const itemWidth = container.querySelector('.gallery-item').offsetWidth + 20;
    const scrollAmount = direction * itemWidth;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

async function expandCard(cardId) {
    const overlay = document.getElementById('cardOverlay');
    const content = document.getElementById('expandedContent');
    
    try {
        let fetchPath;
        if (cardId.includes('past_projects')) {
            fetchPath = `/${cardId}/`;
        } else {
            fetchPath = `/potential_directions/${cardId}/`;
        }
        
        const response = await fetch(fetchPath);
        const html = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const mainContent = doc.querySelector('main').innerHTML;
        
        content.innerHTML = mainContent;
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

function closeExpandedCard() {
    const overlay = document.getElementById('cardOverlay');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
    }
    if (e.key === 'Escape') {
        const searchOverlay = document.getElementById('searchOverlay');
        if (searchOverlay.classList.contains('search-active')) {
            closeSearch();
        }
        const cardOverlay = document.getElementById('cardOverlay');
        if (cardOverlay.classList.contains('active')) {
            closeExpandedCard();
        }
    }
});

// Toggle mobile menu
function toggleMobileMenu() {
    console.log('Toggle mobile menu called');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    console.log('Hamburger:', hamburger);
    console.log('NavMenu:', navMenu);
    
    if (hamburger && navMenu) {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        console.log('Menu toggled, active:', navMenu.classList.contains('active'));
    } else {
        console.error('Could not find hamburger or nav-menu elements');
    }
}

// Close mobile menu when clicking on a link
document.addEventListener('DOMContentLoaded', function() {
    const menuLinks = document.querySelectorAll('.nav-menu .menu-link > a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            const hamburger = document.querySelector('.hamburger');
            const navMenu = document.querySelector('.nav-menu');
            if (hamburger && navMenu && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
});