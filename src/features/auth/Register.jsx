import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import Button from '../../components/common/Button'
import Logo from '../../components/common/Logo'
import useAuth from '../../hooks/useAuth'
import { getAuthErrorMessage, getRoleRedirectPath, getUserRole, getValidationErrors } from '../../services/authService'

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
      const user = await register({
        name: form.fullName,
        email: form.email,
        password: form.password,
        password_confirmation: form.confirmPassword,
      })

      navigate(getRoleRedirectPath(getUserRole(user)), { replace: true })
    } catch (error) {
      const validationErrors = getValidationErrors(error)

      setErrors({
        ...validationErrors,
        fullName: validationErrors.name,
        confirmPassword: validationErrors.password_confirmation,
      })
      setStatus(getAuthErrorMessage(error, 'Registration failed. Please check your details.'))
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
          Create
          <br />
          <span className="text-accent">account.</span>
        </h1>

        {status && (
          <p className="mt-8 border border-accent/30 bg-accent/10 px-4 py-3 text-sm leading-6 text-accent">
            {status}
          </p>
        )}

        <form className="mt-10 space-y-4" onSubmit={handleSubmit}>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            className="w-full border border-white/20 bg-transparent px-4 py-4 text-white outline-none focus:border-accent"
            type="text"
            placeholder="Full Name"
            autoComplete="name"
          />
          {errors.fullName && <p className="text-sm text-accent">{errors.fullName[0]}</p>}
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-white/20 bg-transparent px-4 py-4 text-white outline-none focus:border-accent"
            type="email"
            placeholder="Email Address"
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
              autoComplete="new-password"
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
          <div className="relative">
            <input
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border border-white/20 bg-transparent px-4 py-4 pr-12 text-white outline-none focus:border-accent"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute inset-y-0 right-3 flex items-center text-white/55 transition hover:text-accent"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-accent">{errors.confirmPassword[0]}</p>}
          <Button type="submit" disabled={submitting} className="mt-4 w-full">
            {submitting ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-white hover:text-accent">
            Login
          </Link>
        </p>

        <Link to="/" className="mt-8 block text-center text-sm text-gray-400 hover:text-accent">
          ← Back Home
        </Link>
      </motion.div>
    </main>
  )
}
