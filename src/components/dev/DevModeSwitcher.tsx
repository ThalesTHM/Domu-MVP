'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type DataMode = 'mock' | 'challenge';

function readCookieMode(): DataMode {
  if (typeof document === 'undefined') return 'mock';
  const m = document.cookie.match(/(?:^|;\s*)dataMode=([^;]+)/);
  return m?.[1] === 'challenge' ? 'challenge' : 'mock';
}

export function DevModeSwitcher() {
  const [mode, setMode] = useState<DataMode>('mock');
  const router = useRouter();

  useEffect(() => {
    setMode(readCookieMode());
  }, []);

  function handleChange(next: DataMode) {
    document.cookie = `dataMode=${next}; path=/; max-age=86400; SameSite=Lax`;
    setMode(next);
    // router.refresh() re-renders server components with the updated cookie
    if (next === 'challenge') {
      router.push('/qa?client=client-challenge');
    } else {
      router.push('/');
    }
    router.refresh();
  }

  return (
    <div className="px-3 pt-1.5 pb-3 border-t border-sidebar-border">
      <p className="text-[9px] text-muted-foreground/35 uppercase tracking-widest font-semibold mb-1.5 select-none">
        Dev
      </p>
      <select
        value={mode}
        onChange={(e) => handleChange(e.target.value as DataMode)}
        className={cn(
          'w-full text-[11px] rounded-sm px-2 py-1.5 cursor-pointer border focus:outline-none transition-colors',
          mode === 'challenge'
            ? 'bg-amber-500/8 border-amber-500/25 text-amber-400'
            : 'bg-transparent border-sidebar-border text-muted-foreground/60 hover:text-muted-foreground hover:border-border',
        )}
      >
        <option value="mock">Mock Data</option>
        <option value="challenge">Challenge Data</option>
      </select>
    </div>
  );
}
