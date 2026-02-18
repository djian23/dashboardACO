import { useTranslation } from 'react-i18next'
import { GeneralSettings } from '@/components/settings/GeneralSettings'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { BusinessSettings } from '@/components/settings/BusinessSettings'
import { NotificationSettings } from '@/components/settings/NotificationSettings'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function SettingsPage() {
  const { t } = useTranslation('settings')

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <p className="text-gray-400 mt-1">{t('subtitle')}</p>
      </div>

      {/* Tabbed layout */}
      <Tabs defaultValue="general">
        <TabsList className="bg-[#1a1a1a] border border-[#2a2a2a]">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-[#7c3aed] data-[state=active]:text-white text-gray-400"
          >
            {t('tabGeneral')}
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-[#7c3aed] data-[state=active]:text-white text-gray-400"
          >
            {t('tabProfile')}
          </TabsTrigger>
          <TabsTrigger
            value="business"
            className="data-[state=active]:bg-[#7c3aed] data-[state=active]:text-white text-gray-400"
          >
            {t('tabBusiness')}
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-[#7c3aed] data-[state=active]:text-white text-gray-400"
          >
            {t('tabNotifications')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="business" className="mt-6">
          <BusinessSettings />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
