// Segmented Timeline Widget - Vanilla JS
// Matches liquid glass theme aesthetic

class SegmentedTimeline {
    constructor(containerId, dataUrl) {
        this.container = document.getElementById(containerId);
        this.dataUrl = dataUrl;
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
            console.error('Failed to load timeline data:', error);
            this.container.innerHTML = '<p style="color: rgba(255,255,255,0.7);">Failed to load timeline</p>';
        }
    }
    
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
    
    formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
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
    
    render() {
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const timeline = new SegmentedTimeline('timeline-widget', '/timeline-data.json');
    timeline.init();
});

