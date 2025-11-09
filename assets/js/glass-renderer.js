/**
 * Glass Renderer Approach Switch System
 * Manages switching between different rendering approaches (CSS, SVG, WebGL)
 */

(function() {
    'use strict';

    const GlassRenderer = {
        // Available rendering approaches
        APPROACHES: {
            CSS: 'css',      // Hardware-accelerated CSS backdrop-filter (best for scrolling performance)
            SVG: 'svg',      // SVG filters (requires backdrop-filter)
            WEBGL: 'webgl'   // WebGL shaders (fallback only - not performant for scrolling)
        },

        // Current approach (default: CSS for best performance)
        // CSS backdrop-filter is handled by the browser's compositor, providing:
        // - Smooth 60fps scrolling
        // - Hardware acceleration
        // - No JavaScript overhead
        // - Lower battery usage
        // WebGL is kept as fallback for browsers without backdrop-filter support
        currentApproach: 'css',

        // Feature detection results
        features: {
            webgl: false,
            webgl2: false,
            backdropFilter: false
        },

        // Initialize feature detection
        detectFeatures() {
            // WebGL 2.0 support
            const canvas = document.createElement('canvas');
            let gl2 = null;
            try {
                gl2 = canvas.getContext('webgl2', {
                    alpha: true,
                    antialias: true,
                    premultipliedAlpha: false
                });
            } catch (e) {
                console.warn('WebGL 2.0 context creation failed:', e);
            }
            this.features.webgl2 = !!gl2;

            // WebGL 1.0 support (fallback)
            let gl = null;
            try {
                gl = canvas.getContext('webgl', {
                    alpha: true,
                    antialias: true,
                    premultipliedAlpha: false
                }) || canvas.getContext('experimental-webgl', {
                    alpha: true,
                    antialias: true,
                    premultipliedAlpha: false
                });
            } catch (e) {
                console.warn('WebGL 1.0 context creation failed:', e);
            }
            this.features.webgl = !!gl;

            // Backdrop filter support
            this.features.backdropFilter = CSS.supports('backdrop-filter', 'blur(1px)') ||
                                         CSS.supports('-webkit-backdrop-filter', 'blur(1px)');

            // Log detection results
            console.log('WebGL feature detection:', {
                webgl2: this.features.webgl2,
                webgl: this.features.webgl,
                backdropFilter: this.features.backdropFilter
            });

            return this.features;
        },

        // Set rendering approach
        setApproach(approach) {
            if (!Object.values(this.APPROACHES).includes(approach)) {
                console.warn(`Invalid approach: ${approach}. Using default: ${this.APPROACHES.CSS}`);
                approach = this.APPROACHES.CSS;
            }

            // Smart fallback logic: prefer CSS backdrop-filter for performance
            // Only use WebGL if CSS backdrop-filter is not available
            if (approach === this.APPROACHES.CSS && !this.features.backdropFilter) {
                console.warn('CSS backdrop-filter not available. Falling back to WebGL.');
                if (this.features.webgl || this.features.webgl2) {
                    approach = this.APPROACHES.WEBGL;
                } else {
                    console.warn('WebGL also not available. Using basic CSS fallback.');
                }
            }

            // Validate approach availability
            if (approach === this.APPROACHES.WEBGL && !this.features.webgl && !this.features.webgl2) {
                console.warn('WebGL not available. Falling back to CSS.');
                approach = this.APPROACHES.CSS;
            }

            if (approach === this.APPROACHES.SVG && !this.features.backdropFilter) {
                console.warn('SVG filters require backdrop-filter support. Falling back to CSS.');
                approach = this.APPROACHES.CSS;
            }

            const previousApproach = this.currentApproach;
            this.currentApproach = approach;

            // Dispatch change event
            const event = new CustomEvent('glassRendererChange', {
                detail: {
                    previous: previousApproach,
                    current: approach,
                    features: this.features
                }
            });
            document.dispatchEvent(event);

            // Update data attribute on document
            document.documentElement.setAttribute('data-glass-approach', approach);

            return approach;
        },

        // Get current approach
        getApproach() {
            return this.currentApproach;
        },

        // Check if approach is available
        isApproachAvailable(approach) {
            switch (approach) {
                case this.APPROACHES.WEBGL:
                    return this.features.webgl || this.features.webgl2;
                case this.APPROACHES.SVG:
                    return this.features.backdropFilter;
                case this.APPROACHES.CSS:
                    return true; // CSS is always available
                default:
                    return false;
            }
        },

        // Initialize renderer
        init(preferredApproach = null) {
            // Detect features first
            this.detectFeatures();

            // Set approach (use preferred or default to CSS for best performance)
            // CSS backdrop-filter is hardware-accelerated and provides smooth scrolling
            const approach = preferredApproach || this.APPROACHES.CSS;
            this.setApproach(approach);

            // Add class to document for CSS targeting
            document.documentElement.classList.add(`glass-approach-${this.currentApproach}`);

            return {
                approach: this.currentApproach,
                features: this.features
            };
        }
    };

    // Detect features immediately (don't wait for DOM)
    // This allows other scripts to check features right away
    GlassRenderer.detectFeatures();

    // Auto-initialize on DOM ready (this sets the approach)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            GlassRenderer.init();
        });
    } else {
        GlassRenderer.init();
    }

    // Export to window for global access
    window.GlassRenderer = GlassRenderer;

})();

