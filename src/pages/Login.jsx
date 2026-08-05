import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import Button from '../components/common/Button'
import Logo from '../components/common/Logo'
import useAuth from '../hooks/useAuth'
import { getAuthErrorMessage, getRoleRedirectPath, getUserRole, getValidationErrors } from '../services/authService'

const initialForm = {
  email: '',
  password: '',
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: null }))
    setStatus('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setStatus('')

    try {
      const user = await login(form)
      navigate(getRoleRedirectPath(getUserRole(user)), { replace: true })
    } catch (error) {
      setErrors(getValidationErrors(error))
      setStatus(getAuthErrorMessage(error, 'Login failed. Please check your credentials.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Logo className="text-3xl" />
        <h1 className="section-heading mt-12">
          Member
          <br />
          <span className="text-accent">login.</span>
        </h1>
        {status && (
          <p className="mt-8 border border-accent/30 bg-accent/10 px-4 py-3 text-sm leading-6 text-accent">
            {status}
          </p>
        )}
        <form className="mt-10 space-y-4" onSubmit={handleSubmit}>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-white/20 bg-transparent px-4 py-4 text-white outline-none focus:border-accent"
            type="email"
            placeholder="Email address"
            autoComplete="email"
          />
          {errors.email && <p className="text-sm text-accent">{errors.email[0]}</p>}
          <div className="relative">
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-white/20 bg-transparent px-4 py-4 pr-12 text-white outline-none focus:border-accent"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-3 flex items-center text-white/55 transition hover:text-accent"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-accent">{errors.password[0]}</p>}
          <Button type="submit" disabled={submitting} className="mt-4 w-full">
            {submitting ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <p className="mt-8 text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-bold text-white hover:text-accent">
            Register
          </Link>
        </p>
        <Link to="/" className="mt-8 block text-center text-sm text-gray-400 hover:text-accent">
          ← Back home
        </Link>
      </motion.div>
    </main>
  )
}
