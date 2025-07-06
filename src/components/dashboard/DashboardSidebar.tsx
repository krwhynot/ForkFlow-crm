import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import {
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Organizations', href: '/dashboard/organizations', icon: BuildingOfficeIcon },
  { name: 'Contacts', href: '/dashboard/contacts', icon: UserGroupIcon },
  { name: 'Interactions', href: '/dashboard/interactions', icon: ChatBubbleLeftRightIcon },
  { name: 'Reports', href: '/dashboard/reports', icon: ChartBarIcon },
]

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6">
            <div className="text-white font-semibold">ForkFlow CRM</div>
            <button
              onClick={onClose}
              className="md:hidden text-white hover:bg-gray-800 p-2 rounded-md"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        'flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors',
                        'min-h-[48px]', // Touch optimization
                        isActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      )}
                      onClick={onClose}
                    >
                      <item.icon className="mr-3 h-6 w-6" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}