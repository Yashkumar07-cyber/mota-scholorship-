import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  History
} from 'lucide-react';

interface AuditLog {
  id: string;
  userId?: string | null;
  userRole?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: {
    email?: string | null;
    mobile?: string | null;
    role: string;
  } | null;
}

export const AdminAuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase()) ||
      (log.entityId && log.entityId.toLowerCase().includes(search.toLowerCase())) ||
      (log.user?.email && log.user.email.toLowerCase().includes(search.toLowerCase()));

    const matchesEntity = entityFilter === 'ALL' || log.entity === entityFilter;

    return matchesSearch && matchesEntity;
  });

  const entities = Array.from(new Set(logs.map(l => l.entity)));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-card border border-mota-border shadow-gov">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Immutable Audit Trail
            </span>
            <span className="text-xs text-mota-muted">MoTA IT Security & Compliance Guideline 2026</span>
          </div>
          <h1 className="text-2xl font-bold text-mota-charcoal mt-1">System Audit & Action Logs</h1>
          <p className="text-sm text-mota-muted mt-1 max-w-2xl">
            Complete, tamper-evident chronological log of all officer review actions, sanction orders,
            document updates, and DBT disbursement requests.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-mota-border hover:bg-slate-50 text-mota-charcoal text-sm font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
        >
          <RefreshCw className={`w-4 h-4 text-mota-forest ${loading ? 'animate-spin' : ''}`} />
          Refresh Audit Trail
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-card border border-mota-border shadow-gov flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-mota-muted" />
          <input
            type="text"
            placeholder="Search action, officer, entity ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-mota-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mota-forest"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-mota-muted" />
          <span className="text-xs text-mota-muted">Entity:</span>
          <select
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
            className="text-xs border border-mota-border rounded-lg px-2.5 py-1.5 bg-white text-mota-charcoal focus:outline-none focus:ring-1 focus:ring-mota-forest"
          >
            <option value="ALL">All Entities</option>
            {entities.map(e => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-card border border-mota-border shadow-gov overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-mota-muted">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-mota-forest" />
            <p className="text-sm">Retrieving audit entries...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-mota-muted">
            <History className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-base font-semibold text-mota-charcoal">No audit records found</p>
            <p className="text-xs text-mota-muted mt-1">Actions taken by officers will appear in this log immediately.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-mota-muted border-b border-mota-border uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Actor / Officer</th>
                  <th className="px-4 py-3 text-right">Payload & Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mota-border">
                {filtered.map(log => {
                  const isExpanded = expandedLogId === log.id;
                  const date = new Date(log.createdAt);

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-mota-muted font-mono">
                          <div className="text-mota-charcoal font-medium">
                            {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                          <div>{date.toLocaleTimeString('en-IN')}</div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`font-mono px-2 py-0.5 rounded text-[11px] font-semibold ${
                              log.action.includes('APPROVE')
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.action.includes('REJECT')
                                ? 'bg-red-100 text-red-800'
                                : log.action.includes('CORRECTION')
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-semibold text-mota-charcoal">{log.entity}</span>
                          {log.entityId && (
                            <span className="block text-[11px] font-mono text-mota-muted">
                              ID: {log.entityId.slice(0, 14)}...
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-mota-forest" />
                            <span className="font-medium text-mota-charcoal">
                              {log.user?.email || log.user?.mobile || 'System / Officer'}
                            </span>
                          </div>
                          <span className="text-[10px] text-mota-muted uppercase ml-5">
                            {log.userRole || 'ADMIN'}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {(log.oldValue || log.newValue) ? (
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-mota-forest hover:text-mota-forestDark"
                            >
                              <span>{isExpanded ? 'Hide Payload' : 'View Payload'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          ) : (
                            <span className="text-mota-muted italic text-[11px]">No payload</span>
                          )}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-50">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[11px]">
                              {log.oldValue && (
                                <div className="p-3 bg-red-50/60 border border-red-200 rounded-lg">
                                  <div className="text-red-700 font-bold mb-1 uppercase tracking-wider text-[10px]">
                                    Previous State (Old Value)
                                  </div>
                                  <pre className="overflow-x-auto whitespace-pre-wrap text-red-950">
                                    {tryFormatJson(log.oldValue)}
                                  </pre>
                                </div>
                              )}

                              {log.newValue && (
                                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                                  <div className="text-emerald-700 font-bold mb-1 uppercase tracking-wider text-[10px]">
                                    Updated State (New Value)
                                  </div>
                                  <pre className="overflow-x-auto whitespace-pre-wrap text-emerald-950">
                                    {tryFormatJson(log.newValue)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

function tryFormatJson(val: string) {
  try {
    return JSON.stringify(JSON.parse(val), null, 2);
  } catch {
    return val;
  }
}

export default AdminAuditLogPage;
