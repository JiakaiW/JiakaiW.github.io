/**
 * WebGL Liquid Glass Renderer
 * Applies WebGL-based liquid glass effects to DOM elements
 */

(function() {
    'use strict';

    // Check dependencies
    if (typeof WebGLUtils === 'undefined') {
        console.error('WebGLUtils not found. Make sure webgl-utils.js is loaded first.');
        return;
    }

    // Shared background image cache to avoid loading the same image multiple times
    const backgroundImageCache = {
        image: null,
        loading: false,
        loadPromise: null,
        loadBackgroundImage() {
            if (this.image) {
                return Promise.resolve(this.image);
            }
            if (this.loadPromise) {
                return this.loadPromise;
            }
            
            this.loading = true;
            this.loadPromise = new Promise((resolve, reject) => {
                // Check body first, then html as fallback
                const bodyStyle = window.getComputedStyle(document.body);
                let bgImage = bodyStyle.backgroundImage;
                
                if (!bgImage || bgImage === 'none') {
                    const htmlStyle = window.getComputedStyle(document.documentElement);
                    bgImage = htmlStyle.backgroundImage;
                }
                
                if (!bgImage || bgImage === 'none') {
                    this.loading = false;
                    reject(new Error('No background image found'));
                    return;
                }
                
                const match = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
                if (!match) {
                    this.loading = false;
                    reject(new Error('Could not parse background image URL'));
                    return;
                }
                
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    this.image = img;
                    this.loading = false;
                    resolve(img);
                };
                img.onerror = () => {
                    this.loading = false;
                    this.loadPromise = null;
                    reject(new Error('Failed to load background image'));
                };
                img.src = match[1];
            });
            
            return this.loadPromise;
        }
    };

    class WebGLLiquidGlassRenderer {
        constructor(element, options = {}) {
            this.element = element;
            this.options = Object.assign({
                blurAmount: 8.0,
                refractionStrength: 0.1,
                saturation: 1.05,
                rimLightIntensity: 0.1,
                edgeThickness: 0.02,
                updateInterval: 1000, // ms between background captures (reduced frequency)
                enableMouseTracking: true,
                maxPixelRatio: 1.0, // Limit device pixel ratio for performance
                frameSkip: 2, // Render every Nth frame (2 = 30fps, 3 = 20fps)
                pauseWhenHidden: true // Pause rendering when element is off-screen
            }, options);

            this.canvas = null;
            this.gl = null;
            this.program = null;
            this.quad = null;
            this.backgroundTexture = null;
            this.framebuffer = null;
            this.animationFrameId = null;
            this.lastCaptureTime = 0;
            this.mouseX = 0.5;
            this.mouseY = 0.5;
            this.time = 0;
            this.isDestroyed = false;
            this.isInitialized = false;
            this.frameCount = 0;
            this.isVisible = true;
            this.intersectionObserver = null;

            // Init is async, but we start it immediately
            this.init().catch(error => {
                console.error('Failed to initialize WebGL renderer:', error);
            });
        }

        async init() {
            // Create canvas overlay
            this.createCanvas();

            // Initialize WebGL context
            if (!this.initWebGL()) {
                console.error('Failed to initialize WebGL for liquid glass');
                return;
            }

            // Load shaders and create program
            const shadersLoaded = await this.loadShaders();
            if (!shadersLoaded) {
                console.error('Failed to load shaders');
                return;
            }

            // Create quad geometry
            this.quad = WebGLUtils.createQuad(this.gl);

            // Set up event listeners
            this.setupEventListeners();

            // Initial background capture (wait a bit for DOM to be ready)
            // Use shared cache so all elements load faster
            setTimeout(() => {
                this.captureBackground().catch(err => {
                    console.warn('Initial background capture failed:', err);
                });
            }, 100);

            // Start rendering loop
            this.startRenderLoop();
            
            this.isInitialized = true;
            console.log('WebGL renderer initialized for element:', this.element.className);
        }

        createCanvas() {
            // Create canvas element
            this.canvas = document.createElement('canvas');
            this.canvas.className = 'webgl-glass-canvas';
            this.canvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 0;
                opacity: 1;
            `;

            // Insert canvas into element
            const position = window.getComputedStyle(this.element).position;
            if (position === 'static') {
                this.element.style.position = 'relative';
            }
            
            // Insert canvas as first child so it's behind content
            if (this.element.firstChild) {
                this.element.insertBefore(this.canvas, this.element.firstChild);
            } else {
                this.element.appendChild(this.canvas);
            }

            // Set canvas size
            this.resizeCanvas();
            
            console.log('Canvas created for element:', this.element.className, 'Size:', this.canvas.width, 'x', this.canvas.height);
        }

        resizeCanvas() {
            const rect = this.element.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, this.options.maxPixelRatio);
            
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';

            if (this.gl) {
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            }
        }

        initWebGL() {
            this.gl = WebGLUtils.createContext(this.canvas, {
                alpha: true,
                antialias: false, // Disabled for performance
                premultipliedAlpha: false
            });

            if (!this.gl) {
                return false;
            }

            // Enable blending for transparency
            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

            return true;
        }

        async loadShaders() {
            try {
                // Try to load shaders from files first
                let vertexSource, fragmentSource;
                
                try {
                    vertexSource = await this.loadShaderSource('liquid-glass.vert');
                    fragmentSource = await this.loadShaderSource('liquid-glass.frag');
                } catch (fetchError) {
                    // Fallback to embedded shaders if fetch fails
                    console.warn('Failed to fetch shaders, using embedded versions:', fetchError);
                    vertexSource = this.getEmbeddedVertexShader();
                    fragmentSource = this.getEmbeddedFragmentShader();
                }

                // Create program
                this.program = WebGLUtils.createProgram(this.gl, vertexSource, fragmentSource);
                
                if (!this.program) {
                    console.error('Failed to create WebGL program');
                    return false;
                }

                console.log('WebGL shaders loaded successfully');
                return true;
            } catch (error) {
                console.error('Error loading shaders:', error);
                return false;
            }
        }

        async loadShaderSource(filename) {
            const response = await fetch(`/assets/js/shaders/${filename}`);
            if (!response.ok) {
                throw new Error(`Failed to load shader: ${filename} - ${response.status}`);
            }
            return await response.text();
        }

        getEmbeddedVertexShader() {
            return `
                attribute vec2 a_position;
                attribute vec2 a_uv;
                varying vec2 v_uv;
                void main() {
                    v_uv = a_uv;
                    gl_Position = vec4(a_position, 0.0, 1.0);
                }
            `;
        }

        getEmbeddedFragmentShader() {
            return `
                precision mediump float;
                uniform sampler2D u_background;
                uniform vec2 u_resolution;
                uniform vec2 u_mouse;
                uniform float u_blurAmount;
                uniform float u_refractionStrength;
                uniform float u_saturation;
                uniform float u_time;
                uniform float u_rimLightIntensity;
                uniform float u_edgeThickness;
                uniform vec2 u_elementSize;
                uniform vec2 u_elementPosition;
                varying vec2 v_uv;
                
                const float NUM_ZERO = 0.0;
                const float NUM_ONE = 1.0;
                const float NUM_HALF = 0.5;
                const float NUM_TWO = 2.0;
                const float POWER_EXPONENT = 4.0;
                const float MASK_MULTIPLIER_1 = 5.0;
                const float MASK_MULTIPLIER_2 = 4.5;
                const float MASK_MULTIPLIER_3 = 5.5;
                const float LENS_MULTIPLIER = 2.0;
                const float MASK_STRENGTH_1 = 8.0;
                const float MASK_STRENGTH_2 = 16.0;
                const float MASK_STRENGTH_3 = 2.0;
                const float MASK_THRESHOLD_1 = 0.95;
                const float MASK_THRESHOLD_2 = 0.9;
                const float MASK_THRESHOLD_3 = 1.5;
                const float SAMPLE_RANGE = 1.0; // Reduced for better performance (3x3 samples)
                const float SAMPLE_OFFSET = 0.5;
                const float GRADIENT_RANGE = 0.2;
                const float GRADIENT_OFFSET = 0.1;
                const float GRADIENT_EXTREME = -1000.0;
                const float LIGHTING_INTENSITY = 0.3;
                
                float calculateRoundedBox(vec2 uv, vec2 center) {
                    vec2 m2 = (uv - center);
                    float aspectRatio = u_resolution.x / u_resolution.y;
                    float xComponent = pow(abs(m2.x * aspectRatio), POWER_EXPONENT);
                    float yComponent = pow(abs(m2.y), POWER_EXPONENT);
                    return xComponent + yComponent;
                }
                
                vec3 calculateEdgeMasks(float roundedBox) {
                    float rb1 = clamp((NUM_ONE - roundedBox * MASK_MULTIPLIER_1) * MASK_STRENGTH_1, NUM_ZERO, NUM_ONE);
                    float rb2 = clamp((MASK_THRESHOLD_1 - roundedBox * MASK_MULTIPLIER_2) * MASK_STRENGTH_2, NUM_ZERO, NUM_ONE) -
                                clamp(pow(MASK_THRESHOLD_2 - roundedBox * MASK_MULTIPLIER_2, NUM_ONE) * MASK_STRENGTH_2, NUM_ZERO, NUM_ONE);
                    float rb3 = clamp((MASK_THRESHOLD_3 - roundedBox * MASK_MULTIPLIER_3) * MASK_STRENGTH_3, NUM_ZERO, NUM_ONE) -
                                clamp(pow(NUM_ONE - roundedBox * MASK_MULTIPLIER_3, NUM_ONE) * MASK_STRENGTH_3, NUM_ZERO, NUM_ONE);
                    return vec3(rb1, rb2, rb3);
                }
                
                vec2 applyLensDistortion(vec2 uv, float roundedBox) {
                    return ((uv - NUM_HALF) * NUM_ONE * (NUM_ONE - roundedBox * LENS_MULTIPLIER) + NUM_HALF);
                }
                
                vec4 sampleWithRefraction(vec2 lensUV, float roundedBox) {
                    vec4 totalColor = vec4(NUM_ZERO);
                    float total = NUM_ZERO;
                    
                    for (float x = -SAMPLE_RANGE; x <= SAMPLE_RANGE; x += 1.0) {
                        for (float y = -SAMPLE_RANGE; y <= SAMPLE_RANGE; y += 1.0) {
                            vec2 offset = (vec2(x, y) * SAMPLE_OFFSET) / u_resolution;
                            offset *= (NUM_ONE + roundedBox * u_refractionStrength * 1.5); // Further reduced for very subtle effect
                            vec2 sampleUV = clamp(lensUV + offset, NUM_ZERO, NUM_ONE);
                            totalColor += texture2D(u_background, sampleUV);
                            total += NUM_ONE;
                        }
                    }
                    
                    return totalColor / total;
                }
                
                float calculateGradientLighting(vec2 m2, float rb3) {
                    float gradient = clamp((clamp(m2.y, NUM_ZERO, GRADIENT_RANGE) + GRADIENT_OFFSET) / NUM_TWO, NUM_ZERO, NUM_ONE) +
                                     clamp((clamp(-m2.y, GRADIENT_EXTREME, GRADIENT_RANGE) * rb3 + GRADIENT_OFFSET) / NUM_TWO, NUM_ZERO, NUM_ONE);
                    return gradient;
                }
                
                vec3 enhanceSaturation(vec3 color, float saturation) {
                    float gray = dot(color, vec3(0.299, 0.587, 0.114));
                    return mix(vec3(gray), color, saturation);
                }
                
                void main() {
                    vec2 uv = v_uv;
                    // Always center the effect on the element (0.5, 0.5)
                    // Use mouse position for dynamic lighting, but center for lens effect
                    vec2 center = vec2(NUM_HALF);
                    vec2 mousePos = u_mouse;
                    
                    // If mouse is valid (not default 0.5, 0.5), use it for lighting
                    // Otherwise use center
                    if (length(mousePos - vec2(NUM_HALF)) < 0.01) {
                        mousePos = vec2(NUM_HALF);
                    }
                    
                    vec2 m2 = (uv - center);
                    float roundedBox = calculateRoundedBox(uv, center);
                    vec3 masks = calculateEdgeMasks(roundedBox);
                    float rb1 = masks.x;
                    float rb2 = masks.y;
                    float rb3 = masks.z;
                    
                    // Always show the effect (transition should be > 0 for most of the element)
                    float transition = smoothstep(NUM_ZERO, NUM_ONE, rb1 + rb2);
                    
                    vec4 fragColor;
                    
                    // Apply glass effect to the entire element
                    vec2 lensUV = applyLensDistortion(uv, roundedBox);
                    lensUV = clamp(lensUV, NUM_ZERO, NUM_ONE);
                    fragColor = sampleWithRefraction(lensUV, roundedBox);
                    
                    // Calculate gradient lighting
                    float gradient = calculateGradientLighting(m2, rb3);
                    
                    // Apply lighting effects
                    vec4 lighting = clamp(
                        fragColor + 
                        vec4(rb1) * gradient + 
                        vec4(rb2) * LIGHTING_INTENSITY * u_rimLightIntensity,
                        NUM_ZERO, 
                        NUM_ONE
                    );
                    
                    // Enhance saturation
                    lighting.rgb = enhanceSaturation(lighting.rgb, u_saturation);
                    
                    // Mix with original based on transition
                    vec4 originalColor = texture2D(u_background, uv);
                    fragColor = mix(originalColor, lighting, max(transition, 0.15)); // Minimum 15% effect for very subtle look
                    
                    float edgeAlpha = 1.0;
                    float edgeDistance = min(min(uv.x, NUM_ONE - uv.x), min(uv.y, NUM_ONE - uv.y));
                    edgeAlpha = smoothstep(NUM_ZERO, 0.05, edgeDistance);
                    fragColor.a *= edgeAlpha;
                    
                    gl_FragColor = fragColor;
                }
            `;
        }

        async captureBackground() {
            const now = performance.now();
            if (now - this.lastCaptureTime < this.options.updateInterval) {
                return;
            }
            this.lastCaptureTime = now;

            // Get element's position relative to viewport
            const rect = this.element.getBoundingClientRect();
            
            if (rect.width === 0 || rect.height === 0) {
                // Element not visible yet
                return;
            }
            
            // Create temporary canvas to capture background
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = Math.max(1, rect.width);
            tempCanvas.height = Math.max(1, rect.height);
            const ctx = tempCanvas.getContext('2d');

            // Use shared background image cache for faster loading
            try {
                const img = await backgroundImageCache.loadBackgroundImage();
                
                // Calculate how the background image covers the viewport
                // Background is set to: background-size: cover, background-position: center, background-attachment: fixed
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                
                // Calculate scale for "cover" sizing
                const coverScale = Math.max(viewportWidth / img.width, viewportHeight / img.height);
                const scaledWidth = img.width * coverScale;
                const scaledHeight = img.height * coverScale;
                
                // Calculate offset for "center" positioning
                // The scaled image is centered, so we need to find where the viewport starts in the scaled image
                const offsetX = (scaledWidth - viewportWidth) / 2;
                const offsetY = (scaledHeight - viewportHeight) / 2;
                
                // Calculate the source rectangle in the original image that corresponds to the element's viewport position
                // Element position relative to viewport: (rect.left, rect.top)
                // Map this to the scaled image space, then back to original image coordinates
                let sourceX = (rect.left + offsetX) / coverScale;
                let sourceY = (rect.top + offsetY) / coverScale;
                let sourceWidth = rect.width / coverScale;
                let sourceHeight = rect.height / coverScale;
                
                // Clamp source coordinates to image bounds to handle edge cases
                if (sourceX < 0) {
                    sourceWidth += sourceX;
                    sourceX = 0;
                }
                if (sourceY < 0) {
                    sourceHeight += sourceY;
                    sourceY = 0;
                }
                if (sourceX + sourceWidth > img.width) {
                    sourceWidth = img.width - sourceX;
                }
                if (sourceY + sourceHeight > img.height) {
                    sourceHeight = img.height - sourceY;
                }
                
                // Ensure we have valid dimensions
                if (sourceWidth <= 0 || sourceHeight <= 0) {
                    this.createFallbackBackground(ctx, rect, tempCanvas);
                    return;
                }
                
                // Draw only the portion of the background image that's behind this element
                ctx.drawImage(
                    img,
                    sourceX, sourceY, sourceWidth, sourceHeight,  // Source rectangle in original image
                    0, 0, rect.width, rect.height  // Destination rectangle in canvas (full element size)
                );
                
                // Update texture
                if (this.backgroundTexture) {
                    WebGLUtils.updateTexture(this.gl, this.backgroundTexture, tempCanvas);
                } else {
                    this.backgroundTexture = WebGLUtils.createTexture(this.gl, tempCanvas);
                }
            } catch (error) {
                // Fallback if background image loading fails
                this.createFallbackBackground(ctx, rect, tempCanvas);
            }
        }

        createFallbackBackground(ctx, rect, tempCanvas) {
            // Create a more visible pattern to verify WebGL rendering
            // Use a colorful gradient that will show refraction effects clearly
            const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
            gradient.addColorStop(0, 'rgba(93, 143, 179, 1.0)');
            gradient.addColorStop(0.3, 'rgba(137, 207, 240, 1.0)');
            gradient.addColorStop(0.6, 'rgba(156, 89, 182, 1.0)');
            gradient.addColorStop(1, 'rgba(46, 46, 46, 1.0)');
            
            // Fill with gradient
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, rect.width, rect.height);
            
            // Add some noise/pattern for better visibility of effects
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            for (let i = 0; i < 50; i++) {
                const x = Math.random() * rect.width;
                const y = Math.random() * rect.height;
                const size = Math.random() * 20 + 5;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }

            // Create or update texture
            if (!this.backgroundTexture) {
                this.backgroundTexture = WebGLUtils.createTexture(this.gl, tempCanvas);
            } else {
                WebGLUtils.updateTexture(this.gl, this.backgroundTexture, tempCanvas);
            }
        }

        render() {
            if (this.isDestroyed || !this.gl || !this.program) {
                return;
            }

            // Make sure we have a background texture - create a test texture if needed
            if (!this.backgroundTexture) {
                this.captureBackground();
                // Create a simple test texture if capture fails
                if (!this.backgroundTexture) {
                    this.createTestTexture();
                }
            }

            // Update time (slower increment for subtle animations)
            this.time += 0.008; // Reduced from 0.016 for slower, more subtle effects

            // Capture background periodically
            this.captureBackground();

            // Clear canvas
            this.gl.clearColor(0, 0, 0, 0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);

            // Use shader program
            this.gl.useProgram(this.program);

            // Set up quad attributes
            WebGLUtils.setupQuadAttributes(this.gl, this.program, this.quad);

            // Set uniforms
            this.setUniforms();

            // Draw quad
            this.gl.drawElements(this.gl.TRIANGLES, this.quad.vertexCount, this.gl.UNSIGNED_SHORT, 0);
        }

        createTestTexture() {
            // Create a simple test pattern to verify WebGL is working
            const testCanvas = document.createElement('canvas');
            testCanvas.width = 256;
            testCanvas.height = 256;
            const ctx = testCanvas.getContext('2d');
            
            // Create a colorful checkerboard pattern
            const size = 32;
            for (let x = 0; x < 256; x += size) {
                for (let y = 0; y < 256; y += size) {
                    const isEven = ((x / size) + (y / size)) % 2 === 0;
                    ctx.fillStyle = isEven ? 'rgba(93, 143, 179, 1.0)' : 'rgba(137, 207, 240, 1.0)';
                    ctx.fillRect(x, y, size, size);
                }
            }
            
            this.backgroundTexture = WebGLUtils.createTexture(this.gl, testCanvas);
            console.log('Created test texture for WebGL rendering');
        }

        setUniforms() {
            const gl = this.gl;
            const program = this.program;
            const rect = this.element.getBoundingClientRect();

            // Background texture
            const bgLoc = gl.getUniformLocation(program, 'u_background');
            if (bgLoc) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.backgroundTexture);
                gl.uniform1i(bgLoc, 0);
            }

            // Resolution
            const resLoc = gl.getUniformLocation(program, 'u_resolution');
            if (resLoc) {
                gl.uniform2f(resLoc, this.canvas.width, this.canvas.height);
            }

            // Mouse position (normalized 0-1 relative to element)
            const mouseLoc = gl.getUniformLocation(program, 'u_mouse');
            if (mouseLoc) {
                gl.uniform2f(mouseLoc, this.mouseX, this.mouseY);
            }

            // Element size (for aspect ratio calculations)
            const elementSizeLoc = gl.getUniformLocation(program, 'u_elementSize');
            if (elementSizeLoc) {
                gl.uniform2f(elementSizeLoc, rect.width, rect.height);
            }

            // Element position (for global coordinate calculations if needed)
            const elementPosLoc = gl.getUniformLocation(program, 'u_elementPosition');
            if (elementPosLoc) {
                gl.uniform2f(elementPosLoc, rect.left, rect.top);
            }

            // Blur amount
            const blurLoc = gl.getUniformLocation(program, 'u_blurAmount');
            if (blurLoc) {
                gl.uniform1f(blurLoc, this.options.blurAmount);
            }

            // Refraction strength
            const refracLoc = gl.getUniformLocation(program, 'u_refractionStrength');
            if (refracLoc) {
                gl.uniform1f(refracLoc, this.options.refractionStrength);
            }

            // Saturation
            const satLoc = gl.getUniformLocation(program, 'u_saturation');
            if (satLoc) {
                gl.uniform1f(satLoc, this.options.saturation);
            }

            // Time
            const timeLoc = gl.getUniformLocation(program, 'u_time');
            if (timeLoc) {
                gl.uniform1f(timeLoc, this.time);
            }

            // Rim light intensity
            const rimLoc = gl.getUniformLocation(program, 'u_rimLightIntensity');
            if (rimLoc) {
                gl.uniform1f(rimLoc, this.options.rimLightIntensity);
            }

            // Edge thickness
            const edgeLoc = gl.getUniformLocation(program, 'u_edgeThickness');
            if (edgeLoc) {
                gl.uniform1f(edgeLoc, this.options.edgeThickness);
            }
        }

        setupEventListeners() {
            // Resize handler
            const resizeObserver = new ResizeObserver(() => {
                this.resizeCanvas();
                this.captureBackground();
            });
            resizeObserver.observe(this.element);

            // Visibility detection for performance (pause rendering when off-screen)
            if (this.options.pauseWhenHidden && 'IntersectionObserver' in window) {
                this.intersectionObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        this.isVisible = entry.isIntersecting;
                    });
                }, {
                    threshold: 0.01 // Trigger when even 1% is visible
                });
                this.intersectionObserver.observe(this.element);
            }

            // Mouse tracking
            if (this.options.enableMouseTracking) {
                document.addEventListener('mousemove', (e) => {
                    const rect = this.element.getBoundingClientRect();
                    this.mouseX = (e.clientX - rect.left) / rect.width;
                    this.mouseY = (e.clientY - rect.top) / rect.height;
                }, { passive: true });
            }

            // Store resize observer for cleanup
            this.resizeObserver = resizeObserver;
        }

        startRenderLoop() {
            const loop = () => {
                if (this.isDestroyed) {
                    return;
                }
                
                // Frame skipping for performance
                this.frameCount++;
                if (this.frameCount % this.options.frameSkip === 0) {
                    // Only render if visible (when pauseWhenHidden is enabled)
                    if (this.isVisible || !this.options.pauseWhenHidden) {
                        this.render();
                    }
                }
                
                this.animationFrameId = requestAnimationFrame(loop);
            };
            this.animationFrameId = requestAnimationFrame(loop);
        }

        destroy() {
            this.isDestroyed = true;

            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }

            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
            }

            if (this.intersectionObserver) {
                this.intersectionObserver.disconnect();
            }

            if (this.gl && this.backgroundTexture) {
                this.gl.deleteTexture(this.backgroundTexture);
            }

            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
        }
    }

    // Manager class to handle multiple glass elements
    class WebGLLiquidGlassManager {
        constructor() {
            this.renderers = new Map();
            this.isInitialized = false;
        }

        async init() {
            if (this.isInitialized) {
                return;
            }

            // Wait for GlassRenderer to be available
            if (typeof GlassRenderer === 'undefined') {
                console.warn('GlassRenderer not found. WebGL liquid glass will not initialize.');
                return;
            }

            // Check if WebGL approach is active
            const currentApproach = GlassRenderer.getApproach();
            console.log('Current glass approach:', currentApproach);
            
            if (currentApproach !== GlassRenderer.APPROACHES.WEBGL) {
                console.log('WebGL approach not active, skipping WebGL initialization');
                return;
            }

            // Check WebGL support
            if (!GlassRenderer.features.webgl && !GlassRenderer.features.webgl2) {
                console.warn('WebGL not supported, falling back to CSS');
                return;
            }

            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeRenderers());
            } else {
                // Small delay to ensure other scripts are loaded
                setTimeout(() => this.initializeRenderers(), 100);
            }

            // Listen for approach changes
            document.addEventListener('glassRendererChange', (e) => {
                if (e.detail.current === GlassRenderer.APPROACHES.WEBGL) {
                    this.initializeRenderers();
                } else {
                    this.destroyAll();
                }
            });

            this.isInitialized = true;
        }

        initializeRenderers() {
            // Glass element selectors (prioritized - most important first)
            const selectors = [
                '.glass-base',
                '.intro-container',
                '.theme-block',
                '.photo-card',
                '.news-item',
                '.btn-glass',
                '.expanded-card',
                '.card-text',
                '.dropdown-content',
                '.search-container'
            ];

            const MAX_RENDERERS = 10; // Limit total renderers for performance
            let rendererCount = 0;
            const elementsToRender = [];
            
            // Collect all eligible elements first
            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                console.log(`Found ${elements.length} elements with selector: ${selector}`);
                
                elements.forEach(element => {
                    // Skip if already has a renderer
                    if (this.renderers.has(element)) {
                        return;
                    }

                    // Skip if element is too small
                    const rect = element.getBoundingClientRect();
                    if (rect.width < 10 || rect.height < 10) {
                        console.log(`Skipping ${selector} - element too small: ${rect.width}x${rect.height}`);
                        return;
                    }

                    // Check if element is visible in viewport (prioritize visible elements)
                    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                    elementsToRender.push({ element, selector, isVisible, rect });
                });
            });
            
            // Sort by visibility (visible first) and position (top first)
            elementsToRender.sort((a, b) => {
                if (a.isVisible !== b.isVisible) return b.isVisible - a.isVisible;
                return a.rect.top - b.rect.top;
            });
            
            // Create renderers up to the limit
            elementsToRender.slice(0, MAX_RENDERERS).forEach(({ element, selector }) => {
                try {
                    console.log(`Creating WebGL renderer for ${selector}`, element);
                    const renderer = new WebGLLiquidGlassRenderer(element);
                    this.renderers.set(element, renderer);
                    rendererCount++;
                    
                    // Check if renderer initialized successfully after a short delay
                    setTimeout(() => {
                        if (!renderer.isInitialized) {
                            console.warn(`Renderer for ${selector} did not initialize properly`);
                        }
                    }, 500);
                } catch (error) {
                    console.error(`Failed to create WebGL renderer for ${selector}:`, error);
                    console.error(error.stack);
                }
            });
            
            if (elementsToRender.length > MAX_RENDERERS) {
                console.warn(`WebGL Liquid Glass: Limited to ${MAX_RENDERERS} renderers (found ${elementsToRender.length} eligible elements)`);
            }
            
            console.log(`WebGL Liquid Glass: Initialized ${rendererCount} renderers`);
        }

        destroyAll() {
            this.renderers.forEach(renderer => renderer.destroy());
            this.renderers.clear();
        }

        addElement(element) {
            if (this.renderers.has(element)) {
                return;
            }

            try {
                const renderer = new WebGLLiquidGlassRenderer(element);
                this.renderers.set(element, renderer);
            } catch (error) {
                console.error('Failed to add WebGL renderer:', error);
            }
        }

        removeElement(element) {
            const renderer = this.renderers.get(element);
            if (renderer) {
                renderer.destroy();
                this.renderers.delete(element);
            }
        }
    }

    // Create global manager instance
    const glassManager = new WebGLLiquidGlassManager();

    // Auto-initialize
    glassManager.init();

    // Export to window
    window.WebGLLiquidGlassManager = glassManager;
    window.WebGLLiquidGlassRenderer = WebGLLiquidGlassRenderer;

})();

