import Logo from '../common/Logo'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <Logo className="text-2xl" />
        <p className="text-xs uppercase tracking-widest text-white/40">
          © {new Date().getFullYear()} FitOps. MADE BY <a href="https://marionbrix.vercel.app/" target="_blank" rel="noopener noreferrer" className="font-bold text-white/60 hover:text-accent">MARION BRIX QUILING</a>
        </p>
        <div className="flex gap-5 text-xs font-bold uppercase tracking-widest text-white/60">
          <a href="#contact" className="hover:text-accent">
            Instagram
          </a>
          <a href="#contact" className="hover:text-accent">
            Facebook
          </a>
        </div>
      </div>
    </footer>
  )
}
