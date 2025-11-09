/**
 * ThemeManager Class Module
 * Manages all research themes and interactions
 * 
 * @module components/theme-manager
 */

import { ResearchTheme } from './research-theme.js';
import { Project } from './project.js';
import { overlayManager } from '../core/overlay-manager.js';
import { getElement, ELEMENT_IDS } from '../utils/dom-registry.js';
import { handleFetchError } from '../utils/error-handler.js';
import { THEME_IDS, API_ENDPOINTS } from '../utils/constants.js';

/**
 * Manages all research themes, loads project data, and handles theme expansion
 * @class ThemeManager
 */
export class ThemeManager {
    /**
     * Create a new ThemeManager instance
     * @constructor
     */
    constructor() {
        this.themes = new Map();
        this.projectsData = null;
        this.ready = false;
    }

    /**
     * Load projects data from JSON file and initialize themes
     * @method loadProjectsData
     * @async
     * @returns {Promise<boolean>} True if data loaded successfully, false otherwise
     */
    async loadProjectsData() {
        try {
            const response = await fetch(API_ENDPOINTS.PROJECTS_DATA);
            if (!response.ok) {
                throw new Error('Failed to load projects data');
            }
            this.projectsData = await response.json();
            this.initializeThemes();
            this.ready = true;
            return true;
        } catch (error) {
            handleFetchError(error, 'load projects data', null);
            // Fallback: initialize empty themes
            this.initializeEmptyThemes();
            this.ready = true;
            return false;
        }
    }

    /**
     * Populate project previews in theme cards on the homepage
     * @method populatePreviews
     */
    populatePreviews() {
        // Populate project previews for each theme
        const themeIds = [
            THEME_IDS.SUPERCONDUCTING,
            THEME_IDS.QEC,
            THEME_IDS.TENSOR,
            THEME_IDS.NEURAL
        ];
        themeIds.forEach(themeId => {
            const theme = this.themes.get(themeId);
            if (theme) {
                const previewContainer = getElement(`${themeId}-preview`);
                if (previewContainer) {
                    previewContainer.innerHTML = theme.renderProjectPreviews();
                }
            }
        });
    }

    /**
     * Initialize themes with empty data (fallback when data loading fails)
     * @method initializeEmptyThemes
     * @private
     */
    initializeEmptyThemes() {
        // Fallback: create empty themes if data loading fails
        const themeDefinitions = [
            { id: 'superconducting', title: 'Superconducting Qubit Simulation', desc: 'Advanced simulation techniques for superconducting quantum circuits' },
            { id: 'qec', title: 'Quantum Error Correction', desc: 'Hardware-aware quantum error correction schemes' },
            { id: 'tensor', title: 'Tensor Networks', desc: 'Tensor network methods for quantum simulation and optimization' },
            { id: 'neural', title: 'Neural Networks for Quantum Computing', desc: 'Machine learning applications in quantum computing research' }
        ];

        themeDefinitions.forEach(def => {
            const theme = new ResearchTheme(def.id, def.title, def.desc);
            this.themes.set(def.id, theme);
        });
    }

    /**
     * Initialize themes with project data
     * @method initializeThemes
     * @private
     */
    initializeThemes() {
        if (!this.projectsData || !this.projectsData.projects) {
            handleFetchError(
                new Error('No projects data available'),
                'initialize themes',
                null
            );
            this.initializeEmptyThemes();
            return;
        }

        // Theme definitions with full descriptions
        const themeDefinitions = {
            'superconducting': {
                title: 'Superconducting Qubit Simulation',
                description: 'Advanced simulation techniques for superconducting quantum circuits'
            },
            'qec': {
                title: 'Quantum Error Correction',
                description: 'Hardware-aware quantum error correction schemes'
            },
            'tensor': {
                title: 'Tensor Networks',
                description: 'Tensor network methods for quantum simulation and optimization'
            },
            'neural': {
                title: 'Neural Networks for Quantum Computing',
                description: 'Machine learning applications in quantum computing research'
            }
        };

        // Create theme instances
        Object.keys(themeDefinitions).forEach(themeId => {
            const def = themeDefinitions[themeId];
            const theme = new ResearchTheme(themeId, def.title, def.description);
            this.themes.set(themeId, theme);
        });

        // Populate themes with projects from data
        this.projectsData.projects.forEach(projectData => {
            const project = new Project(
                projectData.title,
                projectData.description,
                projectData.url,
                projectData.image,
                projectData.status
            );

            // Add project to all its associated themes
            if (projectData.themes && Array.isArray(projectData.themes)) {
                projectData.themes.forEach(themeId => {
                    const theme = this.themes.get(themeId);
                    if (theme) {
                        theme.addProject(project);
                    }
                });
            }
        });
    }

    /**
     * Get a theme by its ID
     * @method getTheme
     * @param {string} themeId - Theme identifier
     * @returns {ResearchTheme|undefined} Theme instance or undefined if not found
     */
    getTheme(themeId) {
        return this.themes.get(themeId);
    }

    /**
     * Expand a theme in the overlay, showing all its projects
     * Refactored to use overlayManager.showOverlayWithContent() for consistent overlay handling
     * @method expandTheme
     * @param {string} themeId - Theme identifier to expand
     */
    expandTheme(themeId) {
        const theme = this.getTheme(themeId);
        if (!theme) {
            handleFetchError(
                new Error(`Theme not found: ${themeId}`),
                'expand theme',
                null
            );
            return;
        }

        // Generate theme content HTML
        const themeContent = `
            <h2>${theme.title}</h2>
            <p class="theme-expanded-description">${theme.description}</p>
            ${theme.renderProjects()}
        `;

        // Use overlayManager's unified method to show overlay with content
        // This eliminates duplication and ensures consistent overlay behavior
        overlayManager.showOverlayWithContent(themeContent);
    }
}

