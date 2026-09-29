import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  CreditCard,
  Building,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  Save,
  LogOut,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StudentProfile, FamilyMember } from '../../types';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Editable fields
  const [state, setState] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [familyIncome, setFamilyIncome] = useState<number>(180000);
  const [course, setCourse] = useState<string>('');
  const [institution, setInstitution] = useState<string>('');

  // New family member modal
  const [showAddFamily, setShowAddFamily] = useState<boolean>(false);
  const [newMemName, setNewMemName] = useState<string>('');
  const [newMemRelation, setNewMemRelation] = useState<string>('SISTER');
  const [newMemAge, setNewMemAge] = useState<number>(14);
  const [newMemEdu, setNewMemEdu] = useState<string>('Class IX');
  const [newMemSch, setNewMemSch] = useState<string>('Pre-Matric Scholarship');

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/profile');
      if (res.data?.success && res.data.profile) {
        const p = res.data.profile;
        setProfile(p);
        setFamilyMembers(p.familyMembers || []);
        setState(p.state || 'Jharkhand');
        setDistrict(p.district || 'Ranchi');
        setFamilyIncome(p.familyIncome || 180000);
        setCourse(p.course || '');
        setInstitution(p.institution || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await api.put('/profile', {
        state,
        district,
        familyIncome: Number(familyIncome),
        course,
        institution,
      });
      if (res.data?.success) {
        setProfile(res.data.profile);
        setSaveMessage('Profile information updated successfully!');
      }
    } catch (err: any) {
      alert(err.message || 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFamilyMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/profile/family', {
        name: newMemName,
        relation: newMemRelation,
        age: Number(newMemAge),
        educationLevel: newMemEdu,
        currentScholarship: newMemSch,
        scholarshipStatus: 'Verification',
      });
      if (res.data?.success) {
        setShowAddFamily(false);
        setNewMemName('');
        await fetchProfile();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
              One-Time Registration (OTR)
            </span>
            <span className="text-xs text-slate-500 font-medium">Session: {profile?.otrId || 'OTR-ST-2026-90412'}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Student Profile & Household Details</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your single persistent digital profile for all Ministry of Tribal Affairs benefits.
          </p>
        </div>

        <button
          onClick={logout}
          className="text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-lg flex items-center gap-1.5 transition shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Completion & Demographic Card */}
      <div className="bg-white rounded-card p-6 border border-slate-200 shadow-gov space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xl border-2 border-emerald-950">
              {profile?.name?.charAt(0) || 'R'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{profile?.name || 'Rahul Munda'}</h2>
              <p className="text-xs text-slate-500">
                Community: <strong>ST ({profile?.tribeName || 'Munda'})</strong> • Gender: {profile?.gender || 'MALE'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block">Profile Completion</span>
            <span className="text-lg font-bold text-emerald-800">{profile?.profileCompletionPct || 90}%</span>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">State of Domicile</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                Annual Family Income (INR)
              </label>
              <input
                type="number"
                value={familyIncome}
                onChange={(e) => setFamilyIncome(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-lg font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                Particularly Vulnerable Tribal Group (PVTG)
              </label>
              <input
                disabled
                value={profile?.pvtgStatus ? 'Yes (Statutory PVTG Quota Eligible)' : 'No (Standard ST Category)'}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Enrolled Institution</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Course of Study</label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg font-medium"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Updating...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* FAMILY MEMBERS VIEW (Requirement 19) */}
      <div className="bg-white rounded-card p-6 border border-slate-200 shadow-gov space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-800" />
              <span>Linked Household Family Members</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Track sibling scholarship entitlements and avoid duplicate benefits.
            </p>
          </div>

          <button
            onClick={() => setShowAddFamily(true)}
            className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Sibling</span>
          </button>
        </div>

        <div className="space-y-3">
          {familyMembers.map((member) => (
            <div
              key={member.id}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">
                    {member.name}{' '}
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({member.relation}, Age {member.age})
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">{member.educationLevel}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:text-right">
                <div>
                  <span className="text-[10px] text-slate-400 block">Scholarship</span>
                  <span className="font-semibold text-slate-800">{member.currentScholarship || 'None'}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    member.scholarshipStatus === 'Disbursed'
                      ? 'bg-emerald-100 text-emerald-900'
                      : member.scholarshipStatus === 'Sanctioned'
                      ? 'bg-blue-100 text-blue-900'
                      : member.scholarshipStatus === 'Verification'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {member.scholarshipStatus || 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Sibling Modal */}
      {showAddFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-card p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Link Family Member</h3>
              <button onClick={() => setShowAddFamily(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddFamilyMember} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Name</label>
                <input
                  required
                  value={newMemName}
                  onChange={(e) => setNewMemName(e.target.value)}
                  placeholder="e.g. Suman Munda"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Relation</label>
                  <select
                    value={newMemRelation}
                    onChange={(e) => setNewMemRelation(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="SISTER">Sister</option>
                    <option value="BROTHER">Brother</option>
                    <option value="DEPENDENT">Dependent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Age</label>
                  <input
                    type="number"
                    value={newMemAge}
                    onChange={(e) => setNewMemAge(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Education Level</label>
                <input
                  required
                  value={newMemEdu}
                  onChange={(e) => setNewMemEdu(e.target.value)}
                  placeholder="e.g. Class IX (Govt High School)"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Applicable Scholarship</label>
                <input
                  value={newMemSch}
                  onChange={(e) => setNewMemSch(e.target.value)}
                  placeholder="e.g. Pre-Matric Scholarship"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFamily(false)}
                  className="px-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
