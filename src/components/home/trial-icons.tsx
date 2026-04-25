export function DaggerIcon() {
  return (
    <svg className="h-16 w-16" fill="none" viewBox="0 0 64 64">
      <path d="M47 5 28 35l-7 8-3-3 8-7L56 14l3-9-12 0Z" stroke="currentColor" />
      <path d="M17 39 7 49l8 8 10-10" stroke="currentColor" />
      <path d="M22 38 26 42" stroke="currentColor" />
    </svg>
  );
}

export function FiveBladesIcon() {
  return (
    <svg className="h-16 w-16" fill="none" viewBox="0 0 64 64">
      {[18, 25, 32, 39, 46].map((x, index) => (
        <path
          d={`M32 55 ${x} 10l4-3 4 3-8 45Z`}
          key={x}
          stroke="currentColor"
          style={{
            transform: `rotate(${(index - 2) * 12}deg)`,
            transformOrigin: "32px 55px",
          }}
        />
      ))}
      <path d="M22 55h20" stroke="currentColor" />
    </svg>
  );
}

export function CourtScaleIcon() {
  return (
    <svg className="h-16 w-16" fill="none" viewBox="0 0 64 64">
      <path d="M32 8v44" stroke="currentColor" />
      <path d="M16 20h32" stroke="currentColor" />
      <path d="M32 14 17 20 8 40h18l-9-20" stroke="currentColor" />
      <path d="M32 14 47 20l-9 20h18l-9-20" stroke="currentColor" />
      <path d="M22 52h20" stroke="currentColor" />
      <path d="M26 58h12" stroke="currentColor" />
    </svg>
  );
}
