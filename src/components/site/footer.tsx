const links = [
  { label: "隐私", href: "/settings" },
  { label: "条款", href: "/settings" },
  { label: "宣言", href: "/" },
  { label: "联系", href: "https://github.com" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-devil-line bg-devil-bg/80 px-5 py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p className="font-serif-cn text-xl tracking-wide text-devil-ivory">
          Your worst critic, for your best decisions.
        </p>
        <div className="flex flex-wrap justify-center gap-5 font-mono text-[0.66rem] uppercase tracking-[0.22em] text-devil-muted">
          {links.map((link) => (
            <a
              className="transition-colors hover:text-devil-gold"
              href={link.href}
              key={link.label}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              target={link.href.startsWith("http") ? "_blank" : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
