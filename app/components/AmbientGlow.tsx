import { useEffect, useRef } from 'react';

const vsSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fsSource = `
  precision highp float;
  varying vec2 v_uv;
  uniform vec2 u_resolution;
  uniform float u_time;

  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), 
                   hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), 
                   hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= u_resolution.x / u_resolution.y;

    float t = u_time * 0.15;

    vec2 q = vec2(noise(p * 1.5 + t), noise(p * 1.5 + vec2(5.2, 1.3) - t));
    vec2 r = vec2(noise(p * 2.0 + 2.0 * q + vec2(1.7, 9.2) + t * 0.8), 
                  noise(p * 2.0 + 2.0 * q + vec2(8.3, 2.8) - t * 0.8));

    float f = noise(p * 1.5 + 2.0 * r);

    // FlashBind Colors
    vec3 colElectric = vec3(0.145, 0.388, 0.922); // #2563EB (Primary moving color)
    vec3 colCyan     = vec3(0.133, 0.827, 0.933); // #22d3ee (Secondary soft cyan)
    vec3 colNavy     = vec3(0.117, 0.227, 0.541); // #1E3A8A (Restrained dark navy accent)

    vec3 col = mix(colCyan, colElectric, f * 0.5 + 0.5);
    
    float navyAccent = smoothstep(0.72, 0.96, r.x) * 0.18;
    col = mix(col, colNavy, navyAccent);

    float auraA = smoothstep(0.58, 0.84, f);
    float auraB = smoothstep(0.64, 0.90, r.y);
    float aura = max(auraA, auraB * 0.70);
    
    float mask = 1.0;
    if (u_resolution.x > u_resolution.y) {
      // Desktop: mask the left-side headline
      vec2 textCenter = vec2(-0.5 * (u_resolution.x / u_resolution.y), 0.0);
      float dist = length(p - textCenter);
      mask = smoothstep(0.8, 2.6, dist);
    } else {
      // Mobile: mask the centered headline
      vec2 textCenter = vec2(0.0, 0.2);
      float dist = length(p - textCenter);
      mask = smoothstep(0.8, 2.2, dist);
    }

    float alpha = aura * 0.20 * mask + 0.012; // minimal baseline
    alpha = min(alpha, 0.24); // max alpha

    gl_FragColor = vec4(col * alpha, alpha);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('Shader compilation failed:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function AmbientGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let vertexShader: WebGLShader | null = null;
    let fragmentShader: WebGLShader | null = null;
    let buffer: WebGLBuffer | null = null;

    try {
      gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' });
      if (!gl) return; // Fallback if no webgl

      vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
      fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
      
      if (!vertexShader || !fragmentShader) {
        throw new Error("Shader compilation failed");
      }

      program = gl.createProgram();
      if (!program) throw new Error("Program creation failed");

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn('Program linking failed:', gl.getProgramInfoLog(program));
        throw new Error("Program linking failed");
      }

      const positionLoc = gl.getAttribLocation(program, 'a_position');
      if (positionLoc === -1) throw new Error("Invalid attribute location");

      const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
      const timeLoc = gl.getUniformLocation(program, 'u_time');
      if (!resolutionLoc || !timeLoc) throw new Error("Missing uniform locations");

      buffer = gl.createBuffer();
      if (!buffer) throw new Error("Buffer creation failed");

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]), gl.STATIC_DRAW);

      gl.useProgram(program);
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      const state = {
        isIntersecting: true, // We assume true until IntersectionObserver says otherwise to avoid flashes if it takes time
        isDocumentVisible: document.visibilityState === 'visible',
        glContextLost: false,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        animationId: 0,
        startTime: performance.now(),
        lastRenderTime: 0,
        fpsInterval: 1000 / 30,
      };

      const drawFrame = (now: number, forceTime?: number) => {
        if (!gl || state.glContextLost) return;
        const t = forceTime !== undefined ? forceTime : (now - state.startTime) / 1000;
        gl.uniform1f(timeLoc, t);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      const scheduleAnimation = () => {
        if (state.animationId) return; // already scheduled
        if (state.glContextLost) return;
        if (!state.isIntersecting || !state.isDocumentVisible || state.prefersReducedMotion) return;

        const loop = (now: number) => {
          if (!state.isIntersecting || !state.isDocumentVisible || state.prefersReducedMotion || state.glContextLost) {
            state.animationId = 0;
            return;
          }
          
          state.animationId = requestAnimationFrame(loop);
          
          const elapsed = now - state.lastRenderTime;
          if (elapsed > state.fpsInterval) {
            state.lastRenderTime = now - (elapsed % state.fpsInterval);
            drawFrame(now);
          }
        };
        state.animationId = requestAnimationFrame(loop);
      };

      const cancelAnimation = () => {
        if (state.animationId) {
          cancelAnimationFrame(state.animationId);
          state.animationId = 0;
        }
      };

      const handleResize = () => {
        if (!canvas || !gl || state.glContextLost) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width * dpr));
        const height = Math.max(1, Math.round(rect.height * dpr));
        
        // Only assign if changed (assigning width/height clears WebGL framebuffer)
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          gl.viewport(0, 0, width, height);
          gl.uniform2f(resolutionLoc, width, height);

          // If reduced motion, we need to redraw the static frame since resizing clears the framebuffer
          if (state.prefersReducedMotion) {
            drawFrame(performance.now(), 50.0);
          }
        }
      };

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(canvas);
      handleResize(); // initial size and draw

      // Initial draw for reduced motion, or schedule animation
      if (state.prefersReducedMotion) {
        drawFrame(performance.now(), 50.0);
      } else {
        scheduleAnimation();
      }

      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleReducedMotionChange = (e: MediaQueryListEvent) => {
        state.prefersReducedMotion = e.matches;
        if (e.matches) {
          cancelAnimation();
          drawFrame(performance.now(), 50.0);
        } else {
          scheduleAnimation();
        }
      };
      // For cross-browser support, usually addEventListener is enough on modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleReducedMotionChange);
      } else {
        mediaQuery.addListener(handleReducedMotionChange);
      }

      const intersectionObserver = new IntersectionObserver((entries) => {
        state.isIntersecting = entries[0].isIntersecting;
        if (state.isIntersecting) {
          scheduleAnimation();
        } else {
          cancelAnimation();
        }
      });
      intersectionObserver.observe(canvas);

      const handleVisibilityChange = () => {
        state.isDocumentVisible = document.visibilityState === 'visible';
        if (state.isDocumentVisible) {
          scheduleAnimation();
        } else {
          cancelAnimation();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      const handleContextLost = () => {
        state.glContextLost = true;
        cancelAnimation();
        // Do NOT call e.preventDefault(). We are not implementing restoration, so we leave it on CSS fallback.
      };
      canvas.addEventListener('webglcontextlost', handleContextLost);

      return () => {
        cancelAnimation();
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleReducedMotionChange);
        } else {
          mediaQuery.removeListener(handleReducedMotionChange);
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        if (gl) {
          if (program) gl.deleteProgram(program);
          if (vertexShader) gl.deleteShader(vertexShader);
          if (fragmentShader) gl.deleteShader(fragmentShader);
          if (buffer) gl.deleteBuffer(buffer);
        }
      };

    } catch (err) {
      // Cleanup on initialization failure
      if (gl) {
        if (program) gl.deleteProgram(program);
        if (vertexShader) gl.deleteShader(vertexShader);
        if (fragmentShader) gl.deleteShader(fragmentShader);
        if (buffer) gl.deleteBuffer(buffer);
      }
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 fallback-gradient"
      aria-hidden="true"
      style={{
        background: 'radial-gradient(circle at 70% 30%, rgba(34, 211, 238, 0.1) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 100%)'
      }}
    />
  );
}
