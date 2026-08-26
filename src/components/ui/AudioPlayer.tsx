'use client';

import { useState } from 'react';

export function AudioPlayer({ src }: { src: string }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <audio
      controls
      src={src}
      className="w-full h-9"
      onError={() => setHidden(true)}
    />
  );
}
