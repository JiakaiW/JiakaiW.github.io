/**
 * Gantt Calendar Timeline Component
 * Horizontal-scroll month-grid with inline project labels
 * 
 * @module components/timeline
 */

import { handleFetchError } from '../utils/error-handler.js';
import { getElement } from '../utils/dom-registry.js';
import { API_ENDPOINTS } from '../utils/constants.js';

/**
 * GanttTimeline class
 * @class SegmentedTimeline
 */
export class SegmentedTimeline {
    constructor(containerId, dataUrl) {
        this.container = getElement(containerId);
        this.dataUrl = dataUrl || API_ENDPOINTS.TIMELINE_DATA;
        this.projects = [];
        this.now = new Date();
    }

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

    getMonthRange() {
        let earliest = new Date(Math.min(...this.projects.map(p => p.start)));
        let latest = new Date(Math.max(...this.projects.map(p => p.end)));
        earliest = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
        latest = new Date(latest.getFullYear(), latest.getMonth() + 1, 1);

        const months = [];
        let cursor = new Date(earliest);
        while (cursor < latest) {
            months.push(new Date(cursor));
            cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
        }
        return months;
    }

    isCurrentMonth(monthDate) {
        return monthDate.getFullYear() === this.now.getFullYear() &&
               monthDate.getMonth() === this.now.getMonth();
    }

    formatMonth(date) {
        const names = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        return names[date.getMonth()];
    }

    formatYear(date) {
        return "'" + String(date.getFullYear()).slice(-2);
    }

    getProjectSpan(project, months) {
        const sm = new Date(project.start.getFullYear(), project.start.getMonth(), 1);
        const em = new Date(project.end.getFullYear(), project.end.getMonth(), 1);
        let si = months.findIndex(m => m.getFullYear() === sm.getFullYear() && m.getMonth() === sm.getMonth());
        let ei = months.findIndex(m => m.getFullYear() === em.getFullYear() && m.getMonth() === em.getMonth());
        if (si === -1) si = 0;
        if (ei === -1) ei = months.length - 1;
        return { startIdx: si, endIdx: ei };
    }

    render() {
        if (!this.container) return;

        const months = this.getMonthRange();
        const totalCols = months.length;
        const rowCount = this.projects.length;

        // Month header
        const headerCells = months.map((m, i) => {
            const isCurrent = this.isCurrentMonth(m);
            const isJan = m.getMonth() === 0;
            const yearLabel = (isJan || i === 0) ? `<span class="gantt-year-label">${this.formatYear(m)}</span>` : '';
            return `<div class="gantt-month-cell ${isCurrent ? 'gantt-month-now' : ''}">${this.formatMonth(m)}${yearLabel}</div>`;
        }).join('');

        // Project rows — each row is a full-width div with the bar positioned inside
        const projectRows = this.projects.map((project, idx) => {
            const span = this.getProjectSpan(project, months);
            const leftPct = (span.startIdx / totalCols * 100).toFixed(2);
            const widthPct = ((span.endIdx - span.startIdx + 1) / totalCols * 100).toFixed(2);

            return `
                <div class="gantt-row">
                    <div class="gantt-bar"
                         style="left: ${leftPct}%; width: ${widthPct}%;"
                         data-status="${project.status}">
                        <span class="gantt-bar-title">${project.title}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Now marker position
        const nowIdx = months.findIndex(m => this.isCurrentMonth(m));
        const nowLeftPct = nowIdx !== -1 ? ((nowIdx + 0.5) / totalCols * 100).toFixed(2) : null;

        this.container.innerHTML = `
            <div class="gantt-scroll-wrapper">
                <div class="gantt-grid" style="min-width: ${totalCols * 56}px;">
                    <div class="gantt-header">
                        ${headerCells}
                    </div>
                    <div class="gantt-body">
                        ${nowLeftPct ? `<div class="gantt-now-line" style="left: ${nowLeftPct}%;"></div>` : ''}
                        ${projectRows}
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Initialize timeline on page load
 */
export function initTimeline() {
    document.addEventListener('DOMContentLoaded', () => {
        const timeline = new SegmentedTimeline('timeline-widget', API_ENDPOINTS.TIMELINE_DATA);
        timeline.init();
    });
}
