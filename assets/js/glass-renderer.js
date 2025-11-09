/**
 * Glass Renderer Approach Switch System
 * Manages switching between different rendering approaches (CSS, SVG)
 * 
 * @module glass-renderer
 */

    const GlassRenderer = {
        // Available rendering approaches
        APPROACHES: {
            CSS: 'css',      // Hardware-accelerated CSS backdrop-filter (best for scrolling performance)
            SVG: 'svg'       // SVG filters (requires backdrop-filter)
        },

        // Current approach (default: CSS for best performance)
        // CSS backdrop-filter is handled by the browser's compositor, providing:
        // - Smooth 60fps scrolling
        // - Hardware acceleration
        // - No JavaScript overhead
        // - Lower battery usage
        currentApproach: 'css',

        // Feature detection results
        features: {
            backdropFilter: false
        },

        // Initialize feature detection
        detectFeatures() {
            // Backdrop filter support
            this.features.backdropFilter = CSS.supports('backdrop-filter', 'blur(1px)') ||
                                         CSS.supports('-webkit-backdrop-filter', 'blur(1px)');

            // Log detection results
            console.log('Glass renderer feature detection:', {
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

            // Validate approach availability
            if (approach === this.APPROACHES.SVG && !this.features.backdropFilter) {
                console.warn('SVG filters require backdrop-filter support. Falling back to CSS.');
                approach = this.APPROACHES.CSS;
            }
            
            // If backdrop-filter is not available, CSS approach will use basic styling
            if (!this.features.backdropFilter && approach === this.APPROACHES.CSS) {
                console.warn('CSS backdrop-filter not available. Using basic CSS fallback.');
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

// Export as ES6 module
export default GlassRenderer;

