import { useTranslation } from 'react-i18next'
import { Moon, Sun, Globe } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useSettings, useUpdateSettings } from '@/hooks/useSettings'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function GeneralSettings() {
  const { t, i18n } = useTranslation('settings')
  const { theme, setTheme } = useTheme()
  const { data: settings } = useSettings()
  const { data: profile } = useProfile()
  const updateSettings = useUpdateSettings()
  const updateProfile = useUpdateProfile()

  const handleLanguageChange = (lang: 'fr' | 'en') => {
    i18n.changeLanguage(lang)
    updateProfile.mutate({ language: lang })
  }

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme)
    updateProfile.mutate({ theme: newTheme })
  }

  const handleDateFormatChange = (format: string) => {
    updateSettings.mutate({ date_format: format })
  }

  const handleCurrencyChange = (currency: string) => {
    updateSettings.mutate({ default_currency: currency })
  }

  return (
    <div className="space-y-6">
      {/* Language */}
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#7c3aed]" />
            {t('language')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Button
              variant={
                (profile?.language ?? i18n.language) === 'fr'
                  ? 'default'
                  : 'outline'
              }
              size="sm"
              onClick={() => handleLanguageChange('fr')}
              className={
                (profile?.language ?? i18n.language) === 'fr'
                  ? 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white'
                  : 'border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]'
              }
            >
              FR
            </Button>
            <Button
              variant={
                (profile?.language ?? i18n.language) === 'en'
                  ? 'default'
                  : 'outline'
              }
              size="sm"
              onClick={() => handleLanguageChange('en')}
              className={
                (profile?.language ?? i18n.language) === 'en'
                  ? 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white'
                  : 'border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]'
              }
            >
              EN
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base flex items-center gap-2">
            {theme === 'dark' ? (
              <Moon className="h-4 w-4 text-[#7c3aed]" />
            ) : (
              <Sun className="h-4 w-4 text-[#7c3aed]" />
            )}
            {t('theme')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleThemeChange('dark')}
              className={
                theme === 'dark'
                  ? 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white'
                  : 'border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]'
              }
            >
              <Moon className="h-4 w-4 mr-1" />
              {t('dark')}
            </Button>
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleThemeChange('light')}
              className={
                theme === 'light'
                  ? 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white'
                  : 'border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]'
              }
            >
              <Sun className="h-4 w-4 mr-1" />
              {t('light')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Date format */}
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">
            {t('dateFormat')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={settings?.date_format ?? 'DD/MM/YYYY'}
            onValueChange={handleDateFormatChange}
          >
            <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] text-white w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Default currency */}
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">
            {t('defaultCurrency')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={settings?.default_currency ?? 'EUR'}
            onValueChange={handleCurrencyChange}
          >
            <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] text-white w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="CHF">CHF</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  )
}
