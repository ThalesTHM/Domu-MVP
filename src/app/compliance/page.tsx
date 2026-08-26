import Link from 'next/link';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ComplianceChecker } from '@/components/compliance/ComplianceChecker';

export default function CompliancePage() {
  return (
    <div className="px-6 py-6 space-y-5">

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Portfolio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Compliance</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-base font-semibold text-foreground">Calling Compliance</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Verify that a proposed call falls within the permitted calling window for the client's region.
          All decisions are deterministic — no AI involved.
        </p>
      </div>

      <ComplianceChecker />

    </div>
  );
}
