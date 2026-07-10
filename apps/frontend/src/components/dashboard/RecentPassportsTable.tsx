'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePassports } from '@/lib/hooks/usePassports';
import { PassportStatusBadge } from '@/components/passport/PassportStatusBadge';
import { formatDate } from '@/lib/utils';
import { ExternalLink, ChevronRight } from 'lucide-react';

export function RecentPassportsTable() {
  const router = useRouter();
  const { data, isLoading } = usePassports({ limit: 5, sortBy: 'updatedAt', sortOrder: 'desc' });

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/30">
        <h3 className="text-slate-200 font-semibold">Recent Passports</h3>
        <Link
          href="/passports"
          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-colors"
        >
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Passport ID</th>
              <th>Model</th>
              <th>Chemistry</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th className="text-right pr-5">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j}>
                        <div className="skeleton h-4 w-24 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              : data?.data.map((passport) => (
                  <tr
                    key={passport.id}
                    className="cursor-pointer hover:bg-slate-800/10 transition-colors"
                    onClick={() => router.push(`/passports/${passport.id}`)}
                  >
                    <td>
                      <span className="font-mono text-emerald-400 text-xs font-medium">
                        {passport.passportId}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="text-slate-200 font-medium text-sm">{passport.model}</p>
                        <p className="text-slate-500 text-xs">{passport.batteryType}</p>
                      </div>
                    </td>
                    <td>
                      <span className="text-slate-300 text-sm font-medium">{passport.chemistry}</span>
                    </td>
                    <td>
                      <PassportStatusBadge status={passport.status} />
                    </td>
                    <td>
                      <span className="text-slate-400 text-xs">{formatDate(passport.updatedAt)}</span>
                    </td>
                    <td className="text-right pr-5" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/passports/${passport.id}`}
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors text-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && (!data?.data || data.data.length === 0) && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm">No passports yet</p>
            <Link
              href="/passports/new"
              className="text-emerald-400 hover:text-emerald-300 text-sm mt-2 inline-block"
            >
              Create your first passport →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
