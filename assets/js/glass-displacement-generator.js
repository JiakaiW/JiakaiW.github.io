/**
 * Glass Displacement Map Generator
 * Pre-calculates displacement vector fields based on Convex Squircle surface function
 * Uses simplified Snell's Law for performance
 */

(function() {
    'use strict';

    class GlassDisplacementGenerator {
        constructor() {
            // Cache displacement maps by size and bezel width
            this.cache = new Map();
            this.defaultBezelWidth = 0.15; // 15% of element size
        }

        /**
         * Convex Squircle surface function
         * Formula: y = (1 - (1-x)^4)^(1/4)
         * @param {number} x - Distance from edge (0 to 1)
         * @returns {number} Height of glass surface at that point
         */
        convexSquircle(x) {
            if (x <= 0) return 0;
            if (x >= 1) return 1;
            const term = 1 - Math.pow(1 - x, 4);
            return Math.pow(Math.max(0, term), 0.25);
        }

        /**
         * Calculate surface normal (derivative of height function)
         * Used to determine refraction angle
         * @param {number} x - Distance from edge
         * @param {number} delta - Small value for numerical derivative
         * @returns {number} Derivative (slope) at point x
         */
        surfaceNormal(x, delta = 0.001) {
            const x1 = Math.max(0, x - delta);
            const x2 = Math.min(1, x + delta);
            const y1 = this.convexSquircle(x1);
            const y2 = this.convexSquircle(x2);
            return (y2 - y1) / (x2 - x1);
        }

        /**
         * Simplified Snell's Law approximation
         * Approximates displacement magnitude based on surface normal
         * @param {number} normal - Surface normal (slope)
         * @param {number} refractiveIndex - Glass refractive index (default 1.5)
         * @returns {number} Displacement magnitude (normalized 0-1)
         */
        calculateDisplacementMagnitude(normal, refractiveIndex = 1.5) {
            // Simplified: displacement proportional to surface curvature
            // More curvature (higher normal) = more displacement
            const curvature = Math.abs(normal);
            // Scale by refractive index effect
            // Significantly increased multiplier for highly visible effect
            // For convex glass, we want strong displacement at edges
            const displacement = curvature * (refractiveIndex - 1) * 4.5; // Increased from 2.8 to 4.5 for much stronger effect
            return Math.min(displacement, 1.0); // Cap at 100% displacement for maximum effect
        }

        /**
         * Generate displacement map for a given element size
         * @param {number} width - Element width in pixels
         * @param {number} height - Element height in pixels
         * @param {number} bezelWidth - Bezel width as fraction (0.1 to 0.2)
         * @param {number} mapResolution - Resolution of displacement map (default 128)
         * @returns {Object} Displacement map data and metadata
         */
        generateDisplacementMap(width, height, bezelWidth = null, mapResolution = 128) {
            bezelWidth = bezelWidth || this.defaultBezelWidth;
            
            // Check cache
            const cacheKey = `${width}x${height}_${bezelWidth}_${mapResolution}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const aspectRatio = width / height;
            const bezelPixels = Math.min(width, height) * bezelWidth;
            
            // Create displacement map image data
            const mapWidth = mapResolution;
            const mapHeight = Math.round(mapResolution / aspectRatio);
            const imageData = new ImageData(mapWidth, mapHeight);
            const data = imageData.data;

            // Pre-calculate displacement magnitudes for distances from edge
            const maxDistance = Math.max(width, height) * bezelWidth;
            const displacementCache = [];
            const samples = 100;
            
            // Debug: Track max magnitude to verify we're getting strong displacement at edges
            let maxMagnitude = 0;
            for (let i = 0; i <= samples; i++) {
                const distance = (i / samples); // Normalized 0 to 1 (0 = edge, 1 = center)
                const normal = this.surfaceNormal(distance);
                const magnitude = this.calculateDisplacementMagnitude(normal);
                displacementCache.push(magnitude);
                maxMagnitude = Math.max(maxMagnitude, magnitude);
            }
            
            // Verify we're getting strong displacement at edges (distance close to 0)
            // With multiplier of 4.5, we should get magnitude close to 1.0 at edges
            if (maxMagnitude < 0.9) {
                console.warn('Displacement magnitude may be too weak. Max magnitude:', maxMagnitude.toFixed(3), 
                           'Expected: >0.9 at edges. Current multiplier: 4.5');
            } else {
                console.log('Displacement magnitude OK. Max magnitude:', maxMagnitude.toFixed(3), 'at edges');
            }

            // Generate displacement map
            // For rounded rectangles, calculate distance from nearest edge considering border radius
            const normalizedBezelWidth = bezelWidth; // Already normalized 0-1
            
            for (let y = 0; y < mapHeight; y++) {
                for (let x = 0; x < mapWidth; x++) {
                    // Normalize coordinates to 0-1 range
                    const nx = x / mapWidth;
                    const ny = y / mapHeight;
                    
                    // Calculate distance from each edge
                    const distLeft = nx;
                    const distRight = 1 - nx;
                    const distTop = ny;
                    const distBottom = 1 - ny;
                    
                    // Find minimum distance to edge (for rounded rect, this is approximate)
                    const minDistToEdge = Math.min(distLeft, distRight, distTop, distBottom);
                    
                    // Normalize distance from edge (0 = at edge, 1 = at center)
                    // Only apply distortion within bezel region
                    const distanceFromEdge = Math.min(1, minDistToEdge / normalizedBezelWidth);
                    
                    // Only apply displacement if within bezel region
                    if (distanceFromEdge >= 1) {
                        // Center region: no displacement (neutral = 128)
                        const pixelIndex = (y * mapWidth + x) * 4;
                        data[pixelIndex] = 128;     // R = neutral
                        data[pixelIndex + 1] = 128; // G = neutral
                        data[pixelIndex + 2] = 128; // B = neutral
                        data[pixelIndex + 3] = 255; // Alpha = full
                        continue;
                    }
                    
                    // Get displacement magnitude from cache (invert: 0 = edge, 1 = center)
                    const cacheIndex = Math.floor((1 - distanceFromEdge) * samples);
                    const magnitude = displacementCache[Math.min(cacheIndex, samples)] || 0;
                    
                    // Calculate displacement direction (radial from center, orthogonal to border)
                    const centerX = mapWidth / 2;
                    const centerY = mapHeight / 2;
                    const dx = (x - centerX) / Math.max(centerX, 1);
                    const dy = (y - centerY) / Math.max(centerY, 1);
                    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
                    
                    // Direction vector (radial, pointing INWARD toward center for convex surface)
                    // Convex glass bends light inward, so background appears displaced inward
                    let dirX = 0, dirY = 0;
                    if (distanceFromCenter > 0.001) {
                        // Inward direction (negative of radial outward)
                        dirX = -dx / distanceFromCenter;
                        dirY = -dy / distanceFromCenter;
                    } else {
                        // At center, no displacement
                        dirX = 0;
                        dirY = 0;
                    }
                    
                    // Convert to pixel displacement (scale by magnitude)
                    // feDisplacementMap uses 128 as neutral, values < 128 displace left/up, > 128 right/down
                    const pixelIndex = (y * mapWidth + x) * 4;
                    const displacementX = dirX * magnitude * 127.5 + 128; // 128 ± magnitude*127.5
                    const displacementY = dirY * magnitude * 127.5 + 128;
                    
                    data[pixelIndex] = Math.round(Math.max(0, Math.min(255, displacementX)));     // R channel = X displacement
                    data[pixelIndex + 1] = Math.round(Math.max(0, Math.min(255, displacementY))); // G channel = Y displacement
                    data[pixelIndex + 2] = 128; // B channel = neutral
                    data[pixelIndex + 3] = 255; // Alpha = full opacity
                }
            }

            // Debug: Calculate displacement map statistics
            let minDisplacement = 255;
            let maxDisplacement = 0;
            let sumDisplacement = 0;
            let edgePixelCount = 0;
            for (let i = 0; i < data.length; i += 4) {
                const dispX = data[i];
                const dispY = data[i + 1];
                // Calculate distance from neutral (128)
                const distX = Math.abs(dispX - 128);
                const distY = Math.abs(dispY - 128);
                const maxDist = Math.max(distX, distY);
                if (maxDist > 0) {
                    edgePixelCount++;
                    minDisplacement = Math.min(minDisplacement, maxDist);
                    maxDisplacement = Math.max(maxDisplacement, maxDist);
                    sumDisplacement += maxDist;
                }
            }
            const avgDisplacement = edgePixelCount > 0 ? sumDisplacement / edgePixelCount : 0;
            
            // Log displacement map statistics (only for first map to avoid spam)
            if (!this._hasLoggedStats) {
                console.log('Displacement Map Statistics:', {
                    size: `${width}x${height}`,
                    mapSize: `${mapWidth}x${mapHeight}`,
                    minDisplacement: minDisplacement.toFixed(2),
                    maxDisplacement: maxDisplacement.toFixed(2),
                    avgDisplacement: avgDisplacement.toFixed(2),
                    edgePixelCount: edgePixelCount,
                    totalPixels: mapWidth * mapHeight,
                    edgePercentage: ((edgePixelCount / (mapWidth * mapHeight)) * 100).toFixed(1) + '%',
                    displacementRange: `0-${maxDisplacement.toFixed(0)} (neutral=128)`
                });
                this._hasLoggedStats = true;
            }

            const result = {
                imageData,
                width: mapWidth,
                height: mapHeight,
                bezelWidth,
                elementWidth: width,
                elementHeight: height,
                stats: {
                    minDisplacement,
                    maxDisplacement,
                    avgDisplacement,
                    edgePixelCount
                }
            };

            // Cache result
            this.cache.set(cacheKey, result);
            
            return result;
        }

        /**
         * Convert ImageData to data URL for use in SVG feImage
         * @param {ImageData} imageData - Displacement map image data
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
         * Generate SVG image element for displacement map
         * @param {Object} mapData - Displacement map data from generateDisplacementMap
         * @returns {string} SVG image element as string
         */
        createSVGImage(mapData) {
            const dataURL = this.imageDataToDataURL(mapData.imageData);
            return `<image href="${dataURL}" width="${mapData.width}" height="${mapData.height}"/>`;
        }

        /**
         * Clear cache (useful for memory management)
         */
        clearCache() {
            this.cache.clear();
        }

        /**
         * Get cache size (for debugging)
         */
        getCacheSize() {
            return this.cache.size;
        }
    }

    // Export singleton instance
    window.GlassDisplacementGenerator = new GlassDisplacementGenerator();

})();

