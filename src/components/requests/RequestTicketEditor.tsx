'use client';

import { useState } from 'react';
import { Check, Copy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { FullTicketDraft } from '@/lib/request-ticket';

interface Props {
  draft: FullTicketDraft;
  sourceLabel?: string;
}

const FIELD_CLS =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ' +
  'placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none leading-relaxed';

const LABEL_CLS = 'text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5';
const HINT_CLS  = 'text-xs text-muted-foreground/50 mb-1.5';

function formatMarkdown(d: {
  title: string; priority: string; context: string; userStory: string;
  ac: string; deps: string; oqs: string; observability: string;
}): string {
  const list = (s: string) =>
    s.split('\n').filter(Boolean).map((l) => `- ${l.trimStart().replace(/^[-*]\s*/, '')}`).join('\n');
  return `# ${d.title}

**Priority:** ${d.priority}

## Context
${d.context}

## User Story
${d.userStory}

## Acceptance Criteria
${list(d.ac)}

## Dependencies
${list(d.deps)}

## Open Questions
${list(d.oqs)}

## Observability / Metrics
${d.observability}
`;
}

export function RequestTicketEditor({ draft, sourceLabel }: Props) {
  const [title,       setTitle]       = useState(draft.title);
  const [priority,    setPriority]    = useState(draft.priority);
  const [context,     setContext]     = useState(draft.context);
  const [userStory,   setUserStory]   = useState(draft.userStory);
  const [acText,      setAcText]      = useState(draft.acceptanceCriteria.join('\n'));
  const [depsText,    setDepsText]    = useState(draft.dependencies.join('\n'));
  const [oqText,      setOqText]      = useState(draft.openQuestions.join('\n'));
  const [observ,      setObserv]      = useState(draft.observability);
  const [copied,      setCopied]      = useState(false);

  function reset() {
    setTitle(draft.title);
    setPriority(draft.priority);
    setContext(draft.context);
    setUserStory(draft.userStory);
    setAcText(draft.acceptanceCriteria.join('\n'));
    setDepsText(draft.dependencies.join('\n'));
    setOqText(draft.openQuestions.join('\n'));
    setObserv(draft.observability);
  }

  function copyMarkdown() {
    const md = formatMarkdown({
      title, priority, context, userStory,
      ac: acText, deps: depsText, oqs: oqText, observability: observ,
    });
    navigator.clipboard.writeText(md).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          {sourceLabel && <p className="text-xs text-muted-foreground">{sourceLabel}</p>}
          <p className="text-xs text-muted-foreground/40 mt-0.5">
            Demo environment — edits are not persisted
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5">
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={copyMarkdown} className="gap-1.5">
            {copied
              ? <Check className="size-3.5 text-emerald-400" />
              : <Copy className="size-3.5" />}
            {copied ? 'Copied!' : 'Copy Ticket'}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Title + Priority */}
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3">
          <label className={LABEL_CLS}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={FIELD_CLS}
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as FullTicketDraft['priority'])}
            className={FIELD_CLS + ' cursor-pointer'}
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className={LABEL_CLS}>Context</label>
        <textarea value={context} onChange={(e) => setContext(e.target.value)} rows={5} className={FIELD_CLS} />
      </div>

      {/* User Story */}
      <div>
        <label className={LABEL_CLS}>User Story</label>
        <textarea value={userStory} onChange={(e) => setUserStory(e.target.value)} rows={3} className={FIELD_CLS} />
      </div>

      {/* Acceptance Criteria */}
      <div>
        <label className={LABEL_CLS}>Acceptance Criteria</label>
        <p className={HINT_CLS}>One criterion per line</p>
        <textarea value={acText} onChange={(e) => setAcText(e.target.value)} rows={acText.split('\n').length + 1} className={FIELD_CLS} />
      </div>

      {/* Dependencies */}
      <div>
        <label className={LABEL_CLS}>Dependencies</label>
        <p className={HINT_CLS}>One dependency per line</p>
        <textarea value={depsText} onChange={(e) => setDepsText(e.target.value)} rows={depsText.split('\n').length + 1} className={FIELD_CLS} />
      </div>

      {/* Open Questions */}
      <div>
        <label className={LABEL_CLS}>Open Questions</label>
        <p className={HINT_CLS}>
          Identify ambiguities — do not invent answers. One question per line.
        </p>
        <textarea value={oqText} onChange={(e) => setOqText(e.target.value)} rows={oqText.split('\n').length + 1} className={FIELD_CLS} />
      </div>

      {/* Observability */}
      <div>
        <label className={LABEL_CLS}>Observability / Metrics</label>
        <textarea value={observ} onChange={(e) => setObserv(e.target.value)} rows={observ.split('\n').length + 1} className={FIELD_CLS} />
      </div>
    </div>
  );
}
