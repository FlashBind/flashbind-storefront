import {useEffect, useRef} from 'react';

// Hero ambient light, v5.5: light coming in from the edges of the screen,
// like the Siri glow, on the dark hero. The hero fills the rest of the first
// screen under the header, and the glow is part of it: strongest right at
// the hero's edges, fading only inward, so the centre stays
// clean. It scrolls with the page.
//
// Brighter highlights travel around the frame and the band swells like a
// flame; the frame never fades out as a whole.
//
// A full frame on all four edges: the side glows run the full height of the
// hero, and the bottom band is as strong as the other edges and flush with
// the hero's bottom edge. Desktop: square corners; phones: rounded corners.
//
// One hue only: the FlashBind navy family, in lighter shades so it reads as
// light on the dark background.

const vsSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fsSource = `
  precision mediump float;
  uniform vec2 u_resolution;    // drawing-buffer pixels
  uniform float u_pixelRatio;   // drawing-buffer pixels per CSS pixel
  uniform float u_bandWidth;    // CSS pixels
  uniform float u_alphaScale;   // overall strength
  uniform float u_highlight;    // strength of the travelling highlights
  uniform float u_round;        // 1 = rounded corners (phones), 0 = square
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
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec2 size = u_resolution / u_pixelRatio;
    vec2 pos = gl_FragCoord.xy / u_pixelRatio; // origin at the bottom-left
    float t = u_time;

    // Distance to each edge (0 right on the edge).
    float dL = pos.x;
    float dR = size.x - pos.x;
    float dT = size.y - pos.y;
    float dB = pos.y;

    // Position around the frame as an angle; noise sampled on a circle wraps
    // around the frame without a seam.
    vec2 c = (pos - size * 0.5) / (size * 0.5);
    float a = atan(c.y, c.x);
    vec2 ring = vec2(cos(a), sin(a));

    // Flame texture: spots drifting both ways, fine flicker, slow swelling.
    float travel1 = noise(ring * 1.7 + vec2(t * 0.45, -t * 0.3));
    float travel2 = noise(ring * 3.4 + vec2(-t * 0.7, t * 0.55) + 7.3);
    float flicker = noise(ring * 7.0 + vec2(t * 1.1, -t * 0.9) + 1.9);
    float swell = noise(ring * 1.1 + vec2(t * 0.2, t * 0.15) + 3.1);
    float flame = travel1 * 0.42 + travel2 * 0.28 + flicker * 0.12 + swell * 0.18;

    // Bright highlights travelling steadily around the frame.
    float arc1 = pow(0.5 + 0.5 * sin(2.0 * a - t * 0.55), 6.0);
    float arc2 = pow(0.5 + 0.5 * sin(3.0 * a + t * 0.4 + 1.0), 8.0);
    float highlight = (arc1 + arc2 * 0.7) * (0.55 + 0.45 * travel2) * u_highlight;

    // Band profile: strongest right at the edge, soft fade inward only.
    float width = u_bandWidth * (0.55 + 1.0 * flame + 0.35 * highlight);

    // Rounded corners: smooth minimum of the distances.
    float dx = min(dL, dR);
    float k = u_bandWidth * 0.45;
    float dy = min(dT, dB);
    float dRound = max(-k * log(exp(-dx / k) + exp(-dy / k)), 0.0);
    float rounded = exp(-pow(dRound / width, 1.45));

    // Square corners: each edge glows on its own and they blend where they meet.
    float gL = exp(-pow(dL / width, 1.45));
    float gR = exp(-pow(dR / width, 1.45));
    float gT = exp(-pow(dT / width, 1.45));
    float gB = exp(-pow(dB / width, 1.45));
    float square = 1.0 - (1.0 - gL) * (1.0 - gR) * (1.0 - gT) * (1.0 - gB);

    float shape = mix(square, rounded, u_round);

    // Brightness never drops below about 60%, so the frame is always there.
    float brightness = 0.62 + 0.5 * flame + 0.45 * highlight;
    float glow = clamp(shape * brightness, 0.0, 1.0);

    // Same navy hue: deep navy for most of the band, lighter navy where the
    // highlights and hottest spots pass.
    vec3 deep  = vec3(0.227, 0.337, 0.659); // #3A56A8
    vec3 navy  = vec3(0.333, 0.435, 0.749); // #556FBF
    vec3 light = vec3(0.525, 0.608, 0.851); // #869BD9
    vec3 col = mix(deep, navy, smoothstep(0.15, 0.6, glow));
    col = mix(col, light, clamp(smoothstep(0.75, 1.0, glow) + highlight * shape * 0.8, 0.0, 1.0));

    float alpha = glow * u_alphaScale;
    // Tiny static dither against banding in the soft gradient.
    alpha = clamp(alpha + (hash(gl_FragCoord.xy) - 0.5) * 0.012 * step(0.004, alpha), 0.0, 1.0);

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

// A still navy edge glow: shown on first paint, and kept if WebGL is
// unavailable or its context is lost.
const FALLBACK_SHADOW = 'inset 0 0 40px 2px rgba(134,155,217,0.35)';

// Time used for the still frame (reduced motion).
const STILL_FRAME_TIME = 12.0;

const isPhone = () => window.innerWidth < 768;

// Phone and desktop are tuned to read at the same visual strength.
function glowSettings(width: number) {
  if (isPhone()) {
    // Rounded corners.
    const band = Math.min(72, Math.max(26, width * 0.065));
    return {band, alpha: 0.76, highlight: 0.3, round: 1};
  }
  // Desktop: square corners.
  const band = Math.min(44, Math.max(22, Math.min(width, window.innerHeight) * 0.038));
  return {band, alpha: 0.74, highlight: 1.0, round: 0};
}

export default function AmbientGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.parentElement;
    if (!canvas || !hero) return;

    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let vertexShader: WebGLShader | null = null;
    let fragmentShader: WebGLShader | null = null;
    let buffer: WebGLBuffer | null = null;
    const releaseGl = () => {
      if (!gl) return;
      if (program) gl.deleteProgram(program);
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
      if (buffer) gl.deleteBuffer(buffer);
    };

    // The hero fills the screen below the header (.hero-screen in app.css).
    const header = document.querySelector('header');
    const publishHeaderHeight = () => {
      if (header) {
        document.documentElement.style.setProperty('--header-h', `${Math.round(header.getBoundingClientRect().height)}px`);
      }
    };
    publishHeaderHeight();
    const headerObserver = header ? new ResizeObserver(publishHeaderHeight) : null;
    if (header) headerObserver?.observe(header);

    try {
      gl = canvas.getContext('webgl', {alpha: true, antialias: false, powerPreference: 'low-power'});
      if (!gl) return () => headerObserver?.disconnect(); // No WebGL: the still CSS glow stays.

      vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
      fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
      if (!vertexShader || !fragmentShader) throw new Error('Shader compilation failed');

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
      const names = ['u_resolution', 'u_pixelRatio', 'u_bandWidth', 'u_alphaScale', 'u_highlight', 'u_round', 'u_time'] as const;
      const u = Object.fromEntries(names.map((name) => [name, gl!.getUniformLocation(program!, name)])) as Record<
        (typeof names)[number],
        WebGLUniformLocation | null
      >;
      if (positionLoc === -1 || names.some((name) => !u[name])) throw new Error('Missing shader inputs');

      buffer = gl.createBuffer();
      if (!buffer) throw new Error('Buffer creation failed');
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.useProgram(program);
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
      // WebGL draws the glow now; the CSS fallback would double it.
      canvas.style.boxShadow = 'none';

      const state = {
        isIntersecting: true,
        isDocumentVisible: document.visibilityState === 'visible',
        glContextLost: false,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        animationId: 0,
        startTime: performance.now(),
        lastRenderTime: 0,
        // Phones: 24 fps; desktop: 30 fps. The motion is slow, so this is smooth.
        fpsInterval: 1000 / (isPhone() ? 24 : 30),
      };

      const drawFrame = (now: number, forceTime?: number) => {
        if (!gl || state.glContextLost) return;
        gl.uniform1f(u.u_time, forceTime ?? (now - state.startTime) / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      const scheduleAnimation = () => {
        if (state.animationId || state.glContextLost) return;
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
        if (!gl || state.glContextLost) return;
        const heroRect = hero.getBoundingClientRect();
        const settings = glowSettings(heroRect.width);
        // The glow is soft, so a low resolution looks the same and costs far
        // less: 1x on phones, at most 1.25x on desktop.
        const dpr = Math.min(window.devicePixelRatio || 1, isPhone() ? 1 : 1.25);
        const width = Math.max(1, Math.round(heroRect.width * dpr));
        const height = Math.max(1, Math.round(heroRect.height * dpr));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
        state.fpsInterval = 1000 / (isPhone() ? 24 : 30);
        gl.viewport(0, 0, width, height);
        gl.uniform2f(u.u_resolution, width, height);
        gl.uniform1f(u.u_pixelRatio, dpr);
        gl.uniform1f(u.u_bandWidth, settings.band);
        gl.uniform1f(u.u_alphaScale, settings.alpha);
        gl.uniform1f(u.u_highlight, settings.highlight);
        gl.uniform1f(u.u_round, settings.round);
        drawFrame(performance.now(), state.prefersReducedMotion ? STILL_FRAME_TIME : undefined);
      };

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(hero);
      window.addEventListener('resize', handleResize);
      handleResize();
      scheduleAnimation();

      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleReducedMotionChange = (e: MediaQueryListEvent) => {
        state.prefersReducedMotion = e.matches;
        if (e.matches) {
          cancelAnimation();
          drawFrame(performance.now(), STILL_FRAME_TIME);
        } else {
          scheduleAnimation();
        }
      };
      mediaQuery.addEventListener('change', handleReducedMotionChange);

      // Runs while any part of the hero is on screen; pauses once it is
      // completely off screen, or the tab is hidden.
      const intersectionObserver = new IntersectionObserver((entries) => {
        state.isIntersecting = entries[0].isIntersecting;
        if (state.isIntersecting) scheduleAnimation();
        else cancelAnimation();
      });
      intersectionObserver.observe(canvas);

      const handleVisibilityChange = () => {
        state.isDocumentVisible = document.visibilityState === 'visible';
        if (state.isDocumentVisible) scheduleAnimation();
        else cancelAnimation();
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      const handleContextLost = (e: Event) => {
        e.preventDefault();
        state.glContextLost = true;
        cancelAnimation();
        canvas.style.boxShadow = FALLBACK_SHADOW;
      };
      canvas.addEventListener('webglcontextlost', handleContextLost);

      return () => {
        cancelAnimation();
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        window.removeEventListener('resize', handleResize);
        mediaQuery.removeEventListener('change', handleReducedMotionChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        releaseGl();
        headerObserver?.disconnect();
      };
    } catch {
      releaseGl();
      canvas.style.boxShadow = FALLBACK_SHADOW;
      return () => headerObserver?.disconnect();
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-glow-canvas"
      aria-hidden="true"
      style={{boxShadow: FALLBACK_SHADOW}}
    />
  );
}
