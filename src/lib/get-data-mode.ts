import { cookies } from 'next/headers';

export type DataMode = 'mock' | 'challenge';

/** Reads the data mode from the dev cookie. Server-side only. Defaults to 'mock'. */
export async function getDataMode(): Promise<DataMode> {
  const c = await cookies();
  return c.get('dataMode')?.value === 'challenge' ? 'challenge' : 'mock';
}
