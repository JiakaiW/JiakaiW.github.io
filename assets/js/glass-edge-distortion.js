/**
 * Glass Edge Distortion Effect using SVG Displacement Maps
 * Tracks scroll position and updates SVG displacement maps for physics-based refraction
 * Uses Convex Squircle surface profile for realistic glass edge distortion
 */

(function() {
    'use strict';

    // Check dependencies
    if (typeof GlassDisplacementGenerator === 'undefined') {
        console.warn('GlassDisplacementGenerator not found. Make sure glass-displacement-generator.js is loaded first.');
        return;
    }

    if (typeof GlassSVGFilter === 'undefined' || GlassSVGFilter === null) {
        console.log('SVG filters not supported, will use CSS fallback');
        // Fall back to CSS-only approach (existing implementation)
        return;
    }

    // Only run if backdrop-filter is supported
    const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(1px)') ||
                                   CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
    
    if (!supportsBackdropFilter) {
        return;
    }

    class GlassEdgeDistortion {
        constructor() {
            this.elements = new Map(); // element -> {filterId, lastSize, mapData}
            this.rafId = null;
            this.lastScrollY = 0;
            this.isTracking = false;
            this.intersectionObserver = null;
            this.maxFilters = 30; // Increased limit - filters are reused for same-size elements
            this.filterReuseMap = new Map(); // size key -> filterId for reuse
            
            this.init();
        }

        init() {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.startTracking());
            } else {
                this.startTracking();
            }

            // Handle dynamic content
            this.observeNewElements();
        }

        startTracking() {
            // Find all glass elements
            const selectors = [
                '.glass-base',
                '.btn-glass',
                '.intro-container',
                '.theme-block',
                '.photo-card',
                '.news-item',
                '.expanded-card',
                '.card-text',
                '.timeline-container'
            ];

            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                console.log(`Found ${elements.length} elements for selector: ${selector}`);
                elements.forEach(el => {
                    console.log(`Adding element for glass effect:`, el.className, selector);
                    this.addElement(el);
                });
            });

            // Set up scroll tracking with throttling
            let ticking = false;
            const handleScroll = () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.updateAllElements();
                        ticking = false;
                    });
                    ticking = true;
                }
            };

            window.addEventListener('scroll', handleScroll, { passive: true });
            
            // Initial update
            this.updateAllElements();
        }

        addElement(element) {
            if (this.elements.has(element)) {
                console.log('Element already tracked:', element.className);
                return;
            }

            console.log('Adding element to glass effect tracking:', element.className, element);

            // Check filter limit (based on unique filter count, not element count)
            // Since we reuse filters for same-size elements, this allows more elements
            if (this.filterReuseMap.size >= this.maxFilters) {
                console.warn(`Maximum filter limit reached (${this.maxFilters} unique sizes), skipping element. Total elements: ${this.elements.size}`);
                return;
            }

            // Initialize displacement map and filter
            const rect = element.getBoundingClientRect();
            console.log(`Element ${element.className} rect:`, { width: rect.width, height: rect.height });
            if (rect.width === 0 || rect.height === 0) {
                // Element not sized yet, try again later
                console.log(`Element ${element.className} not sized yet, retrying...`);
                setTimeout(() => this.addElement(element), 100);
                return;
            }

            // Create placeholder element data first
            this.elements.set(element, {
                filterId: null,
                lastWidth: rect.width,
                lastHeight: rect.height,
                mapData: null
            });

            // Initialize filter (will update elementData)
            this.initializeElementFilter(element);

            // Set up IntersectionObserver for performance
            if (!this.intersectionObserver) {
                this.intersectionObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.updateElement(entry.target);
                        }
                    });
                }, {
                    threshold: 0.01,
                    rootMargin: '50px'
                });
            }

            this.intersectionObserver.observe(element);
        }

        initializeElementFilter(element) {
            const rect = element.getBoundingClientRect();
            const width = Math.round(rect.width);
            const height = Math.round(rect.height);
            
            // Create size key for filter reuse (round to nearest 50px for better reuse)
            const sizeKey = `${Math.round(width / 50) * 50}x${Math.round(height / 50) * 50}`;
            
            // Check if we can reuse an existing filter for this size
            let filterId = this.filterReuseMap.get(sizeKey);
            let mapData = null;
            
            if (!filterId) {
                // Generate displacement map for new size
                // Reduced bezel width to 3% for very subtle distorted border region
                mapData = GlassDisplacementGenerator.generateDisplacementMap(
                    width,
                    height,
                    0.03, // bezel width (3% - reduced from 8% for very subtle border)
                    128   // map resolution
                );

                // Create SVG filter with much higher scale for visible distortion
                // Scale needs to be high because displacement map values are normalized
                // feDisplacementMap scale multiplies the displacement: scale * (mapValue - 128) / 128
                // For highly visible effect, we need scale of 100-150+ pixels
                // With maxDisplacement of 127, scale of 96 gives ~96px displacement at edges (20% reduction)
                const initialScale = 96.0; // Reduced from 120.0 to 96.0 (20% reduction for less dramatic effect)
                filterId = GlassSVGFilter.createFilter(element, mapData, {
                    scale: initialScale,
                    specularOpacity: 0.4,
                    specularSaturation: 6,
                    specularBlur: 2
                });
                
                // Debug: Log filter creation with scale and displacement stats
                if (mapData.stats) {
                    // feDisplacementMap formula: displacement = scale * (mapValue - 128) / 128
                    // With maxDisplacement of 127 (mapValue ranges from 1 to 255, neutral=128)
                    // Max displacement = scale * (255 - 128) / 128 = scale * 127 / 128 ≈ scale
                    const effectiveMaxPixelDisplacement = (initialScale * mapData.stats.maxDisplacement / 128).toFixed(1);
                    console.log(`Created filter ${filterId} for ${element.className}:`, {
                        elementSize: `${width}x${height}`,
                        initialScale: initialScale,
                        maxDisplacement: mapData.stats.maxDisplacement.toFixed(2),
                        avgDisplacement: mapData.stats.avgDisplacement.toFixed(2),
                        effectiveMaxPixelDisplacement: effectiveMaxPixelDisplacement + 'px',
                        note: 'Displacement should be clearly visible at edges'
                    });
                }
                
                // Store for reuse
                this.filterReuseMap.set(sizeKey, filterId);
            } else {
                // Reuse existing filter - get mapData from stored filter if needed
                const filterData = GlassSVGFilter.filters?.get(filterId);
                if (filterData) {
                    mapData = filterData.mapData;
                }
            }

            // Apply filter - use pseudo-element approach for ALL browsers
            // SVG filters in backdrop-filter don't seem to work reliably in Chrome
            // Using pseudo-element with regular filter property works better
            this.applyFilterViaPseudoElement(element, filterId, rect).then(() => {
                console.log(`Applied SVG filter ${filterId} via pseudo-element to element`, element.className);
            }).catch(err => {
                console.warn('Failed to apply filter via pseudo-element:', err);
            });
            
            // Keep backdrop-filter for basic blur/saturation (fallback)
            // The SVG filter on pseudo-element will handle the distortion
            element.style.backdropFilter = 'blur(5px) saturate(180%)';
            element.style.webkitBackdropFilter = 'blur(5px) saturate(180%)';
            
            // Also set as CSS custom property for debugging
            element.style.setProperty('--svg-filter-id', filterId);

            // Store element data
            const elementData = this.elements.get(element);
            if (elementData) {
                elementData.filterId = filterId;
                elementData.mapData = mapData;
                elementData.lastWidth = width;
                elementData.lastHeight = height;
                elementData.sizeKey = sizeKey; // Store size key for cleanup
            }
            
            // Track that this element is using this filter
            // (for cleanup when element is removed)
            if (!GlassSVGFilter.filterUsage) {
                GlassSVGFilter.filterUsage = new Map(); // filterId -> Set of elements
            }
            if (!GlassSVGFilter.filterUsage.has(filterId)) {
                GlassSVGFilter.filterUsage.set(filterId, new Set());
            }
            GlassSVGFilter.filterUsage.get(filterId).add(element);
        }

        /**
         * Apply SVG filter via pseudo-element (works for all browsers)
         * Creates a wrapper div that shows the background with the filter applied
         * This approach works better than backdrop-filter with SVG filters
         */
        async applyFilterViaPseudoElement(element, filterId, rect) {
            // Ensure element has position context
            const computedStyle = window.getComputedStyle(element);
            if (computedStyle.position === 'static') {
                element.style.position = 'relative';
            }
            
            // Check if wrapper already exists
            const elementData = this.elements.get(element);
            if (elementData && elementData.filterWrapper) {
                // Update existing wrapper filter
                elementData.filterWrapper.style.filter = `url(#${filterId})`;
                elementData.filterWrapper.style.webkitFilter = `url(#${filterId})`;
                // Update background position
                await this.updateWrapperBackgroundPosition(element, elementData.filterWrapper);
                return;
            }
            
            // Create wrapper div that shows the background with the filter applied
            // This works with regular filter property, which is more reliable than backdrop-filter
            const wrapper = document.createElement('div');
            wrapper.className = 'glass-svg-filter-background';
            wrapper.setAttribute('data-filter-id', filterId);
            
            // Set up wrapper with filter - background position will be calculated and updated
            wrapper.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: url('/assets/background.jpg');
                background-attachment: fixed;
                background-repeat: no-repeat;
                filter: url(#${filterId});
                -webkit-filter: url(#${filterId});
                border-radius: inherit;
                z-index: -1;
                pointer-events: none;
                overflow: hidden;
            `;
            
            // Insert wrapper first
            element.insertBefore(wrapper, element.firstChild);
            
            // Calculate and set correct background position and size
            await this.updateWrapperBackgroundPosition(element, wrapper);
            
            // Store wrapper reference
            if (elementData) {
                elementData.filterWrapper = wrapper;
            }
        }
        
        /**
         * Update wrapper background position to show only the portion behind the element
         * Uses the same calculation as WebGL renderer for consistency
         * IMPORTANT: Since background-attachment: fixed, the background is fixed to viewport
         * We need to calculate position based on element's current viewport position
         */
        async updateWrapperBackgroundPosition(element, wrapper) {
            // Use shared background image cache if available, otherwise load it
            let bgImage;
            if (typeof backgroundImageCache !== 'undefined' && backgroundImageCache.image) {
                bgImage = backgroundImageCache.image;
            } else {
                // Load background image
                bgImage = new Image();
                bgImage.crossOrigin = 'anonymous';
                await new Promise((resolve, reject) => {
                    bgImage.onload = resolve;
                    bgImage.onerror = reject;
                    bgImage.src = '/assets/background.jpg';
                });
            }
            
            const elementRect = element.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Calculate how the background image covers the viewport (same as WebGL renderer)
            // Background is: background-size: cover, background-position: center, background-attachment: fixed
            const coverScale = Math.max(viewportWidth / bgImage.width, viewportHeight / bgImage.height);
            const scaledWidth = bgImage.width * coverScale;
            const scaledHeight = bgImage.height * coverScale;
            
            // Calculate offset for "center" positioning
            // The scaled image is centered, so we need to find where the viewport starts in the scaled image
            const offsetX = (scaledWidth - viewportWidth) / 2;
            const offsetY = (scaledHeight - viewportHeight) / 2;
            
            // Calculate the source rectangle in the scaled image that corresponds to the element's viewport position
            // Element position relative to viewport: (rect.left, rect.top)
            // Map this to the scaled image space
            // For fixed background, element position is always relative to viewport (not document)
            let sourceX = elementRect.left + offsetX;
            let sourceY = elementRect.top + offsetY;
            
            // IMPORTANT: With background-attachment: fixed, the background is fixed to the viewport.
            // The background-position we set positions the background relative to the viewport,
            // not relative to the wrapper div. So we need to ensure the background position
            // corresponds to where the element actually is in the viewport.
            //
            // However, we still need to clamp to prevent showing portions beyond the scaled image.
            // But we should clamp based on what's actually visible, not based on the element's full height.
            // For tall elements, we want to show the portion that's behind the element's top edge,
            // even if the bottom extends beyond the image (it will just show empty/transparent).
            
            // Clamp to ensure we don't go negative (showing before the image starts)
            sourceX = Math.max(0, sourceX);
            sourceY = Math.max(0, sourceY);
            
            // For the maximum bounds, we only need to ensure the top-left corner is within bounds.
            // The element might extend beyond the image, but that's okay - CSS will handle it.
            // We clamp to prevent the background from being positioned beyond the image bounds,
            // which would cause it to not show at all.
            const maxSourceX = scaledWidth;
            const maxSourceY = scaledHeight;
            
            // Clamp to maximum bounds (but allow element to extend beyond if needed)
            sourceX = Math.min(sourceX, maxSourceX);
            sourceY = Math.min(sourceY, maxSourceY);
            
            // Set background-size to match the scaled size
            // Set background-position to show the correct portion
            // Use negative values to shift the background image
            wrapper.style.backgroundSize = `${scaledWidth}px ${scaledHeight}px`;
            wrapper.style.backgroundPosition = `${-sourceX}px ${-sourceY}px`;
            
            // Store the calculation for debugging
            const elementData = this.elements.get(element);
            if (elementData && elementData.filterWrapper === wrapper) {
                const unclampedSourceX = elementRect.left + offsetX;
                const unclampedSourceY = elementRect.top + offsetY;
                elementData._lastBgPos = { 
                    sourceX, 
                    sourceY,
                    unclampedSourceX,
                    unclampedSourceY,
                    elementRect: { left: elementRect.left, top: elementRect.top, width: elementRect.width, height: elementRect.height },
                    scaledSize: { width: scaledWidth, height: scaledHeight },
                    offset: { x: offsetX, y: offsetY },
                    maxBounds: { x: maxSourceX, y: maxSourceY },
                    clamped: {
                        x: sourceX !== unclampedSourceX,
                        y: sourceY !== unclampedSourceY
                    },
                    // Check if element extends beyond background
                    extendsBeyondBackground: {
                        x: elementRect.left + elementRect.width > viewportWidth,
                        y: elementRect.top + elementRect.height > viewportHeight,
                        bottom: (sourceY + elementRect.height) > scaledHeight
                    }
                };
            }
        }

        removeElement(element) {
            const elementData = this.elements.get(element);
            if (elementData) {
                if (elementData.filterId) {
                    // Remove element from filter usage tracking
                    if (GlassSVGFilter.filterUsage) {
                        const usageSet = GlassSVGFilter.filterUsage.get(elementData.filterId);
                        if (usageSet) {
                            usageSet.delete(element);
                            // If no more elements use this filter, we could remove it
                            // But for now, we'll keep it for potential reuse
                        }
                    }
                    
                    // Only remove filter if this was the only element using it
                    // Otherwise, keep it for reuse
                    // GlassSVGFilter.removeFilter(element); // Commented out for reuse
                }
                // Clean up Firefox wrapper element if it exists
                if (elementData.filterWrapper && elementData.filterWrapper.parentNode) {
                    elementData.filterWrapper.parentNode.removeChild(elementData.filterWrapper);
                }
            }
            this.elements.delete(element);
            if (this.intersectionObserver) {
                this.intersectionObserver.unobserve(element);
            }
        }

        updateAllElements() {
            const scrollY = window.scrollY || window.pageYOffset;
            const viewportHeight = window.innerHeight;
            
            // Iterate over Map keys (elements), not values
            this.elements.forEach((elementData, element) => {
                // Only update if element is in viewport (or close to it)
                if (!element || typeof element.getBoundingClientRect !== 'function') {
                    return;
                }
                const rect = element.getBoundingClientRect();
                const isNearViewport = rect.bottom >= -100 && rect.top <= viewportHeight + 100;
                
                if (isNearViewport) {
                    this.updateElement(element, scrollY);
                }
            });
        }

        updateElement(element, scrollY = null) {
            if (!element || !element.isConnected) {
                return;
            }

            const elementData = this.elements.get(element);
            if (!elementData) {
                return;
            }

            scrollY = scrollY !== null ? scrollY : (window.scrollY || window.pageYOffset);
            const rect = element.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            // Check if element size changed significantly (need to regenerate map)
            const width = Math.round(rect.width);
            const height = Math.round(rect.height);
            const sizeChanged = Math.abs(width - elementData.lastWidth) > 10 ||
                               Math.abs(height - elementData.lastHeight) > 10;

            if (sizeChanged && width > 0 && height > 0) {
                // Regenerate displacement map for new size
                this.initializeElementFilter(element);
                return; // Will update on next frame
            }

            // Calculate which region of the fixed background is behind this element
            const elementCenterX = rect.left + rect.width / 2;
            const elementCenterY = rect.top + rect.height / 2;
            const backgroundX = elementCenterX / viewportWidth;
            const backgroundY = (elementCenterY + scrollY) / viewportHeight;

            // Calculate distortion scale based on background region
            // Different background regions cause different refraction intensities
            const viewportCenterX = viewportWidth / 2;
            const viewportCenterY = viewportHeight / 2;
            const distanceFromCenterX = Math.abs(elementCenterX - viewportCenterX) / viewportWidth;
            const distanceFromCenterY = Math.abs(elementCenterY - viewportCenterY) / viewportHeight;
            const maxDistance = Math.max(distanceFromCenterX, distanceFromCenterY);
            
            // Base scale with variation based on scroll and background position
            // Reduced by 20% for less dramatic effect
            // feDisplacementMap scale directly multiplies pixel displacement
            // With maxDisplacement of 127, scale of 96 gives ~96px displacement at edges
            const baseScale = 96.0; // Reduced from 120.0 to 96.0 (20% reduction)
            const edgeScale = maxDistance * 24.0; // Reduced from 30.0 to 24.0 (20% reduction)
            const scrollVariation = Math.sin(scrollY * 0.001) * 12.0; // Reduced from 15.0 to 12.0 (20% reduction)
            const backgroundVariation = Math.sin(backgroundX * Math.PI * 2) * 8.0; // Reduced from 10.0 to 8.0 (20% reduction)
            const scale = baseScale + edgeScale + scrollVariation + backgroundVariation;

            // Update filter scale (this is the main scroll-based update)
            if (elementData.filterId) {
                GlassSVGFilter.updateFilterScale(element, scale);
                
                // Update wrapper background position on scroll (for fixed background)
                // Since background-attachment: fixed, the background is fixed to viewport
                // We only need to update when element's viewport position changes significantly
                // Throttle updates to avoid jittery movement
                if (elementData.filterWrapper) {
                    const currentRect = element.getBoundingClientRect();
                    const lastRect = elementData._lastElementRect;
                    const lastUpdateTime = elementData._lastBgUpdateTime || 0;
                    const now = Date.now();
                    
                    // Only update if:
                    // 1. Element's viewport position changed significantly (more than 2px), OR
                    // 2. It's been more than 100ms since last update (throttle)
                    const positionChanged = !lastRect || 
                        Math.abs(currentRect.left - lastRect.left) > 2 || 
                        Math.abs(currentRect.top - lastRect.top) > 2;
                    const timeElapsed = now - lastUpdateTime > 100;
                    
                    if (positionChanged && timeElapsed) {
                        // Update background position asynchronously (don't await to avoid blocking)
                        this.updateWrapperBackgroundPosition(element, elementData.filterWrapper).catch(err => {
                            console.warn('Failed to update wrapper background position:', err);
                        });
                        elementData._lastElementRect = { left: currentRect.left, top: currentRect.top };
                        elementData._lastBgUpdateTime = now;
                    }
                }
                
                // Debug: Log scale updates occasionally (throttled)
                if (!elementData._lastScaleLog || Date.now() - elementData._lastScaleLog > 2000) {
                    console.log(`Updated filter scale for ${element.className}:`, {
                        filterId: elementData.filterId,
                        scale: scale.toFixed(2),
                        baseScale: baseScale.toFixed(2),
                        edgeScale: edgeScale.toFixed(2),
                        scrollVariation: scrollVariation.toFixed(2),
                        backgroundVariation: backgroundVariation.toFixed(2)
                    });
                    elementData._lastScaleLog = Date.now();
                }
            }
        }

        observeNewElements() {
            // Watch for dynamically added glass elements
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            // Check if node itself is a glass element
                            if (node.matches && (
                                node.matches('.glass-base') ||
                                node.matches('.btn-glass') ||
                                node.matches('.intro-container') ||
                                node.matches('.theme-block') ||
                                node.matches('.photo-card') ||
                                node.matches('.news-item') ||
                                node.matches('.expanded-card') ||
                                node.matches('.card-text') ||
                                node.matches('.timeline-container')
                            )) {
                                console.log('MutationObserver: Found new glass element', node.className, node);
                                this.addElement(node);
                            }

                            // Check for glass elements within the node
                            const glassElements = node.querySelectorAll ?
                                node.querySelectorAll('.glass-base, .btn-glass, .intro-container, .theme-block, .photo-card, .news-item, .expanded-card, .card-text, .timeline-container') :
                                [];
                            glassElements.forEach(el => {
                                console.log('MutationObserver: Found glass element in children', el.className, el);
                                this.addElement(el);
                            });
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Also check for timeline-container after a delay (in case it's created asynchronously)
            setTimeout(() => {
                const timelineContainers = document.querySelectorAll('.timeline-container');
                console.log(`Delayed check: Found ${timelineContainers.length} timeline-container elements`);
                timelineContainers.forEach(el => {
                    if (!this.elements.has(el)) {
                        console.log('Delayed check: Adding timeline-container', el);
                        this.addElement(el);
                    }
                });
            }, 1500); // Wait 1.5s for async timeline.init() to complete
        }

        destroy() {
            if (this.intersectionObserver) {
                this.intersectionObserver.disconnect();
            }
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
            }
            this.elements.clear();
        }
    }

    // Initialize
    const glassEdgeDistortion = new GlassEdgeDistortion();

    // Export for potential manual control
    window.GlassEdgeDistortion = glassEdgeDistortion;

})();

