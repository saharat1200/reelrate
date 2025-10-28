'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useParams } from 'next/navigation'
import { Film, Tv, Star, User } from 'lucide-react'

export function BottomNavigation() {
  const pathname = usePathname()
  const params = useParams()
  const locale = params.locale as string

  const navItems = [
    {
      name: 'หนัง',
      href: `/${locale}/movies`,
      icon: Film,
      active: pathname.includes('/movies')
    },
    {
      name: 'อนิเมะ',
      href: `/${locale}/anime`,
      icon: Tv,
      active: pathname.includes('/anime')
    },
    {
      name: 'ยอดนิยม',
      href: `/${locale}/top-rated`,
      icon: Star,
      active: pathname.includes('/top-rated')
    },
    {
      name: 'โปรไฟล์',
      href: `/${locale}/profile`,
      icon: User,
      active: pathname.includes('/profile')
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 md:hidden">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-1 min-w-0 flex-1 text-xs transition-colors ${
                item.active
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <Icon 
                className={`w-4 h-4 mb-1 ${
                  item.active && "text-blue-600 dark:text-blue-400"
                }`} 
              />
              <span className="truncate text-xs leading-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}