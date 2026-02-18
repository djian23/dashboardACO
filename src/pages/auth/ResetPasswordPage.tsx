import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function ResetPasswordPage() {
  const { t } = useTranslation('auth')
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError(t('resetPassword.errors.passwordMin'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('resetPassword.errors.passwordMismatch'))
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await updatePassword(password)
      if (updateError) {
        setError(updateError.message)
      } else {
        navigate('/login', { replace: true })
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
          <CardDescription>{t('resetPassword.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">{t('resetPassword.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('resetPassword.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('resetPassword.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7c3aed] hover:bg-[#7c3aed]/90"
            >
              {loading ? t('resetPassword.loading') : t('resetPassword.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
