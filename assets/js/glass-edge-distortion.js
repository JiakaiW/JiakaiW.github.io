/**
 * Glass Edge Distortion Effect using SVG Displacement Maps
 * Tracks scroll position and updates SVG displacement maps for physics-based refraction
 * Uses Convex Squircle surface profile for realistic glass edge distortion
 * 
 * @module glass-edge-distortion
 */

import GlassDisplacementGenerator from './glass-displacement-generator.js';
import GlassSVGFilter from './glass-svg-filter.js';

// Check dependencies
if (!GlassDisplacementGenerator) {
    console.warn('GlassDisplacementGenerator not found. Make sure glass-displacement-generator.js is loaded first.');
}

if (!GlassSVGFilter) {
    console.log('SVG filters not supported, will use CSS fallback');
    // Fall back to CSS-only approach (existing implementation)
}

// Only run if backdrop-filter is supported
const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(1px)') ||
    CSS.supports('-webkit-backdrop-filter', 'blur(1px)');

let glassEdgeDistortion = null;

// Initialize glass effects if backdrop-filter is supported
// SVG filters are optional - Safari can use basic CSS backdrop-filter without SVG distortion
if (supportsBackdropFilter) {
    // Check if we have SVG filter support (Chrome/Firefox) or just basic backdrop-filter (Safari)
    const hasSVGFilterSupport = GlassDisplacementGenerator && GlassSVGFilter;

    if (!hasSVGFilterSupport) {
        console.log('SVG filters not available - Safari will use basic CSS backdrop-filter only');
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
            // Debug flag: set to true to enable verbose logging
            // Can be enabled via: glassEdgeDistortion.debugMode = true (when imported)
            this.debugMode = false;

            // Browser detection for performance optimizations
            const ua = navigator.userAgent;
            const vendor = navigator.vendor || '';
            this.isFirefox = /Firefox/.test(ua);
            this.isSafari = /Safari/.test(ua) && /Apple/.test(vendor) && !/Chrome/.test(ua);
            this.hasSVGFilterSupport = hasSVGFilterSupport; // From outer scope

            // FPS counter for performance measurement (can be enabled independently)
            this.fpsCounter = {
                frameTimes: [],
                lastFrameTime: performance.now(),
                lastLogTime: performance.now(),
                minFps: Infinity,
                maxFps: 0,
                frameCount: 0,
                enabled: false // Enable via: glassEdgeDistortion.fpsCounter.enabled = true
            };

            // Performance optimization: Cache viewport dimensions and background scaling
            // These only change on window resize, so we cache them to avoid repeated calculations
            this.viewportCache = {
                width: 0,
                height: 0,
                bgImage: null,
                scaledWidth: 0,
                scaledHeight: 0,
                offsetX: 0,
                offsetY: 0,
                coverScale: 0,
                dirty: true // Flag to indicate cache needs update
            };

            this.init();
        }

        /**
         * Update viewport cache with current dimensions and background scaling
         * Called on init and window resize
         */
        updateViewportCache() {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Check if viewport size changed
            if (this.viewportCache.width === viewportWidth &&
                this.viewportCache.height === viewportHeight &&
                !this.viewportCache.dirty) {
                return; // No change needed
            }

            // Get background image (use cache if available)
            let bgImage = this.viewportCache.bgImage;
            if (!bgImage && typeof backgroundImageCache !== 'undefined' && backgroundImageCache.image) {
                bgImage = backgroundImageCache.image;
                this.viewportCache.bgImage = bgImage;
            }

            if (bgImage && bgImage.width && bgImage.height) {
                // Calculate how the background image covers the viewport
                // Background is: background-size: cover, background-position: center, background-attachment: scroll
                const coverScale = Math.max(viewportWidth / bgImage.width, viewportHeight / bgImage.height);
                const scaledWidth = bgImage.width * coverScale;
                const scaledHeight = bgImage.height * coverScale;

                // Calculate offset for "center" positioning
                const offsetX = (scaledWidth - viewportWidth) / 2;
                const offsetY = (scaledHeight - viewportHeight) / 2;

                // Update cache
                this.viewportCache.width = viewportWidth;
                this.viewportCache.height = viewportHeight;
                this.viewportCache.scaledWidth = scaledWidth;
                this.viewportCache.scaledHeight = scaledHeight;
                this.viewportCache.offsetX = offsetX;
                this.viewportCache.offsetY = offsetY;
                this.viewportCache.coverScale = coverScale;
                this.viewportCache.dirty = false;
            } else {
                // Background image not loaded yet, mark as dirty
                this.viewportCache.dirty = true;
            }
        }

        init() {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.updateViewportCache();
                    this.startTracking();
                });
            } else {
                this.updateViewportCache();
                this.startTracking();
            }

            // Update viewport cache on window resize (throttled)
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.viewportCache.dirty = true;
                    this.updateViewportCache();
                    // Update all elements to handle layout changes (e.g. card image positioning)
                    this.updateAllElements();
                }, 100); // Throttle resize updates
            }, { passive: true });

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
                '.doc-content',
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

            // Set up scroll tracking - REMOVED for performance
            // We now use background-attachment: fixed for the main background, which doesn't require JS updates on scroll
            // Card images use background-attachment: scroll but their relative position doesn't change on scroll

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
                // Element not sized yet or hidden, skip it
                console.log(`Element ${element.className} has zero size, skipping (may be hidden or not rendered yet)`);
                return;
            }

            // Create placeholder element data first
            this.elements.set(element, {
                filterId: null,
                lastWidth: rect.width,
                lastHeight: rect.height,
                mapData: null,
                _effectiveScale: 50.0 // Initialize with default scale
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
            // Safari & Firefox: Disable SVG filters entirely due to severe performance issues
            // Use basic CSS backdrop-filter only (blur + saturation, no distortion)
            // Chrome/Edge will continue to use SVG filters for the full distortion effect
            if (!this.hasSVGFilterSupport || this.isSafari || this.isFirefox) {
                // Apply basic CSS backdrop-filter fallback
                const blurAmount = element.classList.contains('doc-content') ? '1px' : '5px';
                element.style.backdropFilter = `blur(${blurAmount}) saturate(180%)`;
                element.style.webkitBackdropFilter = `blur(${blurAmount}) saturate(180%)`;

                // Store element data without filterId
                const elementData = this.elements.get(element);
                if (elementData) {
                    elementData.filterId = null; // No SVG filter
                    elementData.filterWrapper = null; // No wrapper needed
                    elementData.lastWidth = Math.round(element.getBoundingClientRect().width);
                    elementData.lastHeight = Math.round(element.getBoundingClientRect().height);
                }
                return; // Skip SVG filter initialization
            }

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
                // Firefox: Use lower resolution (96) for better performance
                const mapResolution = this.isFirefox ? 96 : 128;
                mapData = GlassDisplacementGenerator.generateDisplacementMap(
                    width,
                    height,
                    0.03, // bezel width (3% - reduced from 8% for very subtle border)
                    mapResolution   // Lower resolution for Firefox
                );

                // Create SVG filter with moderate scale for subtle but visible distortion
                // Scale needs to be high because displacement map values are normalized
                // feDisplacementMap scale multiplies the displacement: scale * (mapValue - 128) / 128
                // Reduced from 120.0 to 50.0 for less dramatic effect
                // Firefox: Use lower scale for better performance
                const initialScale = this.isFirefox ? 40.0 : 50.0;
                // PERFORMANCE: Minimal blur for all elements - blur is expensive on large areas
                // Reduced from 1-5px to 0-1px for better scroll performance
                const blurAmount = element.classList.contains('doc-content') ? 0 : 1;
                filterId = GlassSVGFilter.createFilter(element, mapData, {
                    scale: initialScale,
                    specularOpacity: 0.2,  // Reduced from 0.4 for lighter effect and better performance
                    specularSaturation: 3, // Reduced from 6 for better performance
                    specularBlur: 2,       // Reduced from 4 for better performance
                    blurAmount: blurAmount
                });

                // Debug: Log filter creation with scale and displacement stats (only in debug mode)
                if (this.debugMode && mapData.stats) {
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
                if (this.debugMode) {
                    console.log(`Applied SVG filter ${filterId} via pseudo-element to element`, element.className);
                }
            }).catch(err => {
                console.warn('Failed to apply filter via pseudo-element:', err);
            });

            // Remove backdrop-filter when using SVG filter to improve performance
            // The pseudo-element already provides the visual effect
            element.style.backdropFilter = 'none';
            element.style.webkitBackdropFilter = 'none';

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

            // Get computed border-radius from parent element to ensure rounded corners match
            // Reuse the computedStyle we already got above
            let borderRadius = null;
            try {
                borderRadius = computedStyle.borderRadius || computedStyle.borderTopLeftRadius;
                // If no border-radius found, try to get individual corner values
                if (!borderRadius || borderRadius === '0px' || borderRadius === 'none') {
                    const brTopLeft = computedStyle.borderTopLeftRadius || '0px';
                    const brTopRight = computedStyle.borderTopRightRadius || '0px';
                    const brBottomRight = computedStyle.borderBottomRightRadius || '0px';
                    const brBottomLeft = computedStyle.borderBottomLeftRadius || '0px';
                    // If all corners are the same and not 0px, use that value
                    if (brTopLeft === brTopRight && brTopRight === brBottomRight && brBottomRight === brBottomLeft && brTopLeft !== '0px') {
                        borderRadius = brTopLeft;
                    } else if (brTopLeft !== '0px' || brTopRight !== '0px' || brBottomRight !== '0px' || brBottomLeft !== '0px') {
                        // At least one corner has radius, use shorthand
                        borderRadius = `${brTopLeft} ${brTopRight} ${brBottomRight} ${brBottomLeft}`;
                    }
                }
                // Only use if we have a valid non-zero value
                if (!borderRadius || borderRadius === '0px' || borderRadius === 'none' || borderRadius.includes('0px 0px 0px 0px')) {
                    borderRadius = null;
                }

                // Debug: Log border-radius detection for elements that should have rounded corners (only in debug mode)
                if (this.debugMode && (element.classList.contains('timeline-container') || element.classList.contains('intro-container'))) {
                    console.log(`🔵 Border-radius for ${element.className}:`, {
                        detected: borderRadius || 'none (will inherit)',
                        computed: computedStyle.borderRadius,
                        individual: {
                            topLeft: computedStyle.borderTopLeftRadius,
                            topRight: computedStyle.borderTopRightRadius,
                            bottomRight: computedStyle.borderBottomRightRadius,
                            bottomLeft: computedStyle.borderBottomLeftRadius
                        }
                    });
                }
            } catch (e) {
                console.warn('Error getting border-radius:', e);
                borderRadius = null;
            }

            // Check if this is a .doc-content element
            // If it has a card image, use that; otherwise use website background
            let backgroundImage = '/assets/background.jpg';
            let useCardImage = false;
            let docCard = null;
            let cardImage = null;

            if (element.classList.contains('doc-content')) {
                docCard = element.closest('.doc-card');
                if (docCard) {
                    // Check if card has an image
                    if (docCard.classList.contains('has-image')) {
                        cardImage = docCard.querySelector('img');
                        if (cardImage && cardImage.src) {
                            backgroundImage = cardImage.src;
                            useCardImage = true;
                            console.log('[Glass Edge Distortion] Using card image for .doc-content:', cardImage.src);
                        }
                    } else {
                        // No card image - use website background
                        useCardImage = false;
                        console.log('[Glass Edge Distortion] No card image, using website background for .doc-content');
                    }
                }
            }

            // Set up wrapper with filter - background position will be calculated and updated synchronously
            // Updates happen in same frame as filter scale to eliminate 1-frame lag
            // IMPORTANT: Use !important to override any CSS rules that might affect this wrapper
            // Some elements (like .timeline-container) have CSS rules that apply to all children
            // CRITICAL: Explicitly set border-radius to match parent for proper rounded corners
            // CRITICAL: Explicitly set border-radius to match parent for proper rounded corners
            const borderRadiusCss = borderRadius ? `border-radius: ${borderRadius} !important;` : '';

            // OPTIMIZATION: Use background-attachment: fixed for website background
            // This matches the body background and allows the browser to handle positioning natively
            // For card images, use scroll (default) as they move with the card
            const backgroundAttachment = useCardImage ? 'scroll' : 'fixed';

            // For website background, use cover to match body
            // For card images, use cover to match object-fit: cover
            const backgroundSize = 'cover';

            wrapper.style.cssText = `
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background-image: url('${backgroundImage}') !important;
                background-attachment: ${backgroundAttachment} !important;
                background-repeat: no-repeat !important;
                background-size: ${backgroundSize} !important;
                filter: url(#${filterId}) !important;
                -webkit-filter: url(#${filterId}) !important;
                ${borderRadiusCss}
                z-index: -1 !important;
                pointer-events: none !important;
                overflow: hidden !important;
            `;

            // Store whether we're using card image for background position calculations
            if (elementData) {
                elementData.useCardImage = useCardImage;
                if (useCardImage && cardImage) {
                    elementData.cardImage = cardImage;
                }
            }

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
         * Uses viewport-based background positioning
         * IMPORTANT: Since background-attachment: scroll, the background is relative to element
         * We need to calculate position based on element's current viewport position
         */
        async updateWrapperBackgroundPosition(element, wrapper, elementRect = null) {
            const isIntroContainer = element.classList.contains('intro-container');
            if (this.debugMode && isIntroContainer) {
                console.log('[updateWrapperBackgroundPosition] intro-container: Called', {
                    'elementRect': elementRect ? { top: elementRect.top.toFixed(0), left: elementRect.left.toFixed(0) } : 'null'
                });
            }

            const elementData = this.elements.get(element);
            const useCardImage = elementData?.useCardImage;
            const isDocContent = element.classList.contains('doc-content');

            // Use passed rect or get it (performance: prefer passed rect to avoid duplicate getBoundingClientRect)
            if (!elementRect) {
                elementRect = element.getBoundingClientRect();
            }

            // Handle card images differently from website background
            if (useCardImage && elementData?.cardImage) {
                const cardImage = elementData.cardImage;
                const docCard = element.closest('.doc-card');
                const cardRect = docCard.getBoundingClientRect();

                // Wait for image to load if needed
                if (!cardImage.complete || cardImage.naturalWidth === 0) {
                    await new Promise((resolve, reject) => {
                        if (cardImage.complete) {
                            resolve();
                            return;
                        }
                        cardImage.onload = resolve;
                        cardImage.onerror = reject;
                    });
                }

                // Calculate where doc-content is positioned relative to card
                const relativeX = elementRect.left - cardRect.left;
                const relativeY = elementRect.top - cardRect.top;

                // Card image covers entire card with object-fit: cover
                // This means the image is scaled to cover the card while maintaining aspect ratio
                const imageAspect = cardImage.naturalWidth / cardImage.naturalHeight;
                const cardAspect = cardRect.width / cardRect.height;

                // Calculate how the image covers the card (object-fit: cover behavior)
                let coverScale, scaledWidth, scaledHeight, offsetX, offsetY;

                if (imageAspect > cardAspect) {
                    // Image is wider - scale to fit height, crop sides
                    coverScale = cardRect.height / cardImage.naturalHeight;
                    scaledHeight = cardRect.height;
                    scaledWidth = cardImage.naturalWidth * coverScale;
                    offsetX = (scaledWidth - cardRect.width) / 2; // How much is cropped on each side
                    offsetY = 0;
                } else {
                    // Image is taller - scale to fit width, crop top/bottom
                    coverScale = cardRect.width / cardImage.naturalWidth;
                    scaledWidth = cardRect.width;
                    scaledHeight = cardImage.naturalHeight * coverScale;
                    offsetX = 0;
                    offsetY = (scaledHeight - cardRect.height) / 2; // How much is cropped on top/bottom
                }

                // The wrapper background should show the image at the same scale as the card image
                // The card image is scaled by coverScale, so we apply the same scale to the wrapper
                // Calculate background size: scale the image by the same coverScale factor
                const bgScaledWidth = cardImage.naturalWidth * coverScale;
                const bgScaledHeight = cardImage.naturalHeight * coverScale;
                wrapper.style.backgroundSize = `${bgScaledWidth}px ${bgScaledHeight}px`;

                // Calculate background position to show the portion behind doc-content
                // The card image covers the card, with the card positioned at (offsetX, offsetY) in scaled image space
                // The doc-content is at (relativeX, relativeY) in card space
                // In scaled image space, doc-content starts at:
                const imageX = offsetX + relativeX;
                const imageY = offsetY + relativeY;

                // Position the background so that the portion at (imageX, imageY) in scaled image space
                // appears at (0, 0) in the wrapper (which is the top-left of doc-content)
                wrapper.style.backgroundPosition = `${-imageX}px ${-imageY}px`;

                return;
            }

            // For website background (fixed attachment), simply match body background
            // Since background-attachment is fixed, the browser handles the positioning relative to the viewport
            // We just need to ensure alignment matches the body background
            wrapper.style.backgroundPosition = 'center';
            // backgroundSize is already set to 'cover' in applyFilterViaPseudoElement
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
            // Measure FPS if enabled (independent of debugMode)
            const now = performance.now();
            if (this.fpsCounter.enabled) {
                const frameTime = now - this.fpsCounter.lastFrameTime;
                this.fpsCounter.lastFrameTime = now;

                if (frameTime > 0) {
                    const fps = 1000 / frameTime;
                    this.fpsCounter.frameTimes.push(fps);
                    this.fpsCounter.frameCount++;

                    // Keep only last 60 frames (1 second at 60fps)
                    if (this.fpsCounter.frameTimes.length > 60) {
                        this.fpsCounter.frameTimes.shift();
                    }

                    // Track min/max
                    if (fps < this.fpsCounter.minFps) {
                        this.fpsCounter.minFps = fps;
                    }
                    if (fps > this.fpsCounter.maxFps) {
                        this.fpsCounter.maxFps = fps;
                    }

                    // Log FPS every 2 seconds (make it stand out)
                    if (now - this.fpsCounter.lastLogTime > 2000) {
                        const avgFps = this.fpsCounter.frameTimes.length > 0
                            ? this.fpsCounter.frameTimes.reduce((a, b) => a + b, 0) / this.fpsCounter.frameTimes.length
                            : 0;
                        console.log(`%c[Glass FPS] Current: ${fps.toFixed(1)} | Avg: ${avgFps.toFixed(1)} | Min: ${this.fpsCounter.minFps.toFixed(1)} | Max: ${this.fpsCounter.maxFps.toFixed(1)} | Frames: ${this.fpsCounter.frameCount}`, 'color: #00ff00; font-weight: bold; font-size: 14px;');
                        this.fpsCounter.lastLogTime = now;
                    }
                }
            } else if (!this.fpsCounter.enabled && this.fpsCounter.frameTimes.length === 0) {
                // Initialize FPS counter timing on first call
                this.fpsCounter.lastFrameTime = now;
                this.fpsCounter.lastLogTime = now;
            }

            const scrollY = window.scrollY || window.pageYOffset;
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            // Batch background position updates to reduce DOM reflows
            const bgPositionUpdates = [];

            // Iterate over Map keys (elements), not values
            this.elements.forEach((elementData, element) => {
                // Performance: Skip elements that are far outside viewport
                // Only update if element is in viewport (or close to it) - reduces unnecessary work
                if (!element || typeof element.getBoundingClientRect !== 'function') {
                    return;
                }

                // Get bounding rect once (will be cached and reused in updateElement)
                const rect = element.getBoundingClientRect();

                // Visibility check: Only update elements near viewport (performance optimization)
                // IMPORTANT: Always update elements that are partially visible (spanning viewport)
                // This ensures large elements continue updating even when their edges are far outside viewport
                const isPartiallyVisible = rect.bottom > 0 && rect.top < viewportHeight;

                // For elements not in viewport, check if they're within margin
                const margin = 200; // Update elements within 200px of viewport
                const isNearViewport = rect.bottom >= -margin &&
                    rect.top <= viewportHeight + margin &&
                    rect.right >= -margin &&
                    rect.left <= viewportWidth + margin;

                // Always update if element is partially visible OR near viewport
                if (isPartiallyVisible || isNearViewport) {
                    // Update element and collect background position updates for batching
                    const bgUpdate = this.updateElement(element, scrollY, rect);

                    // Debug logging for intro-container (only in debug mode)
                    if (this.debugMode && element.classList.contains('intro-container')) {
                        const elementData = this.elements.get(element);
                        const updateResult = bgUpdate ? 'function' : (bgUpdate === null ? 'null' : 'undefined');
                        console.log('[Visibility] intro-container:', {
                            'rect.top': rect.top.toFixed(0),
                            'rect.bottom': rect.bottom.toFixed(0),
                            'viewportHeight': viewportHeight,
                            'isPartiallyVisible': isPartiallyVisible,
                            'isNearViewport': isNearViewport,
                            'willCallUpdateElement': true,
                            'bgUpdateReturned': updateResult,
                            'hasElementData': !!elementData,
                            'hasFilterWrapper': !!elementData?.filterWrapper,
                            'hasFilterId': !!elementData?.filterId,
                            'lastRect': elementData?._lastElementRect,
                            'elementIsConnected': element.isConnected
                        });
                    }

                    if (bgUpdate) {
                        bgPositionUpdates.push(bgUpdate);
                    }
                }
            });

            // Execute background position updates asynchronously (deferred to next frame)
            // This spreads work across frames for better performance in all browsers
            // Additionally, deferring background position updates may improve visual consistency:
            // - Filter distortion is processed first (expensive SVG computation)
            // - Background position updates after filter is fully processed
            // - This ensures the distorted image is ready before positioning, potentially reducing visual desync
            // Trade-off: 1-frame lag, but smoother performance and potentially better visual consistency
            if (bgPositionUpdates.length > 0) {
                requestAnimationFrame(() => {
                    bgPositionUpdates.forEach((update, idx) => {
                        try {
                            update();
                        } catch (err) {
                            console.error(`[Update] Error executing background position update ${idx}:`, err);
                        }
                    });
                });
            }
        }

        updateElement(element, scrollY = null, rect = null) {
            if (!element || !element.isConnected) {
                if (element && element.classList.contains('intro-container')) {
                    console.log('[updateElement] intro-container: element not connected or null');
                }
                return null;
            }

            const elementData = this.elements.get(element);
            if (!elementData) {
                if (element.classList.contains('intro-container')) {
                    console.log('[updateElement] intro-container: no elementData in Map');
                }
                return null;
            }

            scrollY = scrollY !== null ? scrollY : (window.scrollY || window.pageYOffset);

            // Performance: Cache getBoundingClientRect result (expensive operation)
            // Pass rect from updateAllElements to avoid duplicate calls
            if (!rect) {
                rect = element.getBoundingClientRect();
            }

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

            // Calculate which region of the background is behind this element
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
            // Reduced base scale for less dramatic effect
            // feDisplacementMap scale directly multiplies pixel displacement
            // With maxDisplacement of 127, scale of 50 gives ~50px displacement at edges
            const baseScale = 50.0; // Reduced from 120.0 to 50.0 for less dramatic effect
            const edgeScale = maxDistance * 12.0; // Reduced from 30.0 to 12.0
            const scrollVariation = Math.sin(scrollY * 0.001) * 6.0; // Reduced from 15.0 to 6.0
            const backgroundVariation = Math.sin(backgroundX * Math.PI * 2) * 4.0; // Reduced from 10.0 to 4.0

            // Calculate dynamic scale adjustment near page edges
            // When element is near bottom, reduce magnification effect to prevent sampling beyond bounds
            const pageHeight = document.body.scrollHeight || document.documentElement.scrollHeight;
            const elementBottom = scrollY + rect.bottom;
            const distanceToBottom = pageHeight - elementBottom;
            const threshold = rect.height * 2; // Start adjusting 2x element height from bottom

            let edgeScaleAdjustment = 0;
            if (distanceToBottom < threshold && distanceToBottom > 0) {
                // Gradually reduce magnification effect near bottom
                // Interpolate from normal scale to reduced scale (closer to 0 = less magnification)
                const progress = distanceToBottom / threshold;
                // Reduce scale by up to 50% when very close to bottom
                edgeScaleAdjustment = baseScale * 0.5 * (1 - progress);
            }

            const scale = baseScale - edgeScaleAdjustment + edgeScale + scrollVariation + backgroundVariation;

            // Store effective scale for background position calculation
            elementData._effectiveScale = scale;

            // Calculate per-axis target alpha (magnification factor) based on displacement scale
            // Higher displacement scale = more magnification = smaller alpha (< 1)
            // Displacement scale ~50 on 300px element ≈ alpha ~0.8-0.9
            // We calculate per-axis to allow independent headroom constraints
            const w_obj = rect.width;
            const h_obj = rect.height;
            const avgDimension = (w_obj + h_obj) / 2;

            // Base target alpha from displacement scale (magnifying glass effect)
            // Estimate: alpha ≈ 1 - (displacement / element_dimension)
            // For magnifying glass: sample smaller region, expand to element size
            // Typical magnification: 0.7-0.95 (10-30% magnification)
            const baseTargetAlpha = 1.0 - (scale / (avgDimension * 3.0));
            const clampedBaseAlpha = Math.max(0.7, Math.min(baseTargetAlpha, 0.95)); // Clamp to reasonable range [0.7, 0.95]

            // Store per-axis target alpha values
            // These will be constrained by headroom in updateWrapperBackgroundPosition
            elementData._targetAlphaX = clampedBaseAlpha;
            elementData._targetAlphaY = clampedBaseAlpha;

            // Update filter scale (this is the main scroll-based update)
            // Skip if no SVG filter support (Safari) or no filterId
            if (elementData.filterId && this.hasSVGFilterSupport) {
                GlassSVGFilter.updateFilterScale(element, scale);

                // Update wrapper background position on scroll
                // Background position updates are deferred to next frame (async) for better performance
                // This spreads work across frames and may improve visual consistency by ensuring
                // filter distortion is fully processed before background position updates
                // With background-attachment: scroll, we use viewport coordinates directly
                // Viewport coordinates change on scroll, ensuring background updates correctly
                // Performance: Use cached rect, batch updates, optimize threshold
                // Skip if no wrapper (Safari uses basic CSS backdrop-filter only)
                if (elementData.filterWrapper && this.hasSVGFilterSupport) {
                    const lastRect = elementData._lastElementRect;

                    // Check if element is partially visible (spans viewport boundaries)
                    // For partially visible elements, always update to ensure smooth scrolling
                    const isPartiallyVisible = rect.bottom > 0 && rect.top < window.innerHeight;

                    // Check if position changed (optimized threshold for performance)
                    // Firefox: Use larger threshold (2px) to reduce update frequency
                    const positionThreshold = this.isFirefox ? 2.0 : 1.0;
                    const positionChanged = !lastRect ||
                        (isPartiallyVisible && !this.isFirefox) || // Firefox: Don't force update for partially visible
                        Math.abs(rect.left - lastRect.left) > positionThreshold ||
                        Math.abs(rect.top - lastRect.top) > positionThreshold;

                    // Debug logging for intro-container (only in debug mode)
                    if (this.debugMode && element.classList.contains('intro-container')) {
                        console.log('[updateElement] intro-container filterWrapper check:', {
                            'hasFilterWrapper': true,
                            'isPartiallyVisible': isPartiallyVisible,
                            'rect.top': rect.top.toFixed(0),
                            'lastRect': lastRect,
                            'positionChanged': positionChanged,
                            'willReturnUpdate': positionChanged
                        });
                    }

                    if (positionChanged) {
                        // Return update function for batching (single RAF loop optimization)
                        // This avoids nested RAF calls and batches DOM updates
                        const isIntroContainer = element.classList.contains('intro-container');
                        return () => {
                            if (this.debugMode && isIntroContainer) {
                                console.log('[RAF Update] intro-container: Executing background position update', {
                                    'rect.top': rect.top.toFixed(0),
                                    'rect.left': rect.left.toFixed(0)
                                });
                            }

                            // Update background position using cached rect (performance optimization)
                            this.updateWrapperBackgroundPosition(element, elementData.filterWrapper, rect)
                                .then(() => {
                                    if (this.debugMode && isIntroContainer) {
                                        console.log('[RAF Update] intro-container: Background position updated successfully');
                                    }
                                    elementData._lastElementRect = { left: rect.left, top: rect.top };
                                })
                                .catch(err => {
                                    console.warn('[RAF Update] Failed to update wrapper background position:', err);
                                    if (isIntroContainer) {
                                        console.error('[RAF Update] intro-container update failed:', err);
                                    }
                                });
                        };
                    } else {
                        if (this.debugMode && element.classList.contains('intro-container')) {
                            console.log('[updateElement] intro-container: positionChanged=false, not updating');
                        }
                    }
                } else {
                    if (this.debugMode && element.classList.contains('intro-container')) {
                        console.log('[updateElement] intro-container: NO filterWrapper!');
                    }
                }
            }

            // Debug: Log scale updates occasionally (throttled, only in debug mode)
            if (this.debugMode && elementData.filterId && (!elementData._lastScaleLog || Date.now() - elementData._lastScaleLog > 2000)) {
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

            return null; // No background update needed
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
                                node.matches('.doc-content') ||
                                node.matches('.timeline-container')
                            )) {
                                console.log('MutationObserver: Found new glass element', node.className, node);
                                this.addElement(node);
                            }

                            // Check for glass elements within the node
                            const glassElements = node.querySelectorAll ?
                                node.querySelectorAll('.glass-base, .btn-glass, .intro-container, .theme-block, .photo-card, .news-item, .expanded-card, .card-text, .doc-content, .timeline-container') :
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
    glassEdgeDistortion = new GlassEdgeDistortion();

    // Make available globally for console debugging
    // Access via: window.glassEdgeDistortion
    if (typeof window !== 'undefined') {
        window.glassEdgeDistortion = glassEdgeDistortion;
    }
}

// Export as ES6 module (or null if dependencies not available)
export default glassEdgeDistortion;