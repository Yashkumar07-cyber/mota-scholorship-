import React from 'react';
import { Check, Clock, AlertTriangle, XCircle, ShieldAlert } from 'lucide-react';
import { ApplicationStatus } from '../types';

interface StatusTrackerProps {
  status: ApplicationStatus;
  currentStage?: string;
}

export const StatusTracker: React.FC<StatusTrackerProps> = ({ status, currentStage }) => {
  // Ordered standard stages
  const stages = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'INSTITUTE_VERIFICATION', label: 'Institute' },
    { key: 'STATE_VERIFICATION', label: 'State Nodal' },
    { key: 'MINISTRY_VERIFICATION', label: 'MoTA Central' },
    { key: 'SANCTIONED', label: 'Sanctioned' },
    { key: 'DISBURSED', label: 'DBT Credit' },
  ];

  const getStageIndex = (s: ApplicationStatus): number => {
    switch (s) {
      case 'DRAFT':
        return -1;
      case 'SUBMITTED':
        return 0;
      case 'INSTITUTE_VERIFICATION':
        return 1;
      case 'STATE_VERIFICATION':
        return 2;
      case 'MINISTRY_VERIFICATION':
        return 3;
      case 'SANCTIONED':
      case 'DBT_PROCESSING':
        return 4;
      case 'DISBURSED':
        return 5;
      case 'MANUAL_REVIEW':
        return 1.5; // In-between inspection
      case 'DEFICIENCY':
        return 1.5;
      case 'REJECTED':
        return -2;
      default:
        return 0;
    }
  };

  const currentIndex = getStageIndex(status);
  const isSpecial = status === 'MANUAL_REVIEW' || status === 'DEFICIENCY' || status === 'REJECTED';

  return (
    <div className="w-full py-3">
      {/* Special State Callout Banner */}
      {status === 'MANUAL_REVIEW' && (
        <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Manual Review Required:</strong> Document scrutiny flagged a minor revenue mismatch. Awaiting officer validation.
          </span>
        </div>
      )}

      {status === 'DEFICIENCY' && (
        <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-900">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            <strong>Action Required:</strong> Inspection officer requested document correction. Please re-upload verified scan.
          </span>
        </div>
      )}

      {status === 'REJECTED' && (
        <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-900">
          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>
            <strong>Application Closed:</strong> Application did not satisfy statutory schematic norms.
          </span>
        </div>
      )}

      {/* Visual Step Progress Bar */}
      <div className="relative flex items-center justify-between">
        {/* Progress Track Line */}
        <div className="absolute left-3 right-3 top-3.5 h-0.5 bg-slate-200 -z-0" />

        {stages.map((stage, idx) => {
          const isDone = !isSpecial && currentIndex >= idx;
          const isCurrent = !isSpecial && currentIndex === idx;
          const isPending = !isSpecial && currentIndex < idx;

          return (
            <div key={stage.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                  isDone
                    ? 'bg-emerald-700 text-white'
                    : isCurrent
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 animate-pulse'
                    : isSpecial && idx <= Math.floor(currentIndex)
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : isCurrent ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 text-center font-medium ${
                  isDone || isCurrent ? 'text-slate-900 font-bold' : 'text-slate-400'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTracker;
