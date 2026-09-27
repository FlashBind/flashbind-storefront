import { useEffect, useRef } from 'react';

const vsSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// Flowing wave field: large, soft bands of light that all drift in the same
// direction and blend into each other, like slow waves. Every pixel comes
// from the same field, so there are no separate spots on screen.
const fsSource = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_textMaskStrength;
  uniform vec2 u_textMaskCenter;

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

    float t = u_time * 0.16;

    // One shared direction for the whole field, so every shape drifts the
    // same way, like slow waves or drifting light.
    vec2 flowDir = vec2(0.94, -0.34);
    vec2 pd = p * 0.8 - flowDir * t * 0.35;

    // Slow, large warp: bends the wave bands into soft, flowing shapes
    // instead of straight stripes.
    vec2 q = vec2(noise(pd * 0.7 + vec2(t * 0.15, 0.0)),
                  noise(pd * 0.7 + vec2(5.2, 1.3 - t * 0.15)));

    // Three travelling waves along the flow direction, plus a little soft
    // noise. Low frequencies keep the shapes large; because they are all
    // part of the same wave field they overlap and blend into each other.
    // The third wave is out of step with the others, which keeps the glowing
    // area steady (about 56-71% of the hero) instead of pulsing.
    float phase = dot(pd, flowDir) * 1.6 + (q.x - 0.5) * 3.0 + t * 0.6;
    float wave = sin(phase) * 0.5 + 0.5;
    float wave2 = sin(phase * 0.53 + (q.y - 0.5) * 2.4 + 1.7) * 0.5 + 0.5;
    float wave3 = sin(phase * 1.37 + (q.y - 0.5) * 1.8 + 4.1) * 0.5 + 0.5;
    float soft = noise(pd * 1.1 + 1.6 * q);
    float fieldValue = wave * 0.4 + wave2 * 0.25 + wave3 * 0.15 + soft * 0.2;

    // FlashBind palette -- anchored on the site's one real brand token (#1E3A8A),
    // extended with the electric/cyan pairing already used by both prior drafts.
    vec3 colElectric = vec3(0.145, 0.388, 0.922); // #2563EB
    vec3 colCyan     = vec3(0.133, 0.827, 0.933); // #22D3EE
    vec3 colNavy     = vec3(0.118, 0.227, 0.541); // #1E3A8A

    vec3 col = mix(colCyan, colElectric, smoothstep(0.2, 0.8, wave2 * 0.6 + soft * 0.4));
    float navyPocket = smoothstep(0.7, 0.95, wave * q.y);
    col = mix(col, colNavy, navyPocket * 0.45);

    // Wide, soft transition: about two thirds of the hero glows, with the
    // rest left cream between the wave crests.
    float aura = smoothstep(0.34, 0.60, fieldValue);

    // Taper behind the headline/paragraph column so the text stays easy to
    // read, without cutting a hard hole in the field.
    float dist = length(p - u_textMaskCenter);
    float mask = mix(1.0, smoothstep(0.6, 2.0, dist), u_textMaskStrength);

    // Peak opacity unchanged from the previous version (0.45).
    float alpha = aura * 0.45 * mask;
    alpha = min(alpha, 0.46);

    // Static, screen-space dither -- breaks gradient banding and reads as a
    // faint grain texture across the whole field, matching the reference's
    // grain parameter without any time-based flicker.
    float grain = (hash(gl_FragCoord.xy) - 0.5) * 0.05;
    col += grain;
    alpha = clamp(alpha + grain * 0.015, 0.0, 0.48);

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

// Shown before WebGL starts, and if it is unavailable or lost: a soft
// diagonal band of light on cream, echoing the animated waves.
const FALLBACK_BACKGROUND =
  'linear-gradient(110deg, rgba(253,252,248,0) 20%, rgba(37,99,235,0.10) 45%, rgba(34,211,238,0.08) 65%, rgba(253,252,248,0) 90%)';

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
      if (!gl) return; // No WebGL: the inline CSS fallback gradient below stays visible.

      vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
      fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);

      if (!vertexShader || !fragmentShader) {
        throw new Error('Shader compilation failed');
      }

      program = gl.createProgram();
      if (!program) throw new Error('Program creation failed');

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn('Program linking failed:', gl.getProgramInfoLog(program));
        throw new Error('Program linking failed');
      }

      const positionLoc = gl.getAttribLocation(program, 'a_position');
      if (positionLoc === -1) throw new Error('Invalid attribute location');

      const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
      const timeLoc = gl.getUniformLocation(program, 'u_time');
      const maskStrengthLoc = gl.getUniformLocation(program, 'u_textMaskStrength');
      const maskCenterLoc = gl.getUniformLocation(program, 'u_textMaskCenter');
      if (!resolutionLoc || !timeLoc || !maskStrengthLoc || !maskCenterLoc) {
        throw new Error('Missing uniform locations');
      }

      buffer = gl.createBuffer();
      if (!buffer) throw new Error('Buffer creation failed');

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]), gl.STATIC_DRAW);

      gl.useProgram(program);
      // WebGL is drawing now, so the CSS fallback tint would only add haze.
      canvas.style.background = 'none';
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      const state = {
        isIntersecting: true,
        isDocumentVisible: document.visibilityState === 'visible',
        glContextLost: false,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        animationId: 0,
        startTime: performance.now(),
        lastRenderTime: 0,
        fpsInterval: 1000 / 30,
      };

      const setMaskUniforms = (width: number, height: number) => {
        if (!gl) return;
        // Desktop (lg:flex-row): headline column sits on the left half.
        // Mobile (flex-col): headline stacks near the top-center.
        const isDesktop = width > height;
        if (isDesktop) {
          gl.uniform1f(maskStrengthLoc, 0.85);
          gl.uniform2f(maskCenterLoc, -0.55 * (width / height), -0.1);
        } else {
          gl.uniform1f(maskStrengthLoc, 0.75);
          gl.uniform2f(maskCenterLoc, 0.0, 0.35);
        }
      };

      const drawFrame = (now: number, forceTime?: number) => {
        if (!gl || state.glContextLost) return;
        const t = forceTime !== undefined ? forceTime : (now - state.startTime) / 1000;
        gl.uniform1f(timeLoc, t);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      const scheduleAnimation = () => {
        if (state.animationId) return;
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
        const rect = canvas.getBoundingClientRect();
        // Cap resolution harder on narrow (mobile) viewports -- the fragment
        // shader's cost scales with pixel count, so this is the main lever
        // for keeping phones cheap.
        const isNarrowViewport = window.innerWidth < 768;
        const dpr = Math.min(window.devicePixelRatio || 1, isNarrowViewport ? 1 : 1.5);
        const width = Math.max(1, Math.round(rect.width * dpr));
        const height = Math.max(1, Math.round(rect.height * dpr));

        // Only reassigning canvas.width/height (which reallocates the GL
        // drawing buffer) is guarded -- setting the viewport and uniforms is
        // cheap and MUST happen every call. Skipping it when the DOM size
        // happens not to have changed is wrong whenever the GL *program* is
        // new (e.g. React StrictMode's dev-only double-invoke deletes and
        // recreates the program on a canvas element that persists across
        // both effect runs): the canvas can already be the right size while
        // the current program's own u_resolution has never been set.
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
        gl.viewport(0, 0, width, height);
        gl.uniform2f(resolutionLoc, width, height);
        setMaskUniforms(width, height);

        if (state.prefersReducedMotion) {
          drawFrame(performance.now(), 50.0);
        }
      };

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(canvas);
      handleResize();

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

      const handleContextLost = (e: Event) => {
        e.preventDefault();
        state.glContextLost = true;
        cancelAnimation();
        canvas.style.background = FALLBACK_BACKGROUND;
        // No restoration attempted -- the inline CSS fallback gradient below
        // stays visible in the canvas's place.
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
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
      style={{
        // Deterministic SSR-safe fallback: identical on first paint, stays
        // visible if WebGL is unavailable or the context is lost.
        background: FALLBACK_BACKGROUND,
      }}
    />
  );
}
