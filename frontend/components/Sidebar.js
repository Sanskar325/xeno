import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ChartBarIcon,
  CubeIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartPieIcon,
  ArrowPathIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: '📦', heroIcon: ChartBarIcon },
  { name: 'Products', href: '/dashboard/products', icon: '🧾', heroIcon: CubeIcon },
  { name: 'Orders', href: '/dashboard/orders', icon: '📋', heroIcon: DocumentTextIcon },
  { name: 'Customers', href: '/dashboard/customers', icon: '👥', heroIcon: UsersIcon },
  { name: 'Analytics / Reports', href: '/dashboard/analytics', icon: '📊', heroIcon: ChartPieIcon },
  // Sync page removed from UI; syncing remains available via backend API/importer
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const router = useRouter();

  const isActive = (href) => {
    if (href === '/dashboard') {
      return router.pathname === '/dashboard';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent navigation={navigation} isActive={isActive} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <SidebarContent navigation={navigation} isActive={isActive} />
        </div>
      </div>
    </>
  );
}

function SidebarContent({ navigation, isActive }) {
  return (
    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
      <div className="flex items-center flex-shrink-0 px-4">
        <h1 className="text-xl font-bold text-gray-900">Shopify Insights</h1>
      </div>
      <nav className="mt-8 flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150
                ${active
                  ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span className="flex-1">{item.name}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}