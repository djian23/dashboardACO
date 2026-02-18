import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Calendar,
  Package,
  CalendarDays,
  Wallet,
  Receipt,
  Users,
  Truck,
  CheckSquare,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/contexts/SidebarContext'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'

const navItems = [
  { key: 'dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { key: 'events', icon: Calendar, path: '/events' },
  { key: 'products', icon: Package, path: '/products' },
  { key: 'calendar', icon: CalendarDays, path: '/calendar' },
  { key: 'treasury', icon: Wallet, path: '/treasury' },
  { key: 'accounting', icon: Receipt, path: '/accounting' },
  { key: 'tmAccounts', icon: Users, path: '/tm-accounts' },
  { key: 'parcels', icon: Truck, path: '/parcels' },
  { key: 'todos', icon: CheckSquare, path: '/todos' },
  { key: 'alerts', icon: Bell, path: '/alerts' },
  { key: 'settings', icon: Settings, path: '/settings' },
] as const

export function Sidebar() {
  const { collapsed, toggleCollapsed } = useSidebar()
  const { t } = useTranslation('common')

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex h-screen flex-col border-r border-[#2a2a2a] bg-[#0f0f0f] transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-[256px]'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-[#2a2a2a] px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#7c3aed]">ACO</span>
            {!collapsed && (
              <span className="text-sm font-medium text-muted-foreground">Dashboard</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const label = t(`nav.${item.key}`)

              return (
                <li key={item.key}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            cn(
                              'flex h-10 w-full items-center justify-center rounded-md transition-colors',
                              isActive
                                ? 'bg-[#7c3aed] text-white'
                                : 'text-muted-foreground hover:bg-[#1a1a1a] hover:text-foreground'
                            )
                          }
                        >
                          <Icon className="h-5 w-5" />
                        </NavLink>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="border-[#2a2a2a] bg-[#1a1a1a]">
                        {label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-[#7c3aed] text-white'
                            : 'text-muted-foreground hover:bg-[#1a1a1a] hover:text-foreground'
                        )
                      }
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="truncate">{label}</span>
                    </NavLink>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-[#2a2a2a] p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="w-full text-muted-foreground hover:bg-[#1a1a1a] hover:text-foreground"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
