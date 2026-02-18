import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Camera, User } from 'lucide-react'
import { useProfile, useUpdateProfile, useUploadAvatar } from '@/hooks/useProfile'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export function ProfileSettings() {
  const { t } = useTranslation('settings')
  const { user } = useAuth()
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '')
    }
  }, [profile])

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadAvatar.mutate(file)
    }
  }

  const handleSave = () => {
    updateProfile.mutate({ full_name: fullName || null })
  }

  const initials = fullName
    ? fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
      <CardHeader>
        <CardTitle className="text-white text-base">{t('profile')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-[#7c3aed] text-white text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-[#7c3aed] hover:bg-[#6d28d9] flex items-center justify-center text-white transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div className="text-sm text-gray-400">
            {uploadAvatar.isPending
              ? t('uploading')
              : t('avatarHelp')}
          </div>
        </div>

        {/* Full name */}
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-gray-300">
            {t('fullName')}
          </Label>
          <Input
            id="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-[#0f0f0f] border-[#2a2a2a] text-white max-w-md"
          />
        </div>

        {/* Email (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300">
            {t('email')}
          </Label>
          <Input
            id="email"
            value={user?.email ?? ''}
            readOnly
            disabled
            className="bg-[#0f0f0f] border-[#2a2a2a] text-gray-500 max-w-md cursor-not-allowed"
          />
          <p className="text-xs text-gray-500">{t('emailReadOnly')}</p>
        </div>

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
        >
          {updateProfile.isPending ? t('saving') : t('save')}
        </Button>
      </CardContent>
    </Card>
  )
}
