import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const { t } = useTranslation('auth')
  const { resetPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const { error: resetError } = await resetPassword(email)
      if (resetError) {
        setError(resetError.message)
      } else {
        setSuccess(true)
      }
    } catch {
      setError(t('errors.unexpected'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4">
      <Card className="w-full max-w-md border-[#2a2a2a] bg-[#1a1a1a]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            <span className="text-[#7c3aed]">Dashboard</span>
            <span className="text-foreground">ACO</span>
          </CardTitle>
          <CardDescription>{t('forgotPassword.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-400">
                {t('forgotPassword.success')}
              </div>
              <Link
                to="/login"
                className="block text-center text-sm text-[#7c3aed] hover:underline"
              >
                {t('forgotPassword.backToLogin')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t('forgotPassword.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('forgotPassword.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-[#2a2a2a] bg-[#0f0f0f]"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#7c3aed] hover:bg-[#7c3aed]/90"
              >
                {loading ? t('forgotPassword.loading') : t('forgotPassword.submit')}
              </Button>

              <Link
                to="/login"
                className="block text-center text-sm text-[#7c3aed] hover:underline"
              >
                {t('forgotPassword.backToLogin')}
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
