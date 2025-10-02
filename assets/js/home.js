/**
 * Project class - represents a single research project
 */
class Project {
    constructor(title, description, url, image, status = 'completed') {
        this.title = title;
        this.description = description;
        this.url = url;
        this.image = image;
        this.status = status; // 'completed', 'ongoing', 'potential'
    }

    getStatusBadge() {
        const badges = {
            'completed': '<span class="project-badge completed">Completed</span>',
            'ongoing': '<span class="project-badge ongoing">Ongoing</span>',
            'potential': '<span class="project-badge potential">Potential</span>'
        };
        return badges[this.status] || '';
    }

    getStatusText() {
        const statusTexts = {
            'completed': 'Completed',
            'ongoing': 'Ongoing',
            'potential': 'Potential'
        };
        return statusTexts[this.status] || '';
    }

    render() {
        return `
            <div class="project-item" data-status="${this.status}">
                ${this.image ? `<img src="${this.image}" alt="${this.title}" class="project-thumbnail">` : ''}
                <div class="project-content">
                    <h4>${this.title}</h4>
                    ${this.getStatusBadge()}
                    <p>${this.description}</p>
                    ${this.url ? `<a href="${this.url}" class="project-link">Learn more →</a>` : ''}
                </div>
            </div>
        `;
    }
}

/**
 * ResearchTheme class - represents a research theme with multiple projects
 */
class ResearchTheme {
    constructor(id, title, description, projects = []) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.projects = projects;
    }

    addProject(project) {
        this.projects.push(project);
    }

    getCompletedCount() {
        return this.projects.filter(p => p.status === 'completed').length;
    }

    getOngoingCount() {
        return this.projects.filter(p => p.status === 'ongoing').length;
    }

    getPotentialCount() {
        return this.projects.filter(p => p.status === 'potential').length;
    }

    renderProjectPreviews() {
        if (this.projects.length === 0) {
            return '';
        }

        // Show up to 3 projects (prioritize completed, then ongoing, then potential)
        const completed = this.projects.filter(p => p.status === 'completed');
        const ongoing = this.projects.filter(p => p.status === 'ongoing');
        const potential = this.projects.filter(p => p.status === 'potential');
        
        let previewProjects = [];
        previewProjects = previewProjects.concat(completed.slice(0, 2));
        if (previewProjects.length < 3) {
            previewProjects = previewProjects.concat(ongoing.slice(0, 3 - previewProjects.length));
        }
        if (previewProjects.length < 3) {
            previewProjects = previewProjects.concat(potential.slice(0, 3 - previewProjects.length));
        }

        if (previewProjects.length === 0) {
            return '';
        }

        let html = '<div class="theme-projects-preview">';
        
        previewProjects.forEach(project => {
            const learnMoreLink = project.url ? `<a href="${project.url}" class="learn-more-link">Learn more →</a>` : '';
            const backgroundImage = project.image ? `<img src="${project.image}" alt="${project.title}" class="preview-project-bg">` : '';
            
            html += `
                <div class="preview-project">
                    ${backgroundImage}
                    <div class="preview-project-content">
                        <div class="preview-project-header">
                            <span class="project-badge ${project.status}">${project.getStatusText()}</span>
                            <h5>${project.title}</h5>
                        </div>
                        <p>${project.description}</p>
                        ${learnMoreLink}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    renderProjects() {
        if (this.projects.length === 0) {
            return '<p class="no-projects">Projects will be added soon. Stay tuned!</p>';
        }

        const completed = this.projects.filter(p => p.status === 'completed');
        const ongoing = this.projects.filter(p => p.status === 'ongoing');
        const potential = this.projects.filter(p => p.status === 'potential');

        let html = '';

        if (completed.length > 0) {
            html += '<h3 class="project-section-title">Completed Projects</h3>';
            html += '<div class="projects-grid">';
            html += completed.map(p => p.render()).join('');
            html += '</div>';
        }

        if (ongoing.length > 0) {
            html += '<h3 class="project-section-title">Ongoing Research</h3>';
            html += '<div class="projects-grid">';
            html += ongoing.map(p => p.render()).join('');
            html += '</div>';
        }

        if (potential.length > 0) {
            html += '<h3 class="project-section-title">Potential Directions</h3>';
            html += '<div class="projects-grid">';
            html += potential.map(p => p.render()).join('');
            html += '</div>';
        }

        return html;
    }
}

/**
 * ThemeManager class - manages all research themes and interactions
 */
class ThemeManager {
    constructor() {
        this.themes = new Map();
        this.initializeThemes();
    }

    populatePreviews() {
        // Populate project previews for each theme
        const themeIds = ['superconducting', 'qec', 'tensor', 'neural'];
        themeIds.forEach(themeId => {
            const theme = this.themes.get(themeId);
            if (theme) {
                const previewContainer = document.getElementById(`${themeId}-preview`);
                if (previewContainer) {
                    previewContainer.innerHTML = theme.renderProjectPreviews();
                }
            }
        });
    }

    initializeThemes() {
        // Theme 1: Superconducting Qubit Simulation
        const scTheme = new ResearchTheme(
            'superconducting',
            'Superconducting Qubit Simulation',
            'Advanced simulation techniques for superconducting quantum circuits'
        );
        scTheme.addProject(new Project(
            'Fluxonium Erasure',
            'Erasure error detection and conversion in fluxonium qubits for improved quantum error correction.',
            '/projects/fluxonium_erasure',
            '/projects/fluxonium_erasure/images/lvl_diagram.png',
            'completed'
        ));
        scTheme.addProject(new Project(
            'High-Performance Quantum Computing Software',
            'GPU-accelerated simulation tools for superconducting quantum circuits and coupled systems.',
            '/projects/hpc',
            '/projects/hpc/images/GPU_pauli_frame.png',
            'completed'
        ));
        scTheme.addProject(new Project(
            'Novel Superconducting Qubit Designs',
            'Exploring new qubit architectures with enhanced coherence and reduced error rates.',
            '/potential_directions/novel_SCqubits/',
            null,
            'ongoing'
        ));
        scTheme.addProject(new Project(
            'Finite Element Analysis of Josephson Junctions',
            'Advanced FEA methods for optimizing superconducting circuit design and fabrication.',
            null,
            null,
            'potential'
        ));

        // Theme 2: Quantum Error Correction
        const qecTheme = new ResearchTheme(
            'qec',
            'Quantum Error Correction',
            'Hardware-aware quantum error correction schemes'
        );
        qecTheme.addProject(new Project(
            'Measurement-Free Quantum Error Correction',
            'Novel QEC protocols that eliminate measurement overhead for improved qubit coherence.',
            '/projects/mfqec',
            '/projects/mfqec/images/circ_simple.png',
            'completed'
        ));
        qecTheme.addProject(new Project(
            'Erasure-Based QEC Optimization',
            'Leveraging erasure errors for more efficient quantum error correction codes.',
            null,
            null,
            'ongoing'
        ));
        qecTheme.addProject(new Project(
            'Fault-Tolerant Quantum Computing',
            'Research directions in achieving practical fault-tolerant quantum computation.',
            '/potential_directions/ftqc/',
            null,
            'potential'
        ));

        // Theme 3: Tensor Networks
        const tensorTheme = new ResearchTheme(
            'tensor',
            'Tensor Networks',
            'Tensor network methods for quantum simulation and optimization'
        );
        tensorTheme.addProject(new Project(
            'Tensor Network QEC Decoders',
            'Developing efficient tensor network-based decoders for quantum error correction.',
            null,
            null,
            'potential'
        ));
        tensorTheme.addProject(new Project(
            'Many-Body Quantum System Simulation',
            'Using tensor networks to simulate strongly correlated quantum systems.',
            null,
            null,
            'potential'
        ));

        // Theme 4: Neural Networks
        const neuralTheme = new ResearchTheme(
            'neural',
            'Neural Networks for Quantum Computing',
            'Machine learning applications in quantum computing research'
        );
        neuralTheme.addProject(new Project(
            'LLM Agents for Research',
            'Building multi-agent systems to accelerate quantum computing research workflows.',
            '/potential_directions/agents/',
            null,
            'ongoing'
        ));
        neuralTheme.addProject(new Project(
            'Neural QEC Decoders',
            'Training neural networks to decode quantum error correction codes efficiently.',
            null,
            null,
            'potential'
        ));
        neuralTheme.addProject(new Project(
            'Quantum Circuit Optimization with ML',
            'Using machine learning to optimize quantum circuit compilation and execution.',
            null,
            null,
            'potential'
        ));

        this.themes.set('superconducting', scTheme);
        this.themes.set('qec', qecTheme);
        this.themes.set('tensor', tensorTheme);
        this.themes.set('neural', neuralTheme);
    }

    getTheme(themeId) {
        return this.themes.get(themeId);
    }

    expandTheme(themeId) {
        const theme = this.getTheme(themeId);
        if (!theme) return;

        const overlay = document.getElementById('cardOverlay');
        const content = document.getElementById('expandedContent');

        content.innerHTML = `
            <h2>${theme.title}</h2>
            <p class="theme-expanded-description">${theme.description}</p>
            ${theme.renderProjects()}
        `;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        overlay.style.top = `${scrollTop}px`;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Global instance
let themeManager;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
    themeManager.populatePreviews();
    setAnimationDelays();
    autoSizeText();
    initializeIntroImageClick();
    loadNews();
});

// Add random emoji/text animation when intro image is clicked
function initializeIntroImageClick() {
    const introImage = document.querySelector('.intro-image img');
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
        
        const container = document.querySelector('.intro-image');
        container.appendChild(element);
        
        // Remove the element after animation completes
        setTimeout(() => {
            element.remove();
        }, 1000);
    });
}

// Global function for onclick handlers
function expandTheme(themeId) {
    if (themeManager) {
        themeManager.expandTheme(themeId);
    }
}

async function expandCard(cardId) {
    const overlay = document.getElementById('cardOverlay');
    const content = document.getElementById('expandedContent');
    
    try {
        const fetchPath = cardId;
        const response = await fetch(fetchPath);
        const html = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const mainContent = doc.querySelector('main').innerHTML;
        
        content.innerHTML = mainContent;
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        overlay.style.top = `${scrollTop}px`;
        
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

function closeExpandedCard() {
    const overlay = document.getElementById('cardOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    overlay.style.top = '0';
}

function expandPhoto(src, caption) {
    const overlay = document.getElementById('cardOverlay');
    const content = document.getElementById('expandedContent');
    
    content.innerHTML = `
        <img src="${src}" alt="${caption}" style="max-width: 100%; max-height: 80vh; object-fit: contain;">
        <p style="text-align: center; margin-top: 1em;">${caption}</p>
    `;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    overlay.style.top = `${scrollTop}px`;
    
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function setAnimationDelays() {
    // Set animation delays for tags
    document.querySelectorAll('.tag').forEach((tag, index) => {
        tag.style.setProperty('--tag-index', index);
    });

    // Set animation delays for cards
    document.querySelectorAll('.card').forEach((card, index) => {
        card.style.setProperty('--card-index', index);
    });
}

function autoSizeText() {
    const textContainers = document.querySelectorAll('.card-text');

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

window.addEventListener('resize', autoSizeText);

/**
 * News loading and display functionality
 */

async function loadNews() {
    const container = document.getElementById('newsContainer');
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

        // Render news items (already sorted by date in JSON)
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