'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ADMIN_NAV_ITEMS } from '@/lib/constants';
import { signOut } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  Coffee,
  CreditCard,
  ChefHat,
  FileBarChart,
  Settings,
  ScrollText,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

const iconMap = {
  'layout-dashboard': LayoutDashboard,
  'shopping-bag': ShoppingBag,
  'utensils': Utensils,
  'coffee': Coffee,
  'credit-card': CreditCard,
  'chef-hat': ChefHat,
  'file-bar-chart': FileBarChart,
  'settings': Settings,
  'scroll-text': ScrollText,
};

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 glass border-r border-white/10 flex flex-col justify-between hidden md:flex h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div>
            <h2 className="font-bold text-xs text-white leading-tight">Project Cheesecake</h2>
            <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
              Senior Sleepover 2026
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap] || LayoutDashboard;
            const isActive = pathname === item.path || (item.path !== '/admin/dashboard' && pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all',
                  isActive
                    ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20 shadow-sm'
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? 'text-orange-400' : 'text-muted-foreground')} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </form>
      </div>
    </aside>
  );
}
