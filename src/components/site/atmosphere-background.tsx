export function AtmosphereBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 bg-devil-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_8%,rgba(139,0,0,0.22),transparent_30%),radial-gradient(circle_at_82%_22%,rgba(72,15,15,0.18),transparent_32%),linear-gradient(135deg,rgba(35,12,16,0.18),transparent_48%)]" />
      <div className="noise-texture absolute inset-0 opacity-[0.045] mix-blend-screen" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-devil-bg to-transparent" />
    </div>
  );
}
