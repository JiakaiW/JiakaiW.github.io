/**
 * ResearchTheme Class Module
 * Represents a research theme with multiple projects
 * 
 * @module components/research-theme
 */

import { Project } from './project.js';

/**
 * Represents a research theme containing multiple projects
 * @class ResearchTheme
 */
export class ResearchTheme {
    /**
     * Create a new ResearchTheme instance
     * @constructor
     * @param {string} id - Theme identifier
     * @param {string} title - Theme title
     * @param {string} description - Theme description
     * @param {Project[]} [projects=[]] - Array of projects belonging to this theme
     */
    constructor(id, title, description, projects = []) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.projects = projects;
    }

    /**
     * Add a project to this theme
     * @method addProject
     * @param {Project} project - Project instance to add
     */
    addProject(project) {
        this.projects.push(project);
    }

    /**
     * Get count of completed projects
     * @method getCompletedCount
     * @returns {number} Number of completed projects
     */
    getCompletedCount() {
        return this.projects.filter(p => p.status === 'completed').length;
    }

    /**
     * Get count of ongoing projects
     * @method getOngoingCount
     * @returns {number} Number of ongoing projects
     */
    getOngoingCount() {
        return this.projects.filter(p => p.status === 'ongoing').length;
    }

    /**
     * Get count of potential projects
     * @method getPotentialCount
     * @returns {number} Number of potential projects
     */
    getPotentialCount() {
        return this.projects.filter(p => p.status === 'potential').length;
    }

    /**
     * Render project previews for theme card (up to 4 projects)
     * Prioritizes completed projects, then ongoing, then potential
     * @method renderProjectPreviews
     * @returns {string} HTML string for project previews
     */
    renderProjectPreviews() {
        if (this.projects.length === 0) {
            return '';
        }

        // Show up to 4 projects (prioritize completed, then ongoing, then potential)
        const completed = this.projects.filter(p => p.status === 'completed');
        const ongoing = this.projects.filter(p => p.status === 'ongoing');
        const potential = this.projects.filter(p => p.status === 'potential');
        
        let previewProjects = [];
        previewProjects = previewProjects.concat(completed.slice(0, 2));
        if (previewProjects.length < 4) {
            previewProjects = previewProjects.concat(ongoing.slice(0, 4 - previewProjects.length));
        }
        if (previewProjects.length < 4) {
            previewProjects = previewProjects.concat(potential.slice(0, 4 - previewProjects.length));
        }

        if (previewProjects.length === 0) {
            return '';
        }

        let html = '<div class="theme-projects-preview">';
        
        previewProjects.forEach(project => {
            // Normalize URL to .html extension for consistency
            let normalizedUrl = project.url;
            if (normalizedUrl && !normalizedUrl.startsWith('http')) {
                // Remove trailing slash if present
                if (normalizedUrl.endsWith('/')) {
                    normalizedUrl = normalizedUrl.slice(0, -1);
                }
                // Append .html if not already present
                if (!normalizedUrl.endsWith('.html')) {
                    normalizedUrl = normalizedUrl + '.html';
                }
            }
            const learnMoreLink = project.url ? `<a href="${normalizedUrl}" class="learn-more-link" data-action="expand-card" data-action-param="${normalizedUrl}">Learn more →</a>` : '';
            
            // Debug logging for link generation
            if (project.url) {
                console.log('[Research Theme] Generated learn-more link:', {
                    projectTitle: project.title,
                    originalUrl: project.url,
                    normalizedUrl: normalizedUrl,
                    linkHTML: learnMoreLink.substring(0, 200)
                });
            }
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

    /**
     * Render all projects grouped by status (completed, ongoing, potential)
     * @method renderProjects
     * @returns {string} HTML string for all projects
     */
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

