import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2,
  RefreshCw,
  ExternalLink,
  Eye,
  Plus,
} from 'lucide-react';
import api from '../../services/api';
import { Document } from '../../types';
import { ListSkeleton } from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';

export const DocumentWalletPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [docType, setDocType] = useState<string>('ST_CERTIFICATE');
  const [fileName, setFileName] = useState<string>('ST_Certificate_Revenue_Tehsildar.pdf');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/documents');
      if (res.data?.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      await api.post('/documents', {
        documentType: docType,
        fileName,
        fileUrl: `/uploads/${fileName}`,
      });
      setShowUploadModal(false);
      await fetchDocuments();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReverify = async (id: string) => {
    try {
      await api.post(`/documents/${id}/verify`, { forceManualReview: false });
      await fetchDocuments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this document from wallet?')) return;
    try {
      await api.delete(`/documents/${id}`);
      await fetchDocuments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const categories = [
    { key: 'ALL', label: 'All Documents' },
    { key: 'ST_CERTIFICATE', label: 'ST / PVTG' },
    { key: 'INCOME_CERTIFICATE', label: 'Income Proof' },
    { key: 'ACADEMIC_MARKSHEET', label: 'Academic & Marks' },
    { key: 'IDENTITY_AADHAAR', label: 'Identity / Aadhaar' },
    { key: 'BANK_PASSBOOK', label: 'Bank & DBT' },
  ];

  const filtered = documents.filter((doc) => {
    if (activeCategory === 'ALL') return true;
    return doc.documentType === activeCategory;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
              DigiLocker & e-District Integrated
            </span>
            <span className="text-xs text-slate-500 font-medium">Digital Document Wallet</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Student Document Wallet</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Store, reuse, and verify your official tribal certificates across all scholarship applications.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition ${
              activeCategory === c.key
                ? 'bg-emerald-800 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Document Grid */}
      {isLoading ? (
        <ListSkeleton count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Document Wallet Empty"
          description="You do not have any documents stored in this category. Upload your official certificates for automated verification."
          actionText="Upload Document"
          onAction={() => setShowUploadModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-card p-4 border border-slate-200 shadow-gov hover:shadow-gov-md transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                        {doc.fileName}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {doc.documentType} • {(doc.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      doc.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : doc.verificationStatus === 'MANUAL_REVIEW'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {doc.verificationStatus === 'VERIFIED' ? '✓ VERIFIED' : doc.verificationStatus}
                  </span>
                </div>

                <div className="mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Verification Source:</span>
                    <span className="font-medium text-slate-800">{doc.verificationSource || 'DigiLocker / e-District'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Uploaded On:</span>
                    <span className="text-slate-700">{new Date(doc.uploadedAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  {doc.mismatchReason && (
                    <p className="text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 mt-1">
                      ⚠️ {doc.mismatchReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setViewingDoc(doc)}
                  className="text-slate-600 hover:text-emerald-800 font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReverify(doc.id)}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 p-1 hover:bg-emerald-50 rounded transition"
                    title="Re-run Prototype Verification"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-verify</span>
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-slate-400 hover:text-red-700 p-1 hover:bg-red-50 rounded transition"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-card p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-800" />
                <span>Upload Document to Wallet</span>
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Document Category
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="ST_CERTIFICATE">ST / Tribal Caste Certificate</option>
                  <option value="INCOME_CERTIFICATE">Income Certificate (Tehsildar)</option>
                  <option value="ACADEMIC_MARKSHEET">Academic Marksheet (Class X / XII / Degree)</option>
                  <option value="IDENTITY_AADHAAR">Identity Proof (Aadhaar Card)</option>
                  <option value="BANK_PASSBOOK">Bank Account Passbook / Cancelled Cheque</option>
                  <option value="DISABILITY_CERTIFICATE">Disability (Divyangjan) Certificate</option>
                  <option value="NET_JRF_SCORECARD">UGC NET / JRF Scorecard</option>
                  <option value="OVERSEAS_OFFER_LETTER">Overseas University Admission Letter</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Document File Name
                </label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 leading-relaxed">
                <span className="font-bold text-emerald-800 block mb-0.5">Prototype Verification Notice:</span>
                Your uploaded file will be verified against mock DigiLocker and e-District verification adapters.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition disabled:opacity-50"
                >
                  {isUploading ? 'Validating...' : 'Upload & Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Drawer/Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-card p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 truncate max-w-xs">{viewingDoc.fileName}</h3>
              <button onClick={() => setViewingDoc(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-2">
              <FileText className="w-12 h-12 text-emerald-700 mx-auto" />
              <p className="font-bold text-xs text-slate-800">{viewingDoc.fileName}</p>
              <p className="text-[11px] text-slate-500">Document Type: {viewingDoc.documentType}</p>
              <p className="text-[10px] text-emerald-800 font-semibold bg-emerald-100/60 inline-block px-2 py-0.5 rounded">
                Verified via {viewingDoc.verificationSource || 'Government Repository'}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewingDoc(null)}
                className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentWalletPage;
