import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRequest, getClient, getVoicebots, getTicket } from '@/lib/data';
import { generateFromRequest } from '@/lib/request-ticket';
import { RequestTicketEditor } from '@/components/requests/RequestTicketEditor';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { MessageSquareText, TicketCheck } from 'lucide-react';

type Props = { params: Promise<{ requestId: string }> };

export default async function RequestDetailPage({ params }: Props) {
  const { requestId } = await params;

  const request = getRequest(requestId);
  if (!request) notFound();

  const client      = getClient(request.clientId);
  const voicebots   = getVoicebots(request.clientId);
  const linkedTicket = request.engineeringTicketId
    ? getTicket(request.engineeringTicketId)
    : undefined;

  // Use the primary (first) voicebot name for context
  const voicebotName = voicebots[0]?.name ?? 'voicebot';

  const draft = generateFromRequest(
    request,
    client?.name ?? request.clientId,
    voicebotName,
    linkedTicket,
  );

  return (
    <div className="px-6 py-6 space-y-5 max-w-5xl">

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Portfolio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/requests" />}>Requests</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-mono">{requestId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-base font-semibold text-foreground">
              {client?.name ?? request.clientId}
            </h1>
            <span className="font-mono text-sm text-muted-foreground">{requestId}</span>
            {linkedTicket ? (
              <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/25">
                {linkedTicket.id}
              </Badge>
            ) : (
              <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/25">
                Awaiting ticket
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Submitted {new Date(request.submittedAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
            {client && (
              <> · <Link href={`/clients/${client.id}`} className="hover:underline underline-offset-2">{client.industry}</Link></>
            )}
          </p>
        </div>
      </div>

      {/* Raw request */}
      <Card>
        <CardContent className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquareText className="size-3.5 text-muted-foreground" />
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Client Request
            </h2>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{request.rawRequest}</p>
        </CardContent>
      </Card>

      <Separator />

      {/* Engineering ticket section */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <TicketCheck className="size-3.5 text-muted-foreground" />
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Engineering Ticket
          </h2>
          {linkedTicket && (
            <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/25 ml-1">
              Existing — {linkedTicket.id}
            </Badge>
          )}
        </div>

        <RequestTicketEditor
          draft={draft}
          sourceLabel={
            linkedTicket
              ? `Pre-filled from existing ticket ${linkedTicket.id}`
              : `Generated from ${requestId} · ${client?.name}`
          }
        />
      </div>

    </div>
  );
}
