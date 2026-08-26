'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Phone, TicketCheck, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Portfolio',   href: '/',           icon: LayoutDashboard, soon: false },
  { label: 'QA Review',   href: '/qa',         icon: Phone,           soon: true  },
  { label: 'Requests',    href: '/requests',   icon: TicketCheck,     soon: true  },
  { label: 'Compliance',  href: '/compliance', icon: ShieldCheck,     soon: true  },
] as const;

export function NavSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[216px] shrink-0 flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="px-4 py-4 border-b border-sidebar-border">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-0.5">
          Domu Technology
        </p>
        <p className="text-sm font-semibold text-sidebar-foreground leading-tight">
          Technical Operations
        </p>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-px">
        {NAV.map(({ label, href, icon: Icon, soon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                soon && 'pointer-events-none opacity-40',
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {label}
              {soon && (
                <span className="ml-auto text-[10px] tracking-wider uppercase text-muted-foreground/50">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground/40 font-mono">v0.1.0-demo</p>
      </div>
    </aside>
  );
}
