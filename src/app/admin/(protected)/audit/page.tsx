'use client';

import { useQuery } from '@tanstack/react-query';
import { ScrollText, RefreshCw, ShieldAlert } from 'lucide-react';
import { getAuditLogs } from '@/actions/settings';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AdminAuditPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => getAuditLogs(1, 50),
  });

  const logs = data?.logs || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)] text-white">Security Audit Trail</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Immutable record of admin actions, status overrides, and menu updates</p>
        </div>

        <Button onClick={() => refetch()} variant="outline" size="sm" className="border-white/10 text-xs">
          <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh Logs
        </Button>
      </div>

      {/* Audit Log Table */}
      <div className="glass-card overflow-hidden border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-white/5">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-muted-foreground">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center"><RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" /> Loading audit trail...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">No audit logs recorded yet.</td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 whitespace-nowrap font-mono text-[11px] text-muted-foreground">{formatDate(log.created_at)}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-white/5 border-white/10 font-mono text-[10px] text-orange-400">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="p-4 text-white font-mono text-[11px]">
                      {log.entity} {log.entity_id ? `(${log.entity_id.slice(0, 8)}...)` : ''}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-muted-foreground/80 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
