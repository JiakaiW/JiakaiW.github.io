/**
 * Project Class Module
 * Represents a single research project
 * 
 * @module components/project
 */

/**
 * Represents a research project with title, description, URL, image, and status
 * @class Project
 */
export class Project {
    /**
     * Create a new Project instance
     * @constructor
     * @param {string} title - Project title
     * @param {string} description - Project description
     * @param {string} url - Project URL
     * @param {string} image - Project image URL
     * @param {string} [status='completed'] - Project status ('completed', 'ongoing', 'potential')
     */
    constructor(title, description, url, image, status = 'completed') {
        this.title = title;
        this.description = description;
        this.url = url;
        this.image = image;
        this.status = status; // 'completed', 'ongoing', 'potential'
    }

    /**
     * Get HTML badge for project status
     * @method getStatusBadge
     * @returns {string} HTML string for status badge
     */
    getStatusBadge() {
        const badges = {
            'completed': '<span class="project-badge completed">Completed</span>',
            'ongoing': '<span class="project-badge ongoing">Ongoing</span>',
            'potential': '<span class="project-badge potential">Potential</span>'
        };
        return badges[this.status] || '';
    }

    /**
     * Get text representation of project status
     * @method getStatusText
     * @returns {string} Status text
     */
    getStatusText() {
        const statusTexts = {
            'completed': 'Completed',
            'ongoing': 'Ongoing',
            'potential': 'Potential'
        };
        return statusTexts[this.status] || '';
    }

    /**
     * Render project as HTML
     * @method render
     * @returns {string} HTML string representing the project
     */
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

