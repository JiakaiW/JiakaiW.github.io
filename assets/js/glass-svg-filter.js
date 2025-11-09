/**
 * Glass SVG Filter Manager
 * Creates and manages SVG filters with displacement maps for glass edge distortion
 * Reuses filters across elements of the same size for performance
 */

(function() {
    'use strict';

    // Check browser capabilities for SVG filters
    function detectSVGFilterSupport() {
        const ua = navigator.userAgent;
        const vendor = navigator.vendor || '';
        
        // Safari includes "Chrome" in UA but has different vendor
        const isSafari = /Safari/.test(ua) && /Apple/.test(vendor) && !/Chrome/.test(ua);
        const isChrome = /Chrome/.test(ua) && /Google/.test(vendor) && !/Edg/.test(ua);
        const isEdge = /Edg/.test(ua);
        const isFirefox = /Firefox/.test(ua);
        const isChromium = (isChrome || isEdge) && !isSafari;
        
        console.log('SVG Filter Browser Detection:', {
            ua: ua.substring(0, 100),
            vendor: vendor,
            isSafari: isSafari,
            isChrome: isChrome,
            isEdge: isEdge,
            isFirefox: isFirefox,
            isChromium: isChromium
        });
        
        // Chromium browsers support SVG filters in backdrop-filter
        // Firefox supports SVG filters in regular filter property (we'll use pseudo-element approach)
        // Safari doesn't support SVG filters in backdrop-filter
        return {
            supportsBackdropFilter: isChromium,
            supportsRegularFilter: isChromium || isFirefox,
            isFirefox: isFirefox,
            isChromium: isChromium
        };
    }

    const svgFilterSupport = detectSVGFilterSupport();
    
    if (!svgFilterSupport.supportsRegularFilter) {
        // Skip if SVG filters not supported at all
        console.log('SVG filters not supported, will use CSS fallback');
        window.GlassSVGFilter = null;
        return;
    }
    
    if (svgFilterSupport.supportsBackdropFilter) {
        console.log('Initializing SVG filter manager for backdrop-filter (Chrome/Edge)');
    } else {
        console.log('Initializing SVG filter manager for regular filter (Firefox) - using pseudo-element approach');
    }

    class GlassSVGFilterManager {
        constructor() {
            this.filters = new Map(); // Map of filterId -> filter element
            this.elementFilters = new Map(); // Map of element -> filterId
            this.filterCounter = 0;
            this.svgDefs = null;
            this.useBackdropFilter = svgFilterSupport.supportsBackdropFilter;
            this.isFirefox = svgFilterSupport.isFirefox;
            this.init();
        }

        init() {
            // Create or get SVG defs container
            this.createSVGDefs();
        }

        createSVGDefs() {
            // Check if SVG defs already exists
            let svg = document.getElementById('glass-svg-filters');
            if (svg) {
                this.svgDefs = svg.querySelector('defs') || svg;
                return;
            }

            // Create SVG element for filters
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.id = 'glass-svg-filters';
            svg.style.cssText = 'position: absolute; width: 0; height: 0;';
            svg.setAttribute('aria-hidden', 'true');
            
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            svg.appendChild(defs);
            
            document.body.appendChild(svg);
            this.svgDefs = defs;
        }

        /**
         * Create or get SVG filter for an element
         * @param {HTMLElement} element - Glass element
         * @param {Object} mapData - Displacement map data from generator
         * @param {Object} options - Filter options
         * @returns {string} Filter ID
         */
        createFilter(element, mapData, options = {}) {
            const {
                scale = 1.0,
                specularOpacity = 0.4,
                specularSaturation = 6,
                specularBlur = 2
            } = options;

            // Check if element already has a filter
            if (this.elementFilters.has(element)) {
                const existingFilterId = this.elementFilters.get(element);
                // Update existing filter if needed
                this.updateFilterDisplacementMap(existingFilterId, mapData, scale);
                return existingFilterId;
            }

            // Generate unique filter ID
            const filterId = `glass-displacement-${++this.filterCounter}`;
            
            // Create filter element
            const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
            filter.id = filterId;
            filter.setAttribute('x', '0%');
            filter.setAttribute('y', '0%');
            filter.setAttribute('width', '100%');
            filter.setAttribute('height', '100%');
            filter.setAttribute('color-interpolation-filters', 'sRGB');

            // Create displacement map image
            const feImage = document.createElementNS('http://www.w3.org/2000/svg', 'feImage');
            const dataURL = this.imageDataToDataURL(mapData.imageData);
            feImage.setAttribute('href', dataURL);
            feImage.setAttribute('result', 'displacementMap');
            feImage.setAttribute('preserveAspectRatio', 'none');
            filter.appendChild(feImage);

            // For regular filter property (applied to wrapper div with background-image)
            // SourceGraphic is the element's content (the background image in our case)
            // Apply blur FIRST (before displacement) so distortion is visible
            // Minimized blur to maximize distortion visibility
            const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
            feGaussianBlur.setAttribute('in', 'SourceGraphic'); // The background image when applied to wrapper div
            feGaussianBlur.setAttribute('stdDeviation', '5'); // Reduced to 5px to maximize distortion visibility
            feGaussianBlur.setAttribute('result', 'blurred');
            filter.appendChild(feGaussianBlur);

            // Create displacement map effect
            // Apply displacement to the blurred background image
            const feDisplacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
            feDisplacementMap.setAttribute('in', 'blurred'); // Use blurred background as input
            feDisplacementMap.setAttribute('in2', 'displacementMap');
            feDisplacementMap.setAttribute('scale', scale.toString());
            feDisplacementMap.setAttribute('xChannelSelector', 'R');
            feDisplacementMap.setAttribute('yChannelSelector', 'G');
            feDisplacementMap.setAttribute('result', 'displaced');
            filter.appendChild(feDisplacementMap);

            // Add saturation boost for glass effect
            const feColorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
            feColorMatrix.setAttribute('in', 'displaced');
            feColorMatrix.setAttribute('type', 'saturate');
            feColorMatrix.setAttribute('values', '1.8'); // 180% saturation
            // Output directly (no result attribute means it's the final output)
            filter.appendChild(feColorMatrix);

            // Add filter to defs
            this.svgDefs.appendChild(filter);
            
            // Verify filter is in DOM
            const filterInDOM = document.getElementById(filterId);
            if (!filterInDOM) {
                console.error(`Filter ${filterId} was not added to DOM!`);
            } else {
                console.log(`Filter ${filterId} verified in DOM, parent:`, filterInDOM.parentNode?.tagName);
            }
            
            // Store references
            this.filters.set(filterId, {
                element: filter,
                feImage,
                feDisplacementMap,
                mapData,
                options
            });
            this.elementFilters.set(element, filterId);

            console.log(`Created SVG filter ${filterId} for element`, element.className, 'Scale:', scale,
                       'Filter element:', filter, 'In DOM:', !!filterInDOM);
            return filterId;
        }

        /**
         * Update displacement map for an existing filter
         * @param {string} filterId - Filter ID
         * @param {Object} mapData - New displacement map data
         * @param {number} scale - Displacement scale
         */
        updateFilterDisplacementMap(filterId, mapData, scale = 1.0) {
            const filterData = this.filters.get(filterId);
            if (!filterData) return;

            // Update displacement map image
            const dataURL = this.imageDataToDataURL(mapData.imageData);
            filterData.feImage.setAttribute('href', dataURL);
            
            // Update scale if provided
            if (scale !== undefined) {
                filterData.feDisplacementMap.setAttribute('scale', scale.toString());
            }

            // Update stored map data
            filterData.mapData = mapData;
        }

        /**
         * Get filter ID for an element
         * @param {HTMLElement} element - Glass element
         * @returns {string|null} Filter ID or null
         */
        getFilterId(element) {
            return this.elementFilters.get(element) || null;
        }

        /**
         * Remove filter for an element
         * @param {HTMLElement} element - Glass element
         */
        removeFilter(element) {
            const filterId = this.elementFilters.get(element);
            if (!filterId) return;

            const filterData = this.filters.get(filterId);
            if (filterData && filterData.element.parentNode) {
                filterData.element.parentNode.removeChild(filterData.element);
            }

            this.filters.delete(filterId);
            this.elementFilters.delete(element);
        }

        /**
         * Convert ImageData to data URL
         * @param {ImageData} imageData - Image data
         * @returns {string} Data URL
         */
        imageDataToDataURL(imageData) {
            const canvas = document.createElement('canvas');
            canvas.width = imageData.width;
            canvas.height = imageData.height;
            const ctx = canvas.getContext('2d');
            ctx.putImageData(imageData, 0, 0);
            return canvas.toDataURL('image/png');
        }

        /**
         * Update filter scale (for scroll-based intensity changes)
         * @param {HTMLElement} element - Glass element
         * @param {number} scale - New scale value
         */
        updateFilterScale(element, scale) {
            const filterId = this.getFilterId(element);
            if (!filterId) return;

            const filterData = this.filters.get(filterId);
            if (filterData) {
                filterData.feDisplacementMap.setAttribute('scale', scale.toString());
            }
        }

        /**
         * Clean up all filters
         */
        destroy() {
            this.elementFilters.forEach((filterId, element) => {
                this.removeFilter(element);
            });
            if (this.svgDefs && this.svgDefs.parentNode) {
                this.svgDefs.parentNode.remove();
            }
        }
    }

    // Export singleton instance
    const manager = new GlassSVGFilterManager();
    window.GlassSVGFilter = manager;
    // Expose browser capability flags
    window.GlassSVGFilter.useBackdropFilter = manager.useBackdropFilter;
    window.GlassSVGFilter.isFirefox = manager.isFirefox;
    // Expose filters map for reuse checking
    window.GlassSVGFilter.filters = manager.filters;

})();

