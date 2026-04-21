'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isAuthenticated, clearAuth } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated()) router.push('/login');
  }, [router]);

  function logout() {
    clearAuth();
    router.push('/login');
  }

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: '📊' },
    { href: '/dashboard/products', label: 'Products', icon: '🍔' },
    { href: '/dashboard/layout', label: 'Layout Builder', icon: '🎨' },
  ];

  return (
    <div className="flex h-screen bg-gray-950">
      <aside className="w-64 glass border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="text-2xl font-bold text-white">🍔 SignageOS</div>
          <div className="text-xs text-gray-400 mt-1">Restaurant Admin</div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                pathname === item.href
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
