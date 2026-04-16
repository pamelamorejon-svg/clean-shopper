import { useState } from 'react'
import InputField from '../../components/InputField'
import Button from '../../components/Button'
import { signUp } from '../../lib/api/auth'

export default function SignUpPage({ onNavigateToSignIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  function validate() {
    const next = {}
    if (!email.trim()) next.email = 'Email is required.'
    if (!password) next.password = 'Password is required.'
    else if (password.length < 6) next.password = 'Password must be at least 6 characters.'
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return }

    setErrors({})
    setIsLoading(true)
    try {
      await signUp(email.trim(), password)
      setSuccessMessage('Check your email for a confirmation link before signing in.')
    } catch (err) {
      setErrors({ form: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-space-lg">
      <div className="w-full max-w-sm flex flex-col gap-space-xl">

        {/* Wordmark */}
        <div className="text-center">
          <span className="text-h2 font-cormorant text-neutral-900 tracking-wide">
            Clean Shopper
          </span>
          <p className="text-body font-jost text-neutral-600 mt-space-sm">
            Create your account
          </p>
        </div>

        {/* Form card */}
        <div className="bg-secondary-cream rounded-radius-lg shadow-sm p-space-lg flex flex-col gap-space-lg">

          {successMessage ? (
            <p className="text-body font-jost text-success text-center">{successMessage}</p>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-space-lg">
              {errors.form && (
                <p className="text-micro font-jost text-error">{errors.form}</p>
              )}
              <InputField
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                error={errors.email}
                required
                disabled={isLoading}
              />
              <InputField
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="At least 6 characters"
                error={errors.password}
                required
                disabled={isLoading}
              />
              <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
                Create account
              </Button>
            </form>
          )}

        </div>

        {/* Sign in link */}
        <p className="text-center text-small font-jost text-neutral-600">
          Already have an account?{' '}
          <button
            onClick={onNavigateToSignIn}
            className="text-accent hover:text-accent-light transition-colors duration-150 focus:outline-none"
          >
            Sign in
          </button>
        </p>

      </div>
    </div>
  )
}
