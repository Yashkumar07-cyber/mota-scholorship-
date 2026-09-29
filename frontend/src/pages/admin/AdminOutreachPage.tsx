import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { OutreachCandidate } from '../../types';
import {
  Users,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  Clock,
  PhoneCall,
  UserCheck,
  XCircle,
  Database,
  MapPin,
  RefreshCw,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

export const AdminOutreachPage: React.FC = () => {
  const [candidates, setCandidates] = useState<OutreachCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [datasetFilter, setDatasetFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/outreach');
      setCandidates(res.data.candidates || []);
    } catch (err: any) {
      setNotification({ text: err.message || 'Failed to load outreach candidates', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleScan = async () => {
    try {
      setScanning(true);
      const res = await api.post('/admin/outreach/scan');
      setNotification({
        text: res.data.message || 'Demographic matching scan completed successfully.',
        type: 'success',
      });
      fetchCandidates();
    } catch (err: any) {
      setNotification({ text: err.message || 'Scan failed', type: 'error' });
    } finally {
      setScanning(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string, notes?: string) => {
    try {
      setUpdatingId(id);
      await api.post(`/admin/outreach/${id}/status`, { status, notes });
      setNotification({ text: `Candidate updated to ${status.replace('_', ' ')}`, type: 'success' });
      // Update local state
      setCandidates(prev =>
        prev.map(c => (c.id === id ? { ...c, outreachStatus: status as any, notes: notes || c.notes } : c))
      );
    } catch (err: any) {
      setNotification({ text: err.message || 'Update failed', type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter logic
  const filtered = candidates.filter(c => {
    const matchesSearch =
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      c.studentReference.toLowerCase().includes(search.toLowerCase()) ||
      c.district.toLowerCase().includes(search.toLowerCase()) ||
      c.tribeName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.outreachStatus === statusFilter;
    const matchesDataset = datasetFilter === 'ALL' || c.matchedDataset === datasetFilter;

    return matchesSearch && matchesStatus && matchesDataset;
  });

  const stats = {
    total: candidates.length,
    untouched: candidates.filter(c => c.outreachStatus === 'UNTOUCHED').length,
    planned: candidates.filter(c => c.outreachStatus === 'OUTREACH_PLANNED' || c.outreachStatus === 'CONTACTED').length,
    enrolled: candidates.filter(c => c.outreachStatus === 'ENROLLED').length,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-card border border-mota-border shadow-gov">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
              Cross-Dataset AI Matcher
            </span>
            <span className="text-xs text-mota-muted">UDISE+ • APAAR • OTR • Tribal Census</span>
          </div>
          <h1 className="text-2xl font-bold text-mota-charcoal mt-1">Unreached ST Beneficiary Outreach</h1>
          <p className="text-sm text-mota-muted mt-1 max-w-2xl">
            Proactively identifies Scheduled Tribe students enrolled in educational databases (UDISE+, APAAR)
            who have not yet availed their entitled Pre/Post-Matric scholarships.
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-mota-forest hover:bg-mota-forestDark text-white text-sm font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap disabled:opacity-50"
        >
          {scanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Scanning Demographic Datasets...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-300" />
              Run Demographic Cross-Match
            </>
          )}
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-xs font-bold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-card border border-mota-border shadow-gov">
          <div className="flex items-center justify-between text-mota-muted text-xs font-medium uppercase tracking-wider">
            <span>Potential Beneficiaries</span>
            <Users className="w-4 h-4 text-mota-forest" />
          </div>
          <div className="text-2xl font-bold text-mota-charcoal mt-2">{stats.total}</div>
          <div className="text-xs text-mota-muted mt-1">Found across 3 external registries</div>
        </div>

        <div className="bg-white p-4 rounded-card border border-mota-border shadow-gov">
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium uppercase tracking-wider">
            <span>Untouched (Action Needed)</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{stats.untouched}</div>
          <div className="text-xs text-amber-600/80 mt-1">Pending district officer allocation</div>
        </div>

        <div className="bg-white p-4 rounded-card border border-mota-border shadow-gov">
          <div className="flex items-center justify-between text-blue-700 text-xs font-medium uppercase tracking-wider">
            <span>In Outreach Pipeline</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-2">{stats.planned}</div>
          <div className="text-xs text-blue-600/80 mt-1">Contact / camp planned</div>
        </div>

        <div className="bg-white p-4 rounded-card border border-mota-border shadow-gov">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium uppercase tracking-wider">
            <span>Successfully Enrolled</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{stats.enrolled}</div>
          <div className="text-xs text-emerald-600/80 mt-1">Application submitted in portal</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-card border border-mota-border shadow-gov flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-mota-muted" />
          <input
            type="text"
            placeholder="Search candidate, tribe, or district..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-mota-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mota-forest focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-mota-muted">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs border border-mota-border rounded-lg px-2.5 py-1.5 bg-white text-mota-charcoal focus:outline-none focus:ring-1 focus:ring-mota-forest"
          >
            <option value="ALL">All Statuses</option>
            <option value="UNTOUCHED">Untouched</option>
            <option value="OUTREACH_PLANNED">Outreach Planned</option>
            <option value="CONTACTED">Contacted</option>
            <option value="ENROLLED">Enrolled</option>
            <option value="DISMISSED">Dismissed</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-mota-muted ml-2">
            <Database className="w-3.5 h-3.5" />
            <span>Dataset:</span>
          </div>
          <select
            value={datasetFilter}
            onChange={e => setDatasetFilter(e.target.value)}
            className="text-xs border border-mota-border rounded-lg px-2.5 py-1.5 bg-white text-mota-charcoal focus:outline-none focus:ring-1 focus:ring-mota-forest"
          >
            <option value="ALL">All Datasets</option>
            <option value="UDISE+">UDISE+ (Schools)</option>
            <option value="APAAR">APAAR (Higher Ed ID)</option>
            <option value="OTR_INCOMPLETE">OTR Incomplete</option>
          </select>
        </div>
      </div>

      {/* Candidate List / Cards */}
      {loading ? (
        <div className="p-12 text-center text-mota-muted bg-white rounded-card border border-mota-border">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-mota-forest" />
          <p className="text-sm">Loading outreach candidate records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-mota-muted bg-white rounded-card border border-mota-border">
          <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="text-base font-semibold text-mota-charcoal">No candidates match your filters</p>
          <p className="text-xs text-mota-muted mt-1">Try resetting search or filters, or run a demographic cross-match scan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => {
            const isUpdating = updatingId === c.id;

            return (
              <div
                key={c.id}
                className="bg-white rounded-card border border-mota-border shadow-gov p-5 flex flex-col justify-between hover:shadow-gov-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-mota-charcoal text-base">{c.studentName}</h3>
                      <p className="text-xs font-mono text-mota-muted mt-0.5">{c.studentReference}</p>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        c.outreachStatus === 'UNTOUCHED'
                          ? 'bg-amber-100 text-amber-800'
                          : c.outreachStatus === 'OUTREACH_PLANNED'
                          ? 'bg-blue-100 text-blue-800'
                          : c.outreachStatus === 'CONTACTED'
                          ? 'bg-indigo-100 text-indigo-800'
                          : c.outreachStatus === 'ENROLLED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c.outreachStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-mota-muted">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.district}, {c.state}</span>
                    </div>

                    <div className="flex items-center gap-2 text-mota-muted">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.educationLevel}</span>
                    </div>

                    <div className="flex items-center gap-2 text-mota-muted">
                      <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Source: <strong className="text-mota-charcoal">{c.matchedDataset}</strong></span>
                    </div>

                    <div className="bg-[#f8fafc] p-2.5 rounded border border-slate-100 mt-2">
                      <div className="text-[11px] font-medium text-mota-forest">
                        Tribe: <span className="font-semibold text-mota-charcoal">{c.tribeName}</span>
                      </div>
                      <div className="text-[11px] text-mota-muted mt-0.5">
                        Target Scheme: <strong className="text-mota-charcoal">{c.potentialScheme.replace('_', ' ')}</strong>
                      </div>
                    </div>

                    {c.notes && (
                      <p className="text-[11px] italic text-slate-500 bg-amber-50/50 p-2 rounded border border-amber-100 mt-2">
                        "{c.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-medium text-mota-muted mb-2">Change Outreach Stage:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.outreachStatus !== 'OUTREACH_PLANNED' && (
                      <button
                        onClick={() => handleStatusUpdate(c.id, 'OUTREACH_PLANNED')}
                        disabled={isUpdating}
                        className="px-2 py-1 text-[11px] font-medium rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1"
                      >
                        <Clock className="w-3 h-3" />
                        Plan Camp
                      </button>
                    )}

                    {c.outreachStatus !== 'CONTACTED' && (
                      <button
                        onClick={() => handleStatusUpdate(c.id, 'CONTACTED')}
                        disabled={isUpdating}
                        className="px-2 py-1 text-[11px] font-medium rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" />
                        Contacted
                      </button>
                    )}

                    {c.outreachStatus !== 'ENROLLED' && (
                      <button
                        onClick={() => handleStatusUpdate(c.id, 'ENROLLED')}
                        disabled={isUpdating}
                        className="px-2 py-1 text-[11px] font-medium rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                      >
                        <UserCheck className="w-3 h-3" />
                        Enrolled
                      </button>
                    )}

                    {c.outreachStatus !== 'DISMISSED' && (
                      <button
                        onClick={() => handleStatusUpdate(c.id, 'DISMISSED')}
                        disabled={isUpdating}
                        className="px-2 py-1 text-[11px] font-medium rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOutreachPage;
