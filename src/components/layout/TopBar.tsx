import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Menu, Globe, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSidebar } from '@/contexts/SidebarContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function TopBar() {
  const { user, signOut } = useAuth()
  const { setMobileOpen } = useSidebar()
  const { t, i18n } = useTranslation('common')

  const currentLang = i18n.language?.startsWith('fr') ? 'fr' : 'en'

  const toggleLanguage = () => {
    const nextLang = currentLang === 'fr' ? 'en' : 'fr'
    i18n.changeLanguage(nextLang)
  }

  const userEmail = user?.email ?? ''
  const userInitials = userEmail
    ? userEmail.substring(0, 2).toUpperCase()
    : '??'

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-[#2a2a2a] bg-[#0f0f0f] px-4">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="text-muted-foreground hover:bg-[#1a1a1a] hover:text-foreground md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="gap-1.5 text-muted-foreground hover:bg-[#1a1a1a] hover:text-foreground"
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase">
            {currentLang === 'fr' ? 'FR' : 'EN'}
          </span>
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#7c3aed] text-xs text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-[#2a2a2a] bg-[#1a1a1a]">
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm text-muted-foreground">{userEmail}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#2a2a2a]" />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t('nav.settings')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#2a2a2a]" />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('signOut')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
