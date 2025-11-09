/**
 * Glass Effects Loader
 * Entry point for all glass effect modules
 * Loads modules in the correct dependency order
 * 
 * @module glass-effects-loader
 */

// Load core renderer first (no dependencies)
import GlassRenderer from './glass-renderer.js';

// Load displacement generator (no dependencies)
import GlassDisplacementGenerator from './glass-displacement-generator.js';

// Load SVG filter manager (no dependencies)
import GlassSVGFilter from './glass-svg-filter.js';

// Load edge distortion (depends on displacement generator and SVG filter)
import GlassEdgeDistortion from './glass-edge-distortion.js';

// Load glass effects (depends on renderer)
import './glass-effects.js';

// Export all for potential external use
export {
    GlassRenderer,
    GlassDisplacementGenerator,
    GlassSVGFilter,
    GlassEdgeDistortion
};
