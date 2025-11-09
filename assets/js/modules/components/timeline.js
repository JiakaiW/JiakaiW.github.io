/**
 * Timeline Component Module
 * Segmented Timeline Widget - Vanilla JS
 * Matches liquid glass theme aesthetic
 * 
 * @module components/timeline
 */

import { handleFetchError } from '../utils/error-handler.js';
import { getElement } from '../utils/dom-registry.js';
import { API_ENDPOINTS } from '../utils/constants.js';

/**
 * Segmented Timeline class for displaying project schedules
 * @class SegmentedTimeline
 */
export class SegmentedTimeline {
    constructor(containerId, dataUrl) {
        this.container = getElement(containerId);
        this.dataUrl = dataUrl || API_ENDPOINTS.TIMELINE_DATA;
        this.projects = [];
        this.hoveredProject = null;
        this.now = new Date();
        
        // Define time segments with their ranges and widths
        this.segments = [
            { start: -730, end: -90, width: 15, label: '-2y to -3m', unit: 'years' },
            { start: -90, end: -14, width: 15, label: '-3m to -14d', unit: 'months' },
            { start: -14, end: 0, width: 20, label: '-14d to now', unit: 'days' },
            { start: 0, end: 14, width: 20, label: 'now to +14d', unit: 'days' },
            { start: 14, end: 90, width: 15, label: '+14d to +3m', unit: 'months' },
            { start: 90, end: 730, width: 15, label: '+3m to +2y', unit: 'years' }
        ];
    }
    
    /**
     * Initialize the timeline by loading data and rendering
     * @method init
     * @async
     */
    async init() {
        try {
            const response = await fetch(this.dataUrl);
            const data = await response.json();
            this.projects = data.projects.map(p => ({
                ...p,
                start: new Date(p.start),
                end: new Date(p.end)
            }));
            this.render();
        } catch (error) {
            if (this.container) {
                handleFetchError(error, 'load timeline data', this.container);
            }
        }
    }
    
    /**
     * Convert a date to a position percentage on the timeline
     * @method dateToPosition
     * @param {Date} date - The date to convert
     * @returns {number} Position percentage (0-100)
     */
    dateToPosition(date) {
        const daysDiff = (date - this.now) / (1000 * 60 * 60 * 24);
        let cumulativeWidth = 0;
        
        for (let seg of this.segments) {
            if (daysDiff >= seg.start && daysDiff <= seg.end) {
                const segmentProgress = (daysDiff - seg.start) / (seg.end - seg.start);
                return cumulativeWidth + segmentProgress * seg.width;
            }
            cumulativeWidth += seg.width;
        }
        
        if (daysDiff < this.segments[0].start) return 0;
        if (daysDiff > this.segments[this.segments.length - 1].end) return 100;
        return 50;
    }
    
    /**
     * Format a date to a readable string
     * @method formatDate
     * @param {Date} date - The date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    /**
     * Get time markers for the timeline
     * @method getTimeMarkers
     * @returns {Array} Array of marker objects
     */
    getTimeMarkers() {
        const markers = [];
        let cumulativeWidth = 0;
        
        this.segments.forEach((seg, idx) => {
            markers.push({
                position: cumulativeWidth,
                label: seg.start === 0 ? 'NOW' : `${seg.start}d`,
                isNow: seg.start === 0,
                isBoundary: true
            });
            
            // Add intermediate markers
            if (seg.unit === 'days') {
                for (let i = 1; i < 7; i++) {
                    const days = seg.start + (seg.end - seg.start) * (i / 7);
                    const pos = cumulativeWidth + (i / 7) * seg.width;
                    markers.push({
                        position: pos,
                        label: `${Math.round(days)}d`,
                        isNow: false,
                        isBoundary: false
                    });
                }
            } else if (seg.unit === 'months') {
                for (let i = 1; i < 3; i++) {
                    const days = seg.start + (seg.end - seg.start) * (i / 3);
                    const pos = cumulativeWidth + (i / 3) * seg.width;
                    markers.push({
                        position: pos,
                        label: `${Math.round(days / 30)}mo`,
                        isNow: false,
                        isBoundary: false
                    });
                }
            } else if (seg.unit === 'years') {
                for (let i = 1; i < 2; i++) {
                    const days = seg.start + (seg.end - seg.start) * (i / 2);
                    const pos = cumulativeWidth + (i / 2) * seg.width;
                    markers.push({
                        position: pos,
                        label: `${Math.round(days / 365)}y`,
                        isNow: false,
                        isBoundary: false
                    });
                }
            }
            
            cumulativeWidth += seg.width;
        });
        
        markers.push({
            position: 100,
            label: '+730d',
            isNow: false,
            isBoundary: true
        });
        
        return markers;
    }
    
    /**
     * Render the timeline HTML and attach event listeners
     * @method render
     */
    render() {
        if (!this.container) return;

        const timeMarkers = this.getTimeMarkers();
        const minHeight = this.projects.length * 52 + 100;
        
        this.container.innerHTML = `
            <div class="timeline-header">
                <h2 class="timeline-title">Recent Project Schedules</h2>
            </div>
            
            <div class="timeline-container">
                <div class="timeline-content" style="min-height: ${minHeight}px">
                    <!-- Segment backgrounds -->
                    <div class="timeline-segments">
                        ${this.segments.map((seg, idx) => `
                            <div class="timeline-segment ${seg.start === 0 || seg.end === 0 ? 'segment-now' : ''} ${idx % 2 === 0 ? 'segment-even' : 'segment-odd'}"
                                 style="width: ${seg.width}%">
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- Time markers -->
                    ${timeMarkers.map((marker, idx) => `
                        <div class="timeline-marker ${marker.isNow ? 'marker-now' : ''} ${marker.isBoundary ? 'marker-boundary' : 'marker-intermediate'}"
                             style="left: ${marker.position}%">
                            <div class="marker-line"></div>
                            <div class="marker-label ${marker.isNow ? 'label-now' : ''}">${marker.label}</div>
                        </div>
                    `).join('')}
                    
                    <!-- Projects -->
                    <div class="timeline-projects">
                        ${this.projects.map((project, idx) => {
                            const startPos = this.dateToPosition(project.start);
                            const endPos = this.dateToPosition(project.end);
                            const width = endPos - startPos;
                            
                            return `
                                <div class="timeline-project-wrapper">
                                    <div class="timeline-project"
                                         data-index="${idx}"
                                         style="left: ${startPos}%; width: ${width}%; --original-width: ${width}%; color: ${project.color};">
                                        <span class="project-title">${project.title}</span>
                                        <div class="project-tooltip">
                                            <div class="tooltip-title">${project.title}</div>
                                            <div class="tooltip-dates">
                                                📅 ${this.formatDate(project.start)} → ${this.formatDate(project.end)}
                                            </div>
                                            <div class="tooltip-description">${project.description}</div>
                                            <div class="tooltip-status status-${project.status}">${project.status}</div>
                                            <div class="tooltip-arrow"></div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
            </div>
        `;
        
        // Add hover event listeners
        const projectElements = this.container.querySelectorAll('.timeline-project');
        projectElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.classList.add('project-hovered');
            });
            el.addEventListener('mouseleave', () => {
                el.classList.remove('project-hovered');
            });
        });
    }
}

/**
 * Initialize timeline on page load
 * @function initTimeline
 */
export function initTimeline() {
    document.addEventListener('DOMContentLoaded', () => {
        const timeline = new SegmentedTimeline('timeline-widget', API_ENDPOINTS.TIMELINE_DATA);
        timeline.init();
    });
}

