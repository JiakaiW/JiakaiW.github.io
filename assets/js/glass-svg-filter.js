/**
 * Glass SVG Filter Manager
 * Creates and manages SVG filters with displacement maps for glass edge distortion
 * Reuses filters across elements of the same size for performance
 * 
 * @module glass-svg-filter
 */

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
        // Safari: Disabled SVG filters due to severe performance issues - use basic CSS backdrop-filter only
        return {
            supportsBackdropFilter: isChromium || isSafari, // Safari supports basic backdrop-filter
            supportsRegularFilter: isChromium || isFirefox, // SVG filters via filter property in Chromium/Firefox only
            supportsSVGFilters: isChromium || isFirefox, // Explicit flag - Safari excluded due to performance
            isFirefox: isFirefox,
            isChromium: isChromium,
            isSafari: isSafari
        };
    }

    const svgFilterSupport = detectSVGFilterSupport();
    
let manager = null;

if (svgFilterSupport.supportsRegularFilter) {
    if (svgFilterSupport.supportsBackdropFilter && svgFilterSupport.isChromium) {
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
                specularBlur = 2,
                blurAmount = 5 // Default blur amount for SVG filter
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
            // Blur amount is configurable (can be 0 to remove blur)
            let blurResult = 'SourceGraphic'; // Default to source if no blur
            if (blurAmount > 0) {
            const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
            feGaussianBlur.setAttribute('in', 'SourceGraphic'); // The background image when applied to wrapper div
                feGaussianBlur.setAttribute('stdDeviation', blurAmount.toString()); // Configurable blur amount
            feGaussianBlur.setAttribute('result', 'blurred');
            filter.appendChild(feGaussianBlur);
                blurResult = 'blurred';
            }

            // Create displacement map effect
            // Apply displacement to the blurred (or original) background image
            const feDisplacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
            feDisplacementMap.setAttribute('in', blurResult); // Use blurred background as input (or SourceGraphic if blurAmount is 0)
            feDisplacementMap.setAttribute('in2', 'displacementMap');
            feDisplacementMap.setAttribute('scale', scale.toString());
            feDisplacementMap.setAttribute('xChannelSelector', 'R');
            feDisplacementMap.setAttribute('yChannelSelector', 'G');
            feDisplacementMap.setAttribute('edgeMode', 'duplicate'); // Clamp sampling to prevent going beyond bounds
            feDisplacementMap.setAttribute('result', 'displaced');
            filter.appendChild(feDisplacementMap);

            // Add saturation boost for glass effect
            const feColorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
            feColorMatrix.setAttribute('in', 'displaced');
            feColorMatrix.setAttribute('type', 'saturate');
            feColorMatrix.setAttribute('values', '1.8'); // 180% saturation
            feColorMatrix.setAttribute('result', 'saturated');
            filter.appendChild(feColorMatrix);

            // Create specular highlight using specular lighting
            // Convert displacement map to grayscale for use as surface normal
            const feColorMatrixToGray = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
            feColorMatrixToGray.setAttribute('in', 'displacementMap');
            feColorMatrixToGray.setAttribute('type', 'matrix');
            // Convert to grayscale using luminance weights
            feColorMatrixToGray.setAttribute('values', '0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0');
            feColorMatrixToGray.setAttribute('result', 'normalMap');
            filter.appendChild(feColorMatrixToGray);

            // Create specular lighting effect
            const feSpecularLighting = document.createElementNS('http://www.w3.org/2000/svg', 'feSpecularLighting');
            feSpecularLighting.setAttribute('in', 'normalMap');
            feSpecularLighting.setAttribute('surfaceScale', '3');
            feSpecularLighting.setAttribute('specularConstant', '1.2');
            feSpecularLighting.setAttribute('specularExponent', '25');
            feSpecularLighting.setAttribute('lighting-color', 'white');
            feSpecularLighting.setAttribute('result', 'specularLight');
            
            // Add distant light positioned top-left (typical light source)
            const feDistantLight = document.createElementNS('http://www.w3.org/2000/svg', 'feDistantLight');
            feDistantLight.setAttribute('azimuth', '225'); // Top-left direction (225 degrees)
            feDistantLight.setAttribute('elevation', '60'); // Angle from horizontal
            feSpecularLighting.appendChild(feDistantLight);
            filter.appendChild(feSpecularLighting);

            // Apply blur to specular highlight for softness
            const feSpecularBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
            feSpecularBlur.setAttribute('in', 'specularLight');
            feSpecularBlur.setAttribute('stdDeviation', specularBlur.toString());
            feSpecularBlur.setAttribute('result', 'specularBlurred');
            filter.appendChild(feSpecularBlur);

            // Boost saturation of specular highlight
            const feSpecularSaturation = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
            feSpecularSaturation.setAttribute('in', 'specularBlurred');
            feSpecularSaturation.setAttribute('type', 'saturate');
            feSpecularSaturation.setAttribute('values', specularSaturation.toString());
            feSpecularSaturation.setAttribute('result', 'specularSaturated');
            filter.appendChild(feSpecularSaturation);

            // Apply opacity to specular highlight
            const feSpecularOpacity = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
            feSpecularOpacity.setAttribute('in', 'specularSaturated');
            feSpecularOpacity.setAttribute('type', 'matrix');
            // Matrix: [R, G, B, A, 0] format - multiply alpha by opacity
            const opacityMatrix = `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${specularOpacity} 0`;
            feSpecularOpacity.setAttribute('values', opacityMatrix);
            feSpecularOpacity.setAttribute('result', 'specularFinal');
            filter.appendChild(feSpecularOpacity);

            // Composite specular highlight on top of saturated background
            const feComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
            feComposite.setAttribute('in', 'specularFinal');
            feComposite.setAttribute('in2', 'saturated');
            feComposite.setAttribute('operator', 'over'); // Overlay mode
            // Output directly (no result attribute means it's the final output)
            filter.appendChild(feComposite);

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
                feColorMatrixToGray,
                feSpecularLighting,
                feDistantLight,
                feSpecularBlur,
                feSpecularSaturation,
                feSpecularOpacity,
                feComposite,
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
         * Update specular highlight parameters
         * @param {HTMLElement} element - Glass element
         * @param {Object} params - Specular highlight parameters
         * @param {number} params.opacity - Specular opacity (0-1)
         * @param {number} params.saturation - Specular saturation multiplier
         * @param {number} params.blur - Specular blur amount
         */
        updateSpecularHighlight(element, params = {}) {
            const filterId = this.getFilterId(element);
            if (!filterId) return;

            const filterData = this.filters.get(filterId);
            if (!filterData) return;

            const { opacity, saturation, blur } = params;

            if (opacity !== undefined && filterData.feSpecularOpacity) {
                const opacityMatrix = `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${opacity} 0`;
                filterData.feSpecularOpacity.setAttribute('values', opacityMatrix);
            }

            if (saturation !== undefined && filterData.feSpecularSaturation) {
                filterData.feSpecularSaturation.setAttribute('values', saturation.toString());
            }

            if (blur !== undefined && filterData.feSpecularBlur) {
                filterData.feSpecularBlur.setAttribute('stdDeviation', blur.toString());
            }

            // Update stored options
            if (filterData.options) {
                if (opacity !== undefined) filterData.options.specularOpacity = opacity;
                if (saturation !== undefined) filterData.options.specularSaturation = saturation;
                if (blur !== undefined) filterData.options.specularBlur = blur;
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

    manager = new GlassSVGFilterManager();
} else {
    // Skip if SVG filters not supported at all
    console.log('SVG filters not supported, will use CSS fallback');
}

// Export singleton instance as ES6 module (or null if not supported)
export default manager;

