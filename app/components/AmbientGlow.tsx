/**
 * Ambient hero background: layered blue/cyan gradients plus a slow tap-ripple
 * motif (inspired by NFC tap-to-connect motion). CSS-only — no WebGL, no JS
 * animation loop — so it is inert on the server and identical on first paint.
 */
export default function AmbientGlow() {
  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 ambient-glow"
      aria-hidden="true"
    >
      {/* Static base wash — always visible, even under prefers-reduced-motion */}
      <div className="absolute top-[8%] -right-[12%] w-[760px] h-[760px] rounded-full blur-[130px] opacity-70 bg-[radial-gradient(circle,rgba(37,99,235,0.16)_0%,rgba(37,99,235,0)_70%)]" />
      <div className="absolute -bottom-[18%] -left-[8%] w-[620px] h-[620px] rounded-full blur-[110px] opacity-60 bg-[radial-gradient(circle,rgba(30,58,138,0.14)_0%,rgba(30,58,138,0)_70%)]" />

      {/* Slow-breathing cyan accent — animated, right/bottom-weighted so it never sits behind the H1 */}
      <div className="ambient-glow__breathe absolute bottom-[6%] right-[6%] w-[420px] h-[420px] rounded-full blur-[100px] bg-[radial-gradient(circle,rgba(34,211,238,0.18)_0%,rgba(34,211,238,0)_70%)]" />

      {/* Tap-to-connect ripple, echoing "One Tap … Connects" — anchored near the hero image column */}
      <div className="absolute right-[8%] bottom-[18%] w-[2px] h-[2px]">
        <span className="ambient-glow__ripple ambient-glow__ripple--a" />
        <span className="ambient-glow__ripple ambient-glow__ripple--b" />
      </div>
    </div>
  );
}
