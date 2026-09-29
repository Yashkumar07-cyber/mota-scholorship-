import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Upload,
  ShieldCheck,
  User,
  Calendar,
  Building,
  CreditCard,
} from 'lucide-react';
import api from '../../services/api';
import { Application, Document } from '../../types';
import StatusTracker from '../../components/StatusTracker';
import { CardSkeleton } from '../../components/SkeletonLoader';

export const ApplicationTrackerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Correction Upload Modal State
  const [showCorrectionModal, setShowCorrectionModal] = useState<boolean>(false);
  const [correctedFileName, setCorrectedFileName] = useState<string>('Corrected_Income_Certificate_Tehsildar.pdf');
  const [isUploadingCorrection, setIsUploadingCorrection] = useState<boolean>(false);
  const [correctionSuccessMsg, setCorrectionSuccessMsg] = useState<string | null>(null);

  const fetchApplicationDetails = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/applications/${id}`);
      if (res.data?.success) {
        setApplication(res.data.application);
      }
    } catch (err) {
      console.error('Error fetching tracker details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const handleUploadCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;

    setIsUploadingCorrection(true);
    try {
      // 1. Upload corrected document to document service (passing forceManualReview: false so it passes!)
      const uploadRes = await api.post('/documents', {
        documentType: 'INCOME_CERTIFICATE',
        fileName: correctedFileName,
        fileUrl: `/uploads/${correctedFileName}`,
        applicationId: application.id,
        forceManualReview: false, // clean pass
      });

      if (uploadRes.data?.success) {
        setCorrectionSuccessMsg(
          'Corrected document uploaded and verified successfully by State e-District! Application has advanced to Institute Verification.'
        );
        setShowCorrectionModal(false);
        // Refresh application details to reflect state change
        await fetchApplicationDetails();
      }
    } catch (err: any) {
      alert(err.message || 'Correction upload failed');
    } finally {
      setIsUploadingCorrection(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <CardSkeleton />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-md mx-auto py-16 text-center text-slate-500">
        <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
        <p className="font-bold text-slate-800">Application not found.</p>
        <Link to="/applications" className="text-emerald-700 underline text-xs mt-2 block">
          Back to Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Back button */}
      <Link
        to="/applications"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Applications</span>
      </Link>

      {/* Header Banner */}
      <div className="bg-white rounded-card p-6 border border-slate-200 shadow-gov space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
                {application.scholarship?.schemeType === 'CENTRALLY_SPONSORED' ? 'Centrally Sponsored' : 'Central Sector'}
              </span>
              <span className="text-[11px] font-mono text-slate-500">ID: {application.applicationId}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{application.scholarship?.name}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Academic Year: <strong>{application.academicYear}</strong> | Beneficiary:{' '}
              <strong>{application.student?.name}</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Current Status</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded inline-block mt-0.5 ${
              application.status === 'SANCTIONED' || application.status === 'DISBURSED'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : application.status === 'MANUAL_REVIEW'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : application.status === 'DEFICIENCY'
                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                : 'bg-slate-100 text-slate-800 border border-slate-200'
            }`}>
              {application.status}
            </span>
          </div>
        </div>

        {/* Visual Government Progress Pipeline */}
        <StatusTracker status={application.status} currentStage={application.currentStage} />

        {/* Correction Alert / Action Banner */}
        {(application.status === 'DEFICIENCY' || application.status === 'MANUAL_REVIEW') && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-amber-950 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Verification Officer Notice:</span>
              </p>
              <p className="text-amber-800 mt-1 leading-relaxed">
                {application.remarks || 'A document discrepancy was noted during revenue verification.'}
              </p>
            </div>
            <button
              onClick={() => setShowCorrectionModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-lg shrink-0 shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Corrected Scan</span>
            </button>
          </div>
        )}

        {correctionSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{correctionSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Two Column Section: Attached Documents & Transition History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Attached Documents & Verification Status */}
        <div className="bg-white rounded-card p-5 border border-slate-200 shadow-gov space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-800" />
              <span>Attached Documents ({application.documents?.length || 0})</span>
            </h3>
            <Link to="/documents" className="text-xs text-emerald-700 hover:underline">
              Wallet View
            </Link>
          </div>

          <div className="space-y-2.5">
            {(!application.documents || application.documents.length === 0) ? (
              <p className="text-xs text-slate-400 py-4 text-center">No documents linked.</p>
            ) : (
              application.documents.map((doc) => (
                <div key={doc.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate max-w-[200px]">{doc.fileName}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      doc.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : doc.verificationStatus === 'MANUAL_REVIEW'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {doc.verificationStatus}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Source: {doc.verificationSource || 'National Depository'}</span>
                    <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  {doc.mismatchReason && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-1 rounded mt-1 border border-amber-200">
                      Discrepancy: {doc.mismatchReason}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Immutable Application Transition History (Requirement 12) */}
        <div className="bg-white rounded-card p-5 border border-slate-200 shadow-gov space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-800" />
              <span>Audit Transition History</span>
            </h3>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {application.statusHistory?.map((hist, idx) => (
              <div key={hist.id || idx} className="relative text-xs space-y-0.5">
                {/* Timeline node */}
                <div className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-emerald-700 ring-4 ring-white" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {hist.fromStatus} → {hist.toStatus}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(hist.changedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{hist.remarks}</p>
                <span className="text-[10px] text-emerald-800 font-semibold block">
                  Action by: {hist.changedBy}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Correction Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-card p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-800" />
                <span>Upload Corrected Document</span>
              </h3>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadCorrection} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Document Type
                </label>
                <input
                  disabled
                  value="INCOME_CERTIFICATE (State Revenue Authority)"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Selected File Name
                </label>
                <input
                  type="text"
                  required
                  value={correctedFileName}
                  onChange={(e) => setCorrectedFileName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 leading-relaxed">
                Uploading this document will immediately execute a prototype verification cross-check and automatically update your application status!
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingCorrection}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition disabled:opacity-50"
                >
                  {isUploadingCorrection ? 'Verifying...' : 'Verify & Resubmit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationTrackerPage;
