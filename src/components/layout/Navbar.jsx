import { useState } from 'react'
import Button from '../common/Button'
import Logo from '../common/Logo'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const links = [
    ['About', '#about'],
    ['What we offer', '#offers'],
    ['Testimonials', '#testimonials'],
    ['Contact', '#contact'],
  ]

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Logo className="text-3xl" />
        <div className="hidden items-center gap-8 md:flex">
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-xs font-bold uppercase tracking-widest text-white/80 transition hover:text-accent"
            >
              {label}
            </a>
          ))}
          <Button to="/login" className="px-6 py-2.5">
            Login
          </Button>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-white md:hidden"
          aria-label="Toggle menu"
        >
          <span className="block h-0.5 w-7 bg-white" />
          <span className="my-1.5 block h-0.5 w-7 bg-white" />
          <span className="block h-0.5 w-7 bg-white" />
        </button>
      </nav>
      {open && (
        <div className="border-t border-white/10 bg-ink px-6 pb-6 md:hidden">
          {links.map(([label, href]) => (
            <a
              onClick={() => setOpen(false)}
              key={href}
              href={href}
              className="block border-b border-white/10 py-4 text-xs font-bold uppercase tracking-widest"
            >
              {label}
            </a>
          ))}
          <Button to="/login" className="mt-5 w-full">
            Login
          </Button>
        </div>
      )}
    </header>
  )
}
