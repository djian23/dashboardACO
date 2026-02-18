import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const TAX_REGIMES = [
  'auto-entrepreneur',
  'micro-entreprise',
  'sarl',
  'sas',
  'other',
] as const

export function BusinessSettings() {
  const { t } = useTranslation('settings')
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()

  const [formData, setFormData] = useState({
    business_name: '',
    business_address: '',
    business_siret: '',
    tax_regime: 'auto-entrepreneur',
    tax_rate: 0,
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        business_name: profile.business_name ?? '',
        business_address: profile.business_address ?? '',
        business_siret: profile.business_siret ?? '',
        tax_regime: profile.tax_regime ?? 'auto-entrepreneur',
        tax_rate: profile.tax_rate ?? 0,
      })
    }
  }, [profile])

  const handleSave = () => {
    updateProfile.mutate({
      business_name: formData.business_name || null,
      business_address: formData.business_address || null,
      business_siret: formData.business_siret || null,
      tax_regime: formData.tax_regime || null,
      tax_rate: formData.tax_rate,
    })
  }

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
      <CardHeader>
        <CardTitle className="text-white text-base">
          {t('businessInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="business_name" className="text-gray-300">
            {t('businessName')}
          </Label>
          <Input
            id="business_name"
            value={formData.business_name}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                business_name: e.target.value,
              }))
            }
            className="bg-[#0f0f0f] border-[#2a2a2a] text-white max-w-md"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_address" className="text-gray-300">
            {t('businessAddress')}
          </Label>
          <Input
            id="business_address"
            value={formData.business_address}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                business_address: e.target.value,
              }))
            }
            className="bg-[#0f0f0f] border-[#2a2a2a] text-white max-w-md"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_siret" className="text-gray-300">
            {t('siret')}
          </Label>
          <Input
            id="business_siret"
            value={formData.business_siret}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                business_siret: e.target.value,
              }))
            }
            className="bg-[#0f0f0f] border-[#2a2a2a] text-white max-w-md"
            placeholder="123 456 789 00012"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax_regime" className="text-gray-300">
            {t('taxRegime')}
          </Label>
          <Select
            value={formData.tax_regime}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, tax_regime: value }))
            }
          >
            <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] text-white max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              {TAX_REGIMES.map((regime) => (
                <SelectItem key={regime} value={regime}>
                  {t(`regime_${regime}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax_rate" className="text-gray-300">
            {t('taxRate')}
          </Label>
          <div className="relative max-w-[200px]">
            <Input
              id="tax_rate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.tax_rate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  tax_rate: parseFloat(e.target.value) || 0,
                }))
              }
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              %
            </span>
          </div>
        </div>

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
