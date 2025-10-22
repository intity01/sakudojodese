import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();

  const mainNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/' },
    { id: 'learn', label: 'Learn', icon: '📚', path: '/learn' },
    { id: 'progress', label: 'Progress', icon: '📈', path: '/progress' },
    { id: 'tasks', label: 'Tasks', icon: '📝', path: '/tasks', badge: 3 },
    { id: 'schedule', label: 'Schedule', icon: '📅', path: '/schedule' },
  ];

  const bottomNav: NavItem[] = [
    { id: 'chat', label: 'Chat', icon: '💬', path: '/chat', badge: 2 },
    { id: 'notes', label: 'Notes', icon: '📓', path: '/notes', badge: 3 },
  ];

  const footerNav: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
    { id: 'logout', label: 'Log out', icon: '🚪', path: '/logout' },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden md:flex w-52 bg-white border-r border-slate-200 flex-col p-3 shadow-sm">
        {/* Logo */}
        <div className="mb-8 px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-lg">
              🎌
            </div>
            <span className="font-bold text-slate-900">EduWay</span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 flex flex-col gap-1">
          {mainNav.map((item) => (
            <Link key={item.id} href={item.path}>
              <a
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  location === item.path
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </a>
            </Link>
          ))}

          {/* Bottom Nav */}
          <div className="mt-auto pt-3 border-t border-slate-200 flex flex-col gap-1">
            {bottomNav.map((item) => (
              <Link key={item.id} href={item.path}>
                <a
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    location === item.path
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                </a>
              </Link>
            ))}
          </div>

          {/* Footer Nav */}
          <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col gap-1">
            {footerNav.map((item) => (
              <Link key={item.id} href={item.path}>
                <a
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    location === item.path
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                </a>
              </Link>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 shadow-lg z-50">
        <div className="flex items-center justify-around">
          <Link href="/">
            <a className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${location === '/' ? 'text-indigo-600' : 'text-slate-600'}`}>
              <span className="text-xl">📊</span>
              <span className="text-xs font-medium">Home</span>
            </a>
          </Link>
          <Link href="/learn">
            <a className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${location === '/learn' ? 'text-indigo-600' : 'text-slate-600'}`}>
              <span className="text-xl">📚</span>
              <span className="text-xs font-medium">Learn</span>
            </a>
          </Link>
          <Link href="/progress">
            <a className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${location === '/progress' ? 'text-indigo-600' : 'text-slate-600'}`}>
              <span className="text-xl">📈</span>
              <span className="text-xs font-medium">Progress</span>
            </a>
          </Link>
          <Link href="/achievements">
            <a className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${location === '/achievements' ? 'text-indigo-600' : 'text-slate-600'}`}>
              <span className="text-xl">🏆</span>
              <span className="text-xs font-medium">Rewards</span>
            </a>
          </Link>
        </div>
      </nav>
    </div>
  );
}

