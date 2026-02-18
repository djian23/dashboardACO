import { Outlet } from 'react-router-dom'
import { useSidebar } from '@/contexts/SidebarContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { Sheet, SheetContent } from '@/components/ui/sheet'

export function AppLayout() {
  const { mobileOpen, setMobileOpen } = useSidebar()

  return (
    <div className="flex h-screen bg-[#0f0f0f]">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar (sheet overlay) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[256px] border-[#2a2a2a] bg-[#0f0f0f] p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
