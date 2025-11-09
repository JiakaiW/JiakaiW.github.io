/**
 * Glass Effects Enhancement
 * Implements dynamic lighting and performance optimizations
 * Now supports WebGL-based liquid glass rendering
 */

(function() {
    'use strict';

    // Check for backdrop-filter support
    const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(1px)') ||
                                   CSS.supports('-webkit-backdrop-filter', 'blur(1px)');

    if (!supportsBackdropFilter) {
        // Add fallback class
        document.documentElement.classList.add('no-backdrop-filter');
    }

    // Check if WebGL approach is active
    const isWebGLApproach = typeof GlassRenderer !== 'undefined' && 
                           GlassRenderer.getApproach() === GlassRenderer.APPROACHES.WEBGL;

    // If WebGL is active, the WebGL renderer will handle effects
    // Otherwise, use CSS-based effects
    if (isWebGLApproach) {
        // WebGL renderer handles everything, but we still track mouse for CSS fallback
        // and for any elements not using WebGL
    }

    // Dynamic lighting based on mouse position
    let mouseX = 50;
    let mouseY = 0;
    let rafId = null;

    function updateGlassLighting() {
        document.documentElement.style.setProperty('--glass-light-x', `${mouseX}%`);
        document.documentElement.style.setProperty('--glass-light-y', `${mouseY}%`);
        rafId = null;
    }

    function scheduleUpdate() {
        if (!rafId) {
            rafId = requestAnimationFrame(updateGlassLighting);
        }
    }

    // Track mouse position for dynamic lighting
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 100;
        mouseY = (e.clientY / window.innerHeight) * 100;
        scheduleUpdate();
    }, { passive: true });

    // Adaptive blur based on scroll (optional, can be disabled for performance)
    let lastScrollY = 0;
    let scrollRafId = null;

    function updateScrollBlur() {
        const scrollY = window.scrollY;
        // Only update if scroll changed significantly
        if (Math.abs(scrollY - lastScrollY) > 10) {
            const blur = Math.min(20 + scrollY * 0.05, 30);
            document.documentElement.style.setProperty('--glass-blur-base', `${blur}px`);
            lastScrollY = scrollY;
        }
        scrollRafId = null;
    }

    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        window.addEventListener('scroll', () => {
            if (!scrollRafId) {
                scrollRafId = requestAnimationFrame(updateScrollBlur);
            }
        }, { passive: true });
    }

    // Performance monitoring (optional, for development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        let frameCount = 0;
        let lastTime = performance.now();

        function measureFPS() {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                if (fps < 30) {
                    console.warn(`Low FPS detected: ${fps}fps. Consider reducing glass effects.`);
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        }

        // Start FPS monitoring
        requestAnimationFrame(measureFPS);
    }

    // Initialize glass effects on interactive elements
    function enhanceInteractiveElements() {
        // Add glass effect to buttons that don't have it
        const buttons = document.querySelectorAll('button:not(.hamburger):not(.close-button)');
        buttons.forEach(button => {
            if (!button.classList.contains('btn-glass') && 
                !button.closest('.glass-base')) {
                button.classList.add('btn-glass');
            }
        });
    }

    // Run enhancement after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceInteractiveElements);
    } else {
        enhanceInteractiveElements();
    }

    // Initialize WebGL liquid glass if approach is WebGL
    if (isWebGLApproach && typeof WebGLLiquidGlassManager !== 'undefined') {
        // WebGL manager auto-initializes, but we can trigger it explicitly
        // if needed for dynamic content
        const initWebGLGlass = async () => {
            if (WebGLLiquidGlassManager && !WebGLLiquidGlassManager.isInitialized) {
                console.log('Initializing WebGL Liquid Glass Manager...');
                await WebGLLiquidGlassManager.init();
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initWebGLGlass, 200); // Give time for other scripts to load
            });
        } else {
            setTimeout(initWebGLGlass, 200);
        }

        // Watch for dynamically added glass elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Check if node or its children are glass elements
                        const glassElements = node.matches && node.matches('.glass-base, .intro-container, .theme-block, .photo-card, .news-item, .btn-glass, .expanded-card, .card-text, .dropdown-content, .search-container') 
                            ? [node]
                            : node.querySelectorAll ? node.querySelectorAll('.glass-base, .intro-container, .theme-block, .photo-card, .news-item, .btn-glass, .expanded-card, .card-text, .dropdown-content, .search-container')
                            : [];

                        glassElements.forEach(element => {
                            if (WebGLLiquidGlassManager) {
                                WebGLLiquidGlassManager.addElement(element);
                            }
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

})();
