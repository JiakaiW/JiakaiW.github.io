/**
 * Fragment Shader for Liquid Glass Effect
 * Enhanced with lens distortion, multi-layer edge masks, and gradient lighting
 * Based on realistic refraction techniques
 */

precision mediump float;

uniform sampler2D u_background;
uniform vec2 u_resolution;
uniform vec2 u_mouse; // Mouse position (0-1)
uniform float u_blurAmount;
uniform float u_refractionStrength;
uniform float u_saturation;
uniform float u_time;
uniform float u_rimLightIntensity;
uniform float u_edgeThickness;
uniform vec2 u_elementSize; // Size of the glass element
uniform vec2 u_elementPosition; // Position of element relative to viewport

varying vec2 v_uv;

// Constants
const float NUM_ZERO = 0.0;
const float NUM_ONE = 1.0;
const float NUM_HALF = 0.5;
const float NUM_TWO = 2.0;
const float POWER_EXPONENT = 4.0; // Reduced from 6.0 for smoother falloff
const float MASK_MULTIPLIER_1 = 5.0; // Reduced significantly to make effect visible
const float MASK_MULTIPLIER_2 = 4.5;
const float MASK_MULTIPLIER_3 = 5.5;
const float LENS_MULTIPLIER = 2.0; // Reduced for more subtle distortion
const float MASK_STRENGTH_1 = 8.0;
const float MASK_STRENGTH_2 = 16.0;
const float MASK_STRENGTH_3 = 2.0;
const float MASK_THRESHOLD_1 = 0.95;
const float MASK_THRESHOLD_2 = 0.9;
const float MASK_THRESHOLD_3 = 1.5;
const float SAMPLE_RANGE = 1.0; // Reduced to 1.0 for much better performance (3x3 samples = 9 samples per pixel)
const float SAMPLE_OFFSET = 0.5;
const float GRADIENT_RANGE = 0.2;
const float GRADIENT_OFFSET = 0.1;
const float GRADIENT_EXTREME = -1000.0;
const float LIGHTING_INTENSITY = 0.3;

// Calculate rounded box mask
float calculateRoundedBox(vec2 uv, vec2 center) {
    vec2 m2 = (uv - center);
    float aspectRatio = u_resolution.x / u_resolution.y;
    float xComponent = pow(abs(m2.x * aspectRatio), POWER_EXPONENT);
    float yComponent = pow(abs(m2.y), POWER_EXPONENT);
    return xComponent + yComponent;
}

// Calculate multi-layer edge masks
vec3 calculateEdgeMasks(float roundedBox) {
    float rb1 = clamp((NUM_ONE - roundedBox * MASK_MULTIPLIER_1) * MASK_STRENGTH_1, NUM_ZERO, NUM_ONE);
    float rb2Part1 = clamp((MASK_THRESHOLD_1 - roundedBox * MASK_MULTIPLIER_2) * MASK_STRENGTH_2, NUM_ZERO, NUM_ONE);
    float rb2Part2 = clamp(pow(MASK_THRESHOLD_2 - roundedBox * MASK_MULTIPLIER_2, NUM_ONE) * MASK_STRENGTH_2, NUM_ZERO, NUM_ONE);
    float rb2 = rb2Part1 - rb2Part2;
    float rb3Part1 = clamp((MASK_THRESHOLD_3 - roundedBox * MASK_MULTIPLIER_3) * MASK_STRENGTH_3, NUM_ZERO, NUM_ONE);
    float rb3Part2 = clamp(pow(NUM_ONE - roundedBox * MASK_MULTIPLIER_3, NUM_ONE) * MASK_STRENGTH_3, NUM_ZERO, NUM_ONE);
    float rb3 = rb3Part1 - rb3Part2;
    return vec3(rb1, rb2, rb3);
}

// Lens distortion - bends UV coordinates for refraction
vec2 applyLensDistortion(vec2 uv, float roundedBox) {
    return ((uv - NUM_HALF) * NUM_ONE * (NUM_ONE - roundedBox * LENS_MULTIPLIER) + NUM_HALF);
}

// Multi-point sampling for blur and refraction
vec4 sampleWithRefraction(vec2 lensUV, float roundedBox) {
    vec4 totalColor = vec4(NUM_ZERO);
    float total = NUM_ZERO;
    
    // Sample multiple points around the lens area
    for (float x = -SAMPLE_RANGE; x <= SAMPLE_RANGE; x += 1.0) {
        for (float y = -SAMPLE_RANGE; y <= SAMPLE_RANGE; y += 1.0) {
            vec2 offset = (vec2(x, y) * SAMPLE_OFFSET) / u_resolution;
            // Apply refraction strength to offset
            offset *= (NUM_ONE + roundedBox * u_refractionStrength * 1.5); // Further reduced for very subtle effect
            vec2 sampleUV = clamp(lensUV + offset, NUM_ZERO, NUM_ONE);
            totalColor += texture2D(u_background, sampleUV);
            total += NUM_ONE;
        }
    }
    
    return totalColor / total;
}

// Calculate gradient lighting for rim effects
float calculateGradientLighting(vec2 m2, float rb3) {
    float gradient = clamp((clamp(m2.y, NUM_ZERO, GRADIENT_RANGE) + GRADIENT_OFFSET) / NUM_TWO, NUM_ZERO, NUM_ONE) +
                     clamp((clamp(-m2.y, GRADIENT_EXTREME, GRADIENT_RANGE) * rb3 + GRADIENT_OFFSET) / NUM_TWO, NUM_ZERO, NUM_ONE);
    return gradient;
}

// Enhance color saturation
vec3 enhanceSaturation(vec3 color, float saturation) {
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    return mix(vec3(gray), color, saturation);
}

void main() {
    vec2 uv = v_uv;
    
    // Always center the effect on the element (0.5, 0.5)
    // The lens effect should cover the entire glass element
    vec2 center = vec2(NUM_HALF);
    
    // Calculate distance from center for rounded box mask
    vec2 m2 = (uv - center);
    float roundedBox = calculateRoundedBox(uv, center);
    
    // Calculate multi-layer edge masks
    vec3 masks = calculateEdgeMasks(roundedBox);
    float rb1 = masks.x;
    float rb2 = masks.y;
    float rb3 = masks.z;
    
    // Calculate transition - should be > 0 for most of the element
    float transition = smoothstep(NUM_ZERO, NUM_ONE, rb1 + rb2);
    
    // Apply lens distortion for refraction (always apply, not conditional)
    vec2 lensUV = applyLensDistortion(uv, roundedBox);
    lensUV = clamp(lensUV, NUM_ZERO, NUM_ONE);
    
    // Sample with multi-point refraction
    vec4 refractedColor = sampleWithRefraction(lensUV, roundedBox);
    
    // Calculate gradient lighting
    float gradient = calculateGradientLighting(m2, rb3);
    
    // Apply lighting effects
    vec4 lighting = clamp(
        refractedColor + 
        vec4(rb1) * gradient + 
        vec4(rb2) * LIGHTING_INTENSITY * u_rimLightIntensity,
        NUM_ZERO, 
        NUM_ONE
    );
    
    // Enhance saturation
    lighting.rgb = enhanceSaturation(lighting.rgb, u_saturation);
    
    // Mix with original texture
    // Use minimum transition of 0.15 for very subtle effect
    vec4 originalColor = texture2D(u_background, uv);
    vec4 fragColor = mix(originalColor, lighting, max(transition, 0.15));
    
    // Apply edge alpha for smooth borders
    float edgeAlpha = 1.0;
    float edgeDistance = min(min(uv.x, NUM_ONE - uv.x), min(uv.y, NUM_ONE - uv.y));
    edgeAlpha = smoothstep(NUM_ZERO, 0.05, edgeDistance);
    
    fragColor.a *= edgeAlpha;
    
    gl_FragColor = fragColor;
}
