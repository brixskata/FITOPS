import { Link } from 'react-router-dom'
import { classNames } from '../../utils/helpers'

export default function Logo({ className = '' }) {
  return (
    <Link
      to="/"
      aria-label="FitOps home"
      className={classNames(
        'heading inline-flex items-baseline uppercase font-bold italic tracking-tight text-white',
        className,
      )}
    >
      FIT<span className="text-accent">OPS</span>
    </Link>
  )
}
