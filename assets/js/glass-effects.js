/**
 * Glass Effects Enhancement
 * Implements dynamic lighting and performance optimizations
 */

(function() {
    'use strict';

    // Check for backdrop-filter support
    const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(1px)') ||
                                   CSS.supports('-webkit-backdrop-filter', 'blur(1px)');

    if (!supportsBackdropFilter) {
        // Add fallback class
        document.documentElement.classList.add('no-backdrop-filter');
        return;
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

})();
