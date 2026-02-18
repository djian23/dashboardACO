import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  const { t } = useTranslation('common')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f0f0f] px-4 text-center">
      <h1 className="text-6xl font-bold text-[#7c3aed]">404</h1>
      <p className="mt-4 text-xl text-foreground">{t('notFound.title')}</p>
      <p className="mt-2 text-muted-foreground">{t('notFound.description')}</p>
      <Button asChild className="mt-8 bg-[#7c3aed] hover:bg-[#7c3aed]/90">
        <Link to="/dashboard">{t('notFound.backToDashboard')}</Link>
      </Button>
    </div>
  )
}
