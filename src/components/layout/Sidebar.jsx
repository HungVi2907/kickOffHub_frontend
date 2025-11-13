const sidebarItems = [
  {
    title: 'Quick links',
    links: [
      { label: 'Premier League overview', href: '/league' },
      { label: 'All teams', href: '/teams' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'API Docs', href: 'https://kickoffhub-api.onrender.com/api/docs' },
      { label: 'fbref inspiration', href: 'https://fbref.com/en/' },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="sticky top-20 hidden h-fit w-72 flex-shrink-0 rounded-xl border border-slate-200 bg-white/70 p-6 shadow-sm lg:block">
      {sidebarItems.map((section) => (
        <div key={section.title} className="mb-6 last:mb-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {section.title}
          </p>
          <ul className="mt-3 space-y-2">
            {section.links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-slate-600 transition hover:text-primary-600"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  )
}
