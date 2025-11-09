/**
 * WebGL Utility Functions
 * Helper functions for WebGL context creation, shader compilation, and program management
 */

(function() {
    'use strict';

    const WebGLUtils = {
        /**
         * Create WebGL context with fallback
         * @param {HTMLCanvasElement} canvas - Canvas element
         * @param {Object} options - Context options
         * @returns {WebGLRenderingContext|WebGL2RenderingContext|null}
         */
        createContext(canvas, options = {}) {
            const defaults = {
                alpha: true,
                antialias: true,
                depth: false,
                stencil: false,
                preserveDrawingBuffer: false,
                premultipliedAlpha: false,
                powerPreference: 'high-performance'
            };

            const opts = Object.assign({}, defaults, options);

            // Try WebGL 2.0 first
            let gl = canvas.getContext('webgl2', opts);
            if (gl) {
                gl.isWebGL2 = true;
                return gl;
            }

            // Fallback to WebGL 1.0
            gl = canvas.getContext('webgl', opts) || 
                 canvas.getContext('experimental-webgl', opts);
            
            if (gl) {
                gl.isWebGL2 = false;
                return gl;
            }

            console.error('WebGL not supported');
            return null;
        },

        /**
         * Create shader from source
         * @param {WebGLRenderingContext} gl - WebGL context
         * @param {number} type - Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
         * @param {string} source - Shader source code
         * @returns {WebGLShader|null}
         */
        createShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                const info = gl.getShaderInfoLog(shader);
                console.error(`Shader compilation error: ${info}`);
                gl.deleteShader(shader);
                return null;
            }

            return shader;
        },

        /**
         * Create shader program from vertex and fragment shader sources
         * @param {WebGLRenderingContext} gl - WebGL context
         * @param {string} vertexSource - Vertex shader source
         * @param {string} fragmentSource - Fragment shader source
         * @returns {WebGLProgram|null}
         */
        createProgram(gl, vertexSource, fragmentSource) {
            const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexSource);
            const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

            if (!vertexShader || !fragmentShader) {
                return null;
            }

            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);

            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                const info = gl.getProgramInfoLog(program);
                console.error(`Program linking error: ${info}`);
                gl.deleteProgram(program);
                gl.deleteShader(vertexShader);
                gl.deleteShader(fragmentShader);
                return null;
            }

            // Clean up shaders (they're linked into the program)
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);

            return program;
        },

        /**
         * Create texture from image source
         * @param {WebGLRenderingContext} gl - WebGL context
         * @param {HTMLImageElement|HTMLCanvasElement|ImageData} source - Image source
         * @param {Object} options - Texture options
         * @returns {WebGLTexture|null}
         */
        createTexture(gl, source, options = {}) {
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);

            const {
                wrapS = gl.CLAMP_TO_EDGE,
                wrapT = gl.CLAMP_TO_EDGE,
                minFilter = gl.LINEAR,
                magFilter = gl.LINEAR,
                format = gl.RGBA,
                type = gl.UNSIGNED_BYTE
            } = options;

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);

            if (source instanceof ImageData) {
                gl.texImage2D(gl.TEXTURE_2D, 0, format, format, type, source);
            } else {
                gl.texImage2D(gl.TEXTURE_2D, 0, format, format, type, source);
            }

            return texture;
        },

        /**
         * Update texture with new image data
         * @param {WebGLRenderingContext} gl - WebGL context
         * @param {WebGLTexture} texture - Texture to update
         * @param {HTMLImageElement|HTMLCanvasElement|ImageData} source - New image source
         */
        updateTexture(gl, texture, source) {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            
            if (source instanceof ImageData) {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
            } else {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
            }
        },

        /**
         * Create framebuffer for off-screen rendering
         * @param {WebGLRenderingContext} gl - WebGL context
         * @param {number} width - Framebuffer width
         * @param {number} height - Framebuffer height
         * @returns {Object} {framebuffer, texture, renderbuffer}
         */
        createFramebuffer(gl, width, height) {
            const framebuffer = gl.createFramebuffer();
            const texture = gl.createTexture();
            const renderbuffer = gl.createRenderbuffer();

            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

            // Create texture
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            // Create renderbuffer for depth/stencil if needed
            gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

            // Attach texture
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

            // Check framebuffer status
            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
                console.error('Framebuffer not complete');
                gl.deleteFramebuffer(framebuffer);
                gl.deleteTexture(texture);
                gl.deleteRenderbuffer(renderbuffer);
                return null;
            }

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);

            return { framebuffer, texture, renderbuffer };
        },

        /**
         * Create quad geometry for full-screen rendering
         * @param {WebGLRenderingContext} gl - WebGL context
         * @returns {Object} {positionBuffer, uvBuffer, indexBuffer, vertexCount}
         */
        createQuad(gl) {
            // Position buffer (full-screen quad)
            const positions = new Float32Array([
                -1, -1,
                 1, -1,
                -1,  1,
                 1,  1
            ]);

            // UV buffer
            const uvs = new Float32Array([
                0, 1,
                1, 1,
                0, 0,
                1, 0
            ]);

            // Index buffer
            const indices = new Uint16Array([
                0, 1, 2,
                2, 1, 3
            ]);

            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

            const uvBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

            return {
                positionBuffer,
                uvBuffer,
                indexBuffer,
                vertexCount: 6
            };
        },

        /**
         * Set up quad attributes for rendering
         * @param {WebGLRenderingContext} gl - WebGL context
         * @param {WebGLProgram} program - Shader program
         * @param {Object} quad - Quad geometry object
         */
        setupQuadAttributes(gl, program, quad) {
            // Position attribute
            const positionLoc = gl.getAttribLocation(program, 'a_position');
            if (positionLoc >= 0) {
                gl.bindBuffer(gl.ARRAY_BUFFER, quad.positionBuffer);
                gl.enableVertexAttribArray(positionLoc);
                gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
            }

            // UV attribute
            const uvLoc = gl.getAttribLocation(program, 'a_uv');
            if (uvLoc >= 0) {
                gl.bindBuffer(gl.ARRAY_BUFFER, quad.uvBuffer);
                gl.enableVertexAttribArray(uvLoc);
                gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);
            }

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quad.indexBuffer);
        }
    };

    // Export to window
    window.WebGLUtils = WebGLUtils;

})();

