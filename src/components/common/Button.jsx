import { Link } from 'react-router-dom'
export default function Button({
  children,
  href,
  to,
  className = '',
  type = 'button',
  onClick,
  disabled = false,
  ...rest
}) {
  const styles = `inline-flex items-center justify-center rounded-none bg-accent px-7 py-3 text-sm font-bold uppercase tracking-wider text-black transition hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-60 ${className}`

  if (to) return <Link to={to} className={styles}>{children}</Link>
  if (href) return <a href={href} className={styles}>{children}</a>

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={styles} {...rest}>
      {children}
    </button>
  )
}
