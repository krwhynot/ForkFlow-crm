import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { HomepageButton } from '../ui-kit/HomepageButton'
import { HomepageInput } from '../ui-kit/HomepageInput'

interface DashboardHeaderProps {
  onMenuToggle: () => void
}

export function DashboardHeader({ onMenuToggle }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center">
        {/* Mobile menu button */}
        <HomepageButton
          variant="ghost"
          size="sm"
          className="mr-2 md:hidden"
          onClick={onMenuToggle}
        >
          <Bars3Icon className="h-6 w-6" />
        </HomepageButton>
        
        {/* Logo */}
        <div className="mr-4 flex items-center space-x-2">
          <div className="font-bold text-xl text-gray-900">
            ForkFlow CRM
          </div>
        </div>
        
        {/* Search */}
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative max-w-md w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <HomepageInput
              placeholder="Search organizations, contacts..."
              className="pl-10"
              touchOptimized
            />
          </div>
        </div>
        
        {/* User menu */}
        <div className="flex items-center space-x-4">
          <HomepageButton variant="ghost" size="sm">
            <div className="h-8 w-8 rounded-full bg-gray-200" />
          </HomepageButton>
        </div>
      </div>
    </header>
  )
}