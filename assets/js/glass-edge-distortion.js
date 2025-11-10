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

            // Set up scroll tracking with RAF loop (performance optimization)
            // Filter scale updates happen in RAF frame, background position updates deferred to next frame
            // This spreads work across frames for better performance and may improve visual consistency
            // Browser-specific performance optimizations
            let ticking = false;
            let lastUpdateTime = 0;
            const firefoxThrottleMs = 25; // ~40fps max for Firefox (increased from 16ms for better performance)
            
            const handleScroll = () => {
                const now = performance.now();
                const timeSinceLastUpdate = now - lastUpdateTime;
                
                // Firefox: throttle to max 40fps to improve performance (SVG filters are slower in Firefox)
                if (this.isFirefox && timeSinceLastUpdate < firefoxThrottleMs) {
                    return; // Skip this scroll event
                }
                
                // Safari: No throttling needed - SVG filters are disabled, only CSS backdrop-filter
                
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        // Execute all updates synchronously in single frame for better performance and visual sync
                        this.updateAllElements();
                        lastUpdateTime = performance.now();
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
            // Safari: Disable SVG filters entirely due to severe performance issues
            // Use basic CSS backdrop-filter only (blur + saturation, no distortion)
            if (!this.hasSVGFilterSupport || this.isSafari) {
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
                // Tiny blur for doc-content elements, normal blur for others
                // Firefox: Reduce blur for better performance
                const blurAmount = element.classList.contains('doc-content') 
                    ? (this.isFirefox ? 0 : 1) 
                    : (this.isFirefox ? 3 : 5);
                filterId = GlassSVGFilter.createFilter(element, mapData, {
                    scale: initialScale,
                    specularOpacity: 0.4,
                    specularSaturation: 6,
                    specularBlur: 4,
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
            
            // Keep backdrop-filter for basic blur/saturation (fallback)
            // The SVG filter on pseudo-element will handle the distortion
            // Minimal blur for doc-content elements to avoid heavy blur
            const blurAmount = element.classList.contains('doc-content') ? '0px' : '0px';
            element.style.backdropFilter = `blur(${blurAmount}) saturate(180%)`;
            element.style.webkitBackdropFilter = `blur(${blurAmount}) saturate(180%)`;
            
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
            const borderRadiusCss = borderRadius ? `border-radius: ${borderRadius} !important;` : '';
            const backgroundAttachment = 'scroll'; // Always use scroll for correct positioning
            // For website background, background-size will be set in updateWrapperBackgroundPosition
            // For card images, use cover to match object-fit: cover
            const backgroundSize = useCardImage ? 'cover' : 'auto'; // Will be updated in updateWrapperBackgroundPosition
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
            
            // Original logic for website background (fixed attachment)
            // Update viewport cache if dirty (background image might have loaded)
            if (this.viewportCache.dirty) {
                this.updateViewportCache();
            }
            
            // Use cached viewport dimensions and background scaling (performance optimization)
            const viewportWidth = this.viewportCache.width || window.innerWidth;
            const viewportHeight = this.viewportCache.height || window.innerHeight;
            let scaledWidth = this.viewportCache.scaledWidth;
            let scaledHeight = this.viewportCache.scaledHeight;
            const offsetX = this.viewportCache.offsetX;
            const offsetY = this.viewportCache.offsetY;
            
            // If scaled dimensions are 0 or invalid, recalculate from background image
            if (!scaledWidth || !scaledHeight || scaledWidth === 0 || scaledHeight === 0) {
                // Recalculate cache to ensure we have valid dimensions
                this.viewportCache.dirty = true;
                this.updateViewportCache();
                scaledWidth = this.viewportCache.scaledWidth || viewportWidth;
                scaledHeight = this.viewportCache.scaledHeight || viewportHeight;
            }
            
            // Get background image from cache
            let bgImage = this.viewportCache.bgImage;
            if (!bgImage) {
                // Fallback: use shared background image cache if available
                if (typeof backgroundImageCache !== 'undefined' && backgroundImageCache.image) {
                    bgImage = backgroundImageCache.image;
                    this.viewportCache.bgImage = bgImage;
                    // Recalculate cache with new image
                    this.viewportCache.dirty = true;
                    this.updateViewportCache();
                    // Re-read scaled dimensions after cache update
                    scaledWidth = this.viewportCache.scaledWidth || viewportWidth;
                    scaledHeight = this.viewportCache.scaledHeight || viewportHeight;
                } else {
                    // Load background image (shouldn't happen often)
                    bgImage = new Image();
                    bgImage.crossOrigin = 'anonymous';
                    await new Promise((resolve, reject) => {
                        bgImage.onload = () => {
                            this.viewportCache.bgImage = bgImage;
                            this.viewportCache.dirty = true;
                            this.updateViewportCache();
                            // Re-read scaled dimensions after cache update
                            scaledWidth = this.viewportCache.scaledWidth || viewportWidth;
                            scaledHeight = this.viewportCache.scaledHeight || viewportHeight;
                            resolve();
                        };
                        bgImage.onerror = reject;
                        bgImage.src = '/assets/background.jpg';
                    });
                }
            }
            
            // Final check: if dimensions are still 0, use viewport dimensions as fallback
            if (!scaledWidth || !scaledHeight || scaledWidth === 0 || scaledHeight === 0) {
                console.warn('[Glass Edge Distortion] Scaled dimensions still 0, using viewport dimensions as fallback');
                scaledWidth = viewportWidth;
                scaledHeight = viewportHeight;
            }
            
            // MATHEMATICAL APPROACH: Use element CENTER for positioning
            // 
            // Object in viewport:
            //   - Center: (x_obj, y_obj) in viewport coordinates
            //   - Dimensions: w_obj × h_obj
            //   - Borders: x_obj ± w_obj/2, y_obj ± h_obj/2
            //
            // Background region (with magnification factor α, where α < 1):
            //   - Should sample from: x_bg ± α·w_obj/2, y_bg ± α·h_obj/2
            //   - Where x_bg, y_bg is the background coordinate corresponding to viewport x_obj, y_obj
            //   - For magnifying glass: α < 1 means we sample a smaller region and expand it
            //
            // To center the background region on the element:
            //   - Background region center should be at (x_bg, y_bg)
            //   - Background region extends ±(α·w_obj/2, α·h_obj/2) from center
            //   - Total region size: α·w_obj × α·h_obj (smaller than element for magnification)
            //
            // background-position specifies where the top-left of the background image is positioned
            // To center the background region at (x_bg, y_bg), the background top-left should be at:
            //   - x_pos = x_bg - (α·w_obj/2)
            //   - y_pos = y_bg - (α·h_obj/2)
            //
            // This ensures the center of the sampled region aligns with the element center
            
            // With background-attachment: scroll, background scrolls with element automatically
            // This means: when element moves in viewport, background moves with it
            // So we should use viewport coordinates directly (NOT document coordinates)
            // The background-position is relative to the element, and since background scrolls
            // with element, we just need to map viewport position to background image coordinates
            const x_obj = elementRect.left + elementRect.width / 2;
            const y_obj = elementRect.top + elementRect.height / 2;
            const w_obj = elementRect.width;
            const h_obj = elementRect.height;
            
            // Background coordinate corresponding to element center
            // Use viewport coordinates directly - background scrolls with element automatically
            // offsetX/Y represent how background covers viewport (centering offset)
            const x_bg = x_obj + offsetX;
            const y_bg = y_obj + offsetY;
            
            // Get requested magnification factor (alpha) from elementData
            // Use per-axis alpha if available, otherwise calculate from effective scale
            // Note: elementData was already declared at the start of this function
            // For doc-content without images, use alpha=1.0 (no magnification) for simpler, more accurate positioning
            let requestedAlphaX = 1.0;
            let requestedAlphaY = 1.0;
            
            if (elementData && !isDocContent) {
                // Prefer per-axis alpha values if they were calculated in updateElement
                if (elementData._targetAlphaX !== undefined && elementData._targetAlphaY !== undefined) {
                    requestedAlphaX = elementData._targetAlphaX;
                    requestedAlphaY = elementData._targetAlphaY;
                } else if (elementData._effectiveScale !== undefined) {
                    // Fallback: calculate from effective scale (uniform alpha, magnifying)
                    const displacementScale = elementData._effectiveScale || 50.0;
                    const avgDimension = (w_obj + h_obj) / 2;
                    const uniformAlpha = 1.0 - (displacementScale / (avgDimension * 3.0));
                    requestedAlphaX = Math.max(0.7, Math.min(uniformAlpha, 0.95));
                    requestedAlphaY = requestedAlphaX;
                }
            }
            // For doc-content, keep alpha at 1.0 (no magnification) for direct 1:1 mapping
            
            // For doc-content elements, use simple direct mapping (no magnification)
            // This ensures the background shows exactly what's behind the element
            let finalSourceX, finalSourceY, sampledWidth, sampledHeight, sourceX, sourceY;
            let alphaX, alphaY, safeAlphaX, safeAlphaY;
            let headroomLeft, headroomRight, headroomTop, headroomBottom;
            
            if (isDocContent) {
                // Simple 1:1 mapping - show the portion of background directly behind the element
                // Element top-left in viewport: (elementRect.left, elementRect.top)
                // With scroll attachment, use viewport coordinates directly (background scrolls with element)
                const bgLeft = elementRect.left + offsetX;
                const bgTop = elementRect.top + offsetY;
                
                // Use element dimensions directly (no magnification)
                sampledWidth = w_obj;
                sampledHeight = h_obj;
                
                // No magnification for doc-content
                alphaX = 1.0;
                alphaY = 1.0;
                safeAlphaX = 1.0;
                safeAlphaY = 1.0;
                
                // Headroom not used for doc-content (no magnification), set to 0 for debugging
                headroomLeft = 0;
                headroomRight = 0;
                headroomTop = 0;
                headroomBottom = 0;
                
                // Position background to show the region starting at (bgLeft, bgTop)
                sourceX = bgLeft;
                sourceY = bgTop;
                
                // IMPORTANT: With background-attachment: scroll, negative values are valid!
                // The background scrolls with the element, so we can use negative positions
                // to show portions of the background when element is partially outside viewport
                // Only clamp to prevent showing beyond background image bounds (upper bound)
                finalSourceX = Math.min(sourceX, scaledWidth - sampledWidth);
                finalSourceY = Math.min(sourceY, scaledHeight - sampledHeight);
            } else {
                // Original complex calculation for other elements (with magnification)
            // Calculate headroom from element center to background edges
            // Headroom determines how much we can shrink the sampled region (for magnification)
            headroomLeft = x_bg; // Distance to left edge
            headroomRight = scaledWidth - x_bg; // Distance to right edge
            headroomTop = y_bg; // Distance to top edge
            headroomBottom = scaledHeight - y_bg; // Distance to bottom edge
            
            // Calculate maximum safe alpha for each axis (for magnifying glass, alpha < 1)
            // For magnifying: sample smaller region (alpha * dimension), need headroom >= (alpha * dimension) / 2
            // Safe alpha = min(2 * headroom / dimension) for each side, but ensure minimum of 0.7
            // For X: need headroom >= (alphaX * w_obj) / 2 on both sides
            const safeAlphaXLeft = headroomLeft >= (w_obj * 0.7 / 2) ? Math.max(0.7, 2 * headroomLeft / w_obj) : 0.7;
            const safeAlphaXRight = headroomRight >= (w_obj * 0.7 / 2) ? Math.max(0.7, 2 * headroomRight / w_obj) : 0.7;
            safeAlphaX = Math.min(safeAlphaXLeft, safeAlphaXRight);
            
            // For Y: need headroom >= (alphaY * h_obj) / 2 on both sides
            const safeAlphaYTop = headroomTop >= (h_obj * 0.7 / 2) ? Math.max(0.7, 2 * headroomTop / h_obj) : 0.7;
            const safeAlphaYBottom = headroomBottom >= (h_obj * 0.7 / 2) ? Math.max(0.7, 2 * headroomBottom / h_obj) : 0.7;
            safeAlphaY = Math.min(safeAlphaYTop, safeAlphaYBottom);
            
            // Use minimum of requested and safe alpha for each axis
            // This ensures sampled region always fits within background bounds
            // For magnifying, we want the smaller alpha (more magnification) that's still safe
            alphaX = Math.min(requestedAlphaX, safeAlphaX);
            alphaY = Math.min(requestedAlphaY, safeAlphaY);
            
            // Sampled region dimensions (with per-axis magnification factors)
            // For magnifying glass: sample smaller region, expand to element size
                sampledWidth = alphaX * w_obj;
                sampledHeight = alphaY * h_obj;
            
            // Calculate source position from element center
            // Since we've already constrained alpha to safe values, we can directly calculate
            // without needing to clamp the center position
            sourceX = x_bg - sampledWidth / 2;
            sourceY = y_bg - sampledHeight / 2;
            
            // IMPORTANT: With background-attachment: scroll, negative values are valid!
            // The background scrolls with the element, so we can use negative positions
            // to show portions of the background when element is partially outside viewport
            // Only clamp to prevent showing beyond background image bounds (upper bound)
            // Note: We removed Math.max(0, ...) to allow negative values for elements above viewport
            finalSourceX = Math.min(sourceX, scaledWidth - sampledWidth);
            finalSourceY = Math.min(sourceY, scaledHeight - sampledHeight);
            }
            
            // Track if alpha was reduced from requested value (for debugging)
            // Only relevant for non-doc-content elements (doc-content uses alpha=1.0)
            const alphaReducedX = !isDocContent && (sampledWidth / w_obj) < requestedAlphaX;
            const alphaReducedY = !isDocContent && (sampledHeight / h_obj) < requestedAlphaY;
            
            // Set background-size to match the scaled size
            // Set background-position to show the correct portion
            // Use negative values to shift the background image
            // 
            // With background-attachment: scroll, background-position is relative to wrapper element
            // The background scrolls with the element automatically, so we use viewport coordinates directly
            const bgSize = `${scaledWidth}px ${scaledHeight}px`;
            const bgPos = `${-finalSourceX}px ${-finalSourceY}px`;
            
            if (this.debugMode && isIntroContainer) {
                // Check wrapper state before setting
                const wrapperInDOM = wrapper.isConnected;
                const wrapperDisplay = window.getComputedStyle(wrapper).display;
                const wrapperVisibility = window.getComputedStyle(wrapper).visibility;
                const wrapperOpacity = window.getComputedStyle(wrapper).opacity;
                const wrapperZIndex = window.getComputedStyle(wrapper).zIndex;
                const wrapperPosition = window.getComputedStyle(wrapper).position;
                const wrapperWidth = window.getComputedStyle(wrapper).width;
                const wrapperHeight = window.getComputedStyle(wrapper).height;
                const wrapperTop = window.getComputedStyle(wrapper).top;
                const wrapperLeft = window.getComputedStyle(wrapper).left;
                const wrapperOverflow = window.getComputedStyle(wrapper).overflow;
                const currentBgPos = window.getComputedStyle(wrapper).backgroundPosition;
                const currentBgSize = window.getComputedStyle(wrapper).backgroundSize;
                const currentBgImage = window.getComputedStyle(wrapper).backgroundImage;
                
                // Check parent overflow
                let parentOverflow = 'none';
                let parentElement = element.parentElement;
                while (parentElement && parentElement !== document.body) {
                    const parentOverflowStyle = window.getComputedStyle(parentElement).overflow;
                    if (parentOverflowStyle !== 'visible') {
                        parentOverflow = `${parentOverflowStyle} (on ${parentElement.tagName}.${parentElement.className})`;
                        break;
                    }
                    parentElement = parentElement.parentElement;
                }
                
                // Get wrapper bounding rect
                const wrapperRect = wrapper.getBoundingClientRect();
                const elementRectForCheck = elementRect || element.getBoundingClientRect();
                
                console.log('[updateWrapperBackgroundPosition] intro-container: Setting background', {
                    'backgroundSize': bgSize,
                    'backgroundPosition': bgPos,
                    'finalSourceX': finalSourceX.toFixed(0),
                    'finalSourceY': finalSourceY.toFixed(0),
                    'wrapperState': {
                        'inDOM': wrapperInDOM,
                        'display': wrapperDisplay,
                        'visibility': wrapperVisibility,
                        'opacity': wrapperOpacity,
                        'zIndex': wrapperZIndex,
                        'position': wrapperPosition,
                        'top': wrapperTop,
                        'left': wrapperLeft,
                        'width': wrapperWidth,
                        'height': wrapperHeight,
                        'overflow': wrapperOverflow,
                        'rect': {
                            'top': wrapperRect.top.toFixed(0),
                            'left': wrapperRect.left.toFixed(0),
                            'width': wrapperRect.width.toFixed(0),
                            'height': wrapperRect.height.toFixed(0)
                        }
                    },
                    'elementRect': {
                        'top': elementRectForCheck.top.toFixed(0),
                        'left': elementRectForCheck.left.toFixed(0),
                        'width': elementRectForCheck.width.toFixed(0),
                        'height': elementRectForCheck.height.toFixed(0)
                    },
                    'parentOverflow': parentOverflow,
                    'currentBackground': {
                        'position': currentBgPos,
                        'size': currentBgSize,
                        'image': currentBgImage !== 'none' ? 'set' : 'none'
                    }
                });
            }
            
            wrapper.style.backgroundSize = bgSize;
            wrapper.style.backgroundPosition = bgPos;
            
            if (this.debugMode && isIntroContainer) {
                // Verify it was actually set
                const actualBgPos = wrapper.style.backgroundPosition;
                const actualBgSize = wrapper.style.backgroundSize;
                console.log('[updateWrapperBackgroundPosition] intro-container: After setting', {
                    'actualBackgroundPosition': actualBgPos,
                    'actualBackgroundSize': actualBgSize,
                    'matchesExpected': actualBgPos === bgPos && actualBgSize === bgSize
                });
            }
            
            // Debug logging for intro-container to verify calculation
            if (element.classList.contains('intro-container') && this.debugMode) {
                const scrollY = window.scrollY || window.pageYOffset;
                const scrollX = window.scrollX || window.pageXOffset;
                console.log('[Background Position] intro-container:', {
                    'elementViewportX': x_obj.toFixed(0),
                    'elementViewportY': y_obj.toFixed(0),
                    'scrollX': scrollX.toFixed(0),
                    'scrollY': scrollY.toFixed(0),
                    'offsetX': offsetX.toFixed(0),
                    'offsetY': offsetY.toFixed(0),
                    'x_bg': x_bg.toFixed(0),
                    'y_bg': y_bg.toFixed(0),
                    'finalSourceX': finalSourceX.toFixed(0),
                    'finalSourceY': finalSourceY.toFixed(0),
                    'backgroundPosition': `${-finalSourceX.toFixed(0)}px ${-finalSourceY.toFixed(0)}px`
                });
            }
            
            // Debug logging (only in debug mode or for specific elements)
            if (this.debugMode && (element.classList.contains('timeline-container') || 
                                   element.classList.contains('intro-container') || 
                                   element.classList.contains('theme-block'))) {
                const sampledRegionCenterX = finalSourceX + sampledWidth / 2;
                const sampledRegionCenterY = finalSourceY + sampledHeight / 2;
                // Check if sampled center matches ideal center (should always match with new headroom-based approach)
                const centersMatchX = Math.abs(sampledRegionCenterX - x_bg) < 1;
                const centersMatchY = Math.abs(sampledRegionCenterY - y_bg) < 1;
                const centersMatch = centersMatchX && centersMatchY;
                
                // Concise log
                console.log(`🔍 ${element.className} Background:`, {
                    'Size': `${w_obj.toFixed(0)}×${h_obj.toFixed(0)}px`,
                    'Alpha': `${alphaX.toFixed(2)}/${alphaY.toFixed(2)}`,
                    'Reduced': alphaReducedX || alphaReducedY ? `X:${alphaReducedX} Y:${alphaReducedY}` : 'none',
                    '✅ Aligned': centersMatch ? 'YES' : 'NO'
                });
                
                // Detailed log only for timeline-container in debug mode
                if (element.classList.contains('timeline-container') && this.debugMode) {
                    console.log('Timeline container background positioning (detailed):', {
                        headroom: {
                            left: headroomLeft.toFixed(1),
                            right: headroomRight.toFixed(1),
                            top: headroomTop.toFixed(1),
                            bottom: headroomBottom.toFixed(1)
                        },
                        alpha: {
                            requested: `${requestedAlphaX.toFixed(3)}/${requestedAlphaY.toFixed(3)}`,
                            safe: `${safeAlphaX.toFixed(3)}/${safeAlphaY.toFixed(3)}`,
                            final: `${alphaX.toFixed(3)}/${alphaY.toFixed(3)}`
                        },
                        sampledRegion: {
                            width: sampledWidth.toFixed(1),
                            height: sampledHeight.toFixed(1),
                            center: { x: sampledRegionCenterX.toFixed(1), y: sampledRegionCenterY.toFixed(1) }
                        },
                        centersMatch
                    });
                }
            }
            
            // Store the calculation for debugging
            if (elementData && elementData.filterWrapper === wrapper) {
                elementData._lastBgPos = { 
                    sourceX, 
                    sourceY,
                    finalSourceX,
                    finalSourceY,
                    center: { x: x_obj, y: y_obj },
                    dimensions: { w: w_obj, h: h_obj },
                    alphaX,
                    alphaY,
                    requestedAlphaX,
                    requestedAlphaY,
                    safeAlphaX,
                    safeAlphaY,
                    sampledRegion: { 
                        x: finalSourceX, 
                        y: finalSourceY, 
                        width: sampledWidth, 
                        height: sampledHeight,
                        centerX: x_bg,
                        centerY: y_bg
                    },
                    elementRect: { left: elementRect.left, top: elementRect.top, width: w_obj, height: h_obj },
                    scaledSize: { width: scaledWidth, height: scaledHeight },
                    offset: { x: offsetX, y: offsetY },
                    headroom: {
                        left: headroomLeft,
                        right: headroomRight,
                        top: headroomTop,
                        bottom: headroomBottom
                    },
                    alphaReduced: {
                        x: alphaReducedX,
                        y: alphaReducedY
                    },
                    // Check if element/sampling extends beyond bounds (should always be false with headroom-based approach)
                    extendsBeyondBackground: {
                        right: (finalSourceX + sampledWidth) > scaledWidth,
                        bottom: (finalSourceY + sampledHeight) > scaledHeight,
                        left: finalSourceX < 0,
                        top: finalSourceY < 0
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