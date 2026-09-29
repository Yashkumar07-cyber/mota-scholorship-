import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Building,
  ArrowDownRight,
  TrendingUp,
} from 'lucide-react';
import api from '../../services/api';
import { Payment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ListSkeleton } from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';

export const PaymentTrackerPage: React.FC = () => {
  const { user } = useAuth();
  const student = user?.student;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalReceived, setTotalReceived] = useState<number>(0);
  const [pendingAmount, setPendingAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/payments');
        if (res.data?.success) {
          setPayments(res.data.payments || []);
          if (res.data.summary) {
            setTotalReceived(res.data.summary.totalReceived || 0);
            setPendingAmount(res.data.summary.pendingAmount || 0);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
            Public Financial Management System (PFMS)
          </span>
          <span className="text-xs text-slate-500 font-medium">Direct Benefit Transfer (DBT)</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900">Scholarship Payment & DBT Passbook</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Government financial disbursements credited directly to your Aadhaar Payment Bridge (APB) linked bank account.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Credited */}
        <div className="bg-white rounded-card p-5 border border-slate-200 shadow-gov space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Funds Disbursed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            ₹{totalReceived.toLocaleString('en-IN')}
          </h2>
          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Credited to Aadhaar-seeded bank account</span>
          </span>
        </div>

        {/* Pending Sanctions */}
        <div className="bg-white rounded-card p-5 border border-slate-200 shadow-gov space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">In-Process / Sanctioned</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            ₹{pendingAmount.toLocaleString('en-IN')}
          </h2>
          <span className="text-[11px] text-slate-500">
            Awaiting PFMS electronic batch release
          </span>
        </div>

        {/* DBT Account Mapping */}
        <div className="bg-white rounded-card p-5 border border-slate-200 shadow-gov space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">DBT Bank Seed Status</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {student?.bankName || 'State Bank of India'}
          </h3>
          <p className="text-[11px] text-slate-500">
            Account: {student?.accountNumberMasked || 'XXXX-XXXX-4589'} (NPCI Active)
          </p>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white rounded-card border border-slate-200 shadow-gov overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-800" />
            <span>Disbursement History & Electronic Vouchers</span>
          </h3>
          <span className="text-xs text-slate-400">Total: {payments.length} Records</span>
        </div>

        {isLoading ? (
          <div className="p-4">
            <ListSkeleton count={3} />
          </div>
        ) : payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No disbursements yet"
            description="Your scholarship disbursements will appear here once an application is approved and central sanctions are issued by the Ministry."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Transaction / PFMS ID</th>
                  <th className="py-3 px-4">Scheme</th>
                  <th className="py-3 px-4">Disbursed Date</th>
                  <th className="py-3 px-4">DBT Mode</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {p.transactionId || 'PFMS-PROCESSING'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {p.application?.scholarship?.name || 'Post-Matric Scholarship'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : 'Queue Scheduled'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      Aadhaar Payment Bridge (APB)
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.status === 'CREDITED'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : p.status === 'PROCESSING'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-sm text-slate-900">
                      +₹{p.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-card text-xs text-slate-500 leading-relaxed space-y-1">
        <p className="font-bold text-slate-700">Prototype DBT Verification Notice:</p>
        <p>
          Disbursements are simulated based on seeded Ministry records. In production, payments are authorized by MoTA via Public Financial Management System (PFMS) and routed by NPCI directly to the beneficiary account without intermediary deductions.
        </p>
      </div>
    </div>
  );
};

export default PaymentTrackerPage;
