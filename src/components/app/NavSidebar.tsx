'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Phone, TicketCheck, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DevModeSwitcher } from '@/components/dev/DevModeSwitcher';

const NAV = [
  { label: 'Portfolio',   href: '/',           icon: LayoutDashboard, soon: false },
  { label: 'QA Review',   href: '/qa',         icon: Phone,           soon: false },
  { label: 'Requests',    href: '/requests',   icon: TicketCheck,     soon: false },
  { label: 'Compliance',  href: '/compliance', icon: ShieldCheck,     soon: false },
] as const;

export function NavSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[216px] shrink-0 flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="size-6 rounded-sm bg-primary flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-white leading-none">D</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground leading-none tracking-tight">Domu</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 tracking-wide">Technical Operations</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-px">
        {NAV.map(({ label, href, icon: Icon, soon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-primary/[0.08] text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground',
                soon && 'pointer-events-none opacity-35',
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {label}
              {soon && (
                <span className="ml-auto text-[10px] tracking-wider uppercase text-muted-foreground/40">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground/30 font-mono">v0.1.0 · demo</p>
      </div>

      <DevModeSwitcher />
    </aside>
  );
}
