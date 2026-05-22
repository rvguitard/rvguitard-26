const navItems = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[oklch(92.2%_0_0)] bg-[oklch(98.5%_0_0_/_0.9)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8 lg:px-10">
        <a href="#home" className="text-sm font-semibold tracking-[0.12em]">
          RVG
        </a>

        <nav className="flex max-w-full items-center gap-1 overflow-x-auto text-sm text-[oklch(55.6%_0_0)]">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 transition hover:bg-[oklch(100%_0_0)] hover:text-[oklch(14.5%_0_0)]"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
