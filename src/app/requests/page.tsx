import Link from 'next/link';
import { getRequests, getClients, getClient, getTickets } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ArrowRight } from 'lucide-react';

export default async function RequestsPage() {
  const clients  = getClients();
  const requests = getRequests();

  const withTicket    = requests.filter((r) => r.engineeringTicketId).length;
  const withoutTicket = requests.filter((r) => !r.engineeringTicketId).length;

  return (
    <div className="px-6 py-6 space-y-5">

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Portfolio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Requests</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-foreground">Client Requests</h1>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <span>{requests.length} total requests</span>
            {withTicket    > 0 && <span className="text-blue-400 font-medium">{withTicket} with ticket</span>}
            {withoutTicket > 0 && <span className="text-amber-400 font-medium">{withoutTicket} awaiting ticket</span>}
          </div>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[140px]">Request ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Request</TableHead>
              <TableHead className="w-[100px]">Submitted</TableHead>
              <TableHead className="w-[130px]">Ticket</TableHead>
              <TableHead className="w-[36px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => {
              const client = getClient(req.clientId);
              return (
                <TableRow key={req.id} className="group cursor-pointer">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {req.id}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/clients/${req.clientId}`}
                      className="text-sm hover:underline underline-offset-2"
                    >
                      {client?.name ?? req.clientId}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-0 w-full">
                    <Link href={`/requests/${req.id}`} className="block">
                      <p className="text-sm text-foreground group-hover:underline underline-offset-2 truncate">
                        {req.rawRequest}
                      </p>
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {new Date(req.submittedAt).toLocaleDateString('en-CA')}
                  </TableCell>
                  <TableCell>
                    {req.engineeringTicketId ? (
                      <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/25 font-mono">
                        {req.engineeringTicketId}
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/25">
                        Generate ticket
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/requests/${req.id}`}
                      className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors"
                    >
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

    </div>
  );
}
