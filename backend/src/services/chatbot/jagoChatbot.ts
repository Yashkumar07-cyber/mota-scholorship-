import { PrismaClient } from '@prisma/client';
import { eligibilityEngine } from '../eligibility/eligibilityEngine';

export interface JagoResponse {
  answer: string;
  intent: string;
  contextData?: Record<string, any>;
  suggestions?: string[];
}

export class JagoChatbotService {
  async processMessage(
    prisma: PrismaClient,
    userId: string,
    message: string
  ): Promise<JagoResponse> {
    const q = message.trim().toLowerCase();

    // 1. Fetch live student profile and related records
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: {
          include: {
            applications: {
              include: {
                scholarship: true,
                statusHistory: {
                  orderBy: { changedAt: 'desc' },
                  take: 3,
                },
                payments: true,
              },
              orderBy: { createdAt: 'desc' },
            },
            documents: true,
            payments: {
              orderBy: { createdAt: 'desc' },
            },
            familyMembers: true,
          },
        },
      },
    });

    const student = user?.student;
    const activeApp = student?.applications?.[0];

    // Intent 1: Application Status / "Where is my application?" / "What is my status?"
    if (
      q.includes('status') ||
      q.includes('where is my app') ||
      q.includes('track') ||
      q.includes('stage') ||
      q.includes('current progress')
    ) {
      if (!student) {
        return {
          answer: 'You are currently logged in as an administrator. Please access the Admin Dashboard for institutional queues.',
          intent: 'STATUS_QUERY',
          suggestions: ['Go to Admin Verification Queue', 'Check Unreached Candidates'],
        };
      }

      if (!activeApp) {
        return {
          answer: `Hello ${student.name}! You haven't submitted any scholarship application yet. You can check your eligibility or start an application for the Post-Matric or Top Class schemes today!`,
          intent: 'STATUS_QUERY',
          suggestions: ['Check my eligibility', 'How to apply for Post-Matric?'],
        };
      }

      const statusMap: Record<string, string> = {
        DRAFT: 'Draft (Not yet submitted)',
        SUBMITTED: 'Submitted (Awaiting initial institutional scrutiny)',
        INSTITUTE_VERIFICATION: 'Under Institute Nodal Officer Verification',
        STATE_VERIFICATION: 'Under State Tribal Welfare Department Review',
        MINISTRY_VERIFICATION: 'Under Ministry of Tribal Affairs (MoTA) Final Verification',
        MANUAL_REVIEW: 'Flagged for Manual Verification by Tribal Welfare Officer',
        DEFICIENCY: 'Action Required: Deficiency raised on supporting documents',
        SANCTIONED: 'Sanctioned! Sanction order issued by Ministry',
        DBT_PROCESSING: 'DBT Processing: Sent to Public Financial Management System (PFMS)',
        DISBURSED: 'Disbursed directly to your Aadhaar-seeded bank account',
        REJECTED: 'Application Rejected',
      };

      const friendlyStatus = statusMap[activeApp.status] || activeApp.status;
      let extraNote = '';

      if (activeApp.status === 'MANUAL_REVIEW') {
        extraNote =
          '\n\n📌 Note: Your application has been moved to Manual Review because our automated revenue cross-check noticed a minor name/spelling discrepancy on your Income Certificate. An inspection officer is reviewing it, or you may receive a correction request.';
      } else if (activeApp.status === 'DEFICIENCY') {
        extraNote = `\n\n⚠️ Action Required: ${activeApp.remarks || 'Please upload the corrected document via your Application Tracker.'}`;
      } else if (activeApp.status === 'SANCTIONED' || activeApp.status === 'DISBURSED') {
        extraNote = `\n\n🎉 Great news! Your application was sanctioned on ${activeApp.sanctionDate ? new Date(activeApp.sanctionDate).toLocaleDateString('en-IN') : 'recently'}. Payment processing through PFMS is initiated.`;
      }

      return {
        answer: `Hello ${student.name}! Your application **${activeApp.applicationId}** for the **${activeApp.scholarship.name}** is currently at:\n\n**${friendlyStatus}** (Stage: ${activeApp.currentStage})${extraNote}`,
        intent: 'STATUS_QUERY',
        contextData: {
          applicationId: activeApp.applicationId,
          scheme: activeApp.scholarship.name,
          status: activeApp.status,
          currentStage: activeApp.currentStage,
          lastUpdated: activeApp.updatedAt,
        },
        suggestions: [
          'Why is my application pending?',
          'When will payment be credited?',
          'What documents do I need to update?',
        ],
      };
    }

    // Intent 2: "Why is my application pending?" / Delay inquiry
    if (
      q.includes('why') &&
      (q.includes('pending') || q.includes('stuck') || q.includes('delay') || q.includes('review') || q.includes('manual'))
    ) {
      if (!activeApp) {
        return {
          answer: 'You do not have any pending application currently.',
          intent: 'PENDING_REASON_QUERY',
        };
      }

      if (activeApp.status === 'MANUAL_REVIEW') {
        return {
          answer: `Your application **${activeApp.applicationId}** is under **Manual Review**.\n\nAutomated DigiLocker and e-District verification cleared your ST Caste Certificate, Aadhaar, and Institutional admission. However, the Income Certificate showed a minor variation with state revenue records. The MoTA Verification Officer will either validate it manually or request a refreshed scan. You do not need to worry—applications in Manual Review are not rejected automatically!`,
          intent: 'PENDING_REASON_QUERY',
          suggestions: ['Check my documents', 'View application tracker'],
        };
      }

      if (activeApp.status === 'DEFICIENCY') {
        return {
          answer: `Your application **${activeApp.applicationId}** requires your attention:\n\nRemark: "${activeApp.remarks || 'A document discrepancy was noted by the verification officer.'}"\n\nPlease visit the **Applications** page and tap "Upload Correction" to resume processing.`,
          intent: 'PENDING_REASON_QUERY',
          suggestions: ['Go to Applications', 'What documents are accepted?'],
        };
      }

      return {
        answer: `Your application **${activeApp.applicationId}** is currently progressing normally through **${activeApp.currentStage}** (${activeApp.status}). Government verification steps involve institutional bonafide checks followed by state nodal officer authorization. Most applications advance within 3 to 7 working days.`,
        intent: 'PENDING_REASON_QUERY',
        suggestions: ['What is my application status?', 'Check DBT payment status'],
      };
    }

    // Intent 3: Payment / DBT questions
    if (
      q.includes('payment') ||
      q.includes('dbt') ||
      q.includes('money') ||
      q.includes('amount') ||
      q.includes('disburs') ||
      q.includes('bank') ||
      q.includes('credited')
    ) {
      if (!student) {
        return {
          answer: 'Payment and DBT information is available for student accounts in their respective portals.',
          intent: 'PAYMENT_QUERY',
        };
      }

      const totalReceived = student.payments
        .filter((p) => p.status === 'CREDITED')
        .reduce((sum, p) => sum + p.amount, 0);

      const latestPayment = student.payments[0];

      if (latestPayment) {
        return {
          answer: `Here is your DBT & Payment Summary, ${student.name}:\n\n- **Total Disbursed to Date**: ₹${totalReceived.toLocaleString('en-IN')}\n- **Latest Transaction**: ₹${latestPayment.amount.toLocaleString('en-IN')} (${latestPayment.status})\n- **PFMS Ref**: ${latestPayment.transactionId || 'PFMS-PROCESSING'}\n- **DBT Account Status**: ${student.dbtStatus} (${student.accountNumberMasked || 'SBI Account'})\n\nFunds are directly transferred via Aadhaar Payment Bridge (APB) to avoid intermediaries.`,
          intent: 'PAYMENT_QUERY',
          contextData: {
            totalReceived,
            latestPayment,
          },
          suggestions: ['What is my application status?', 'How to update bank details?'],
        };
      } else {
        return {
          answer: `Hello ${student.name}! No scholarship payments have been disbursed for the current cycle yet. Once your application reaches the **SANCTIONED** stage, DBT processing will begin automatically via PFMS.`,
          intent: 'PAYMENT_QUERY',
          suggestions: ['Check my application status', 'Am I eligible?'],
        };
      }
    }

    // Intent 4: "Am I eligible?" / Eligibility check
    if (
      q.includes('eligible') ||
      q.includes('eligibility') ||
      q.includes('can i apply') ||
      q.includes('criteria')
    ) {
      if (!student) {
        return {
          answer: 'To check eligibility, please provide your category (ST), family income, and enrolled course.',
          intent: 'ELIGIBILITY_QUERY',
        };
      }

      const results = eligibilityEngine.evaluateAll({
        name: student.name,
        tribeCategory: student.tribeCategory,
        pvtgStatus: student.pvtgStatus,
        familyIncome: student.familyIncome,
        course: student.course,
        institution: student.institution,
      });

      const eligibleSchemes = results.filter((r) => r.eligible);
      const schemeList = eligibleSchemes
        .map((s) => `• **${s.scholarshipName}**\n  Benefits: ${s.benefitsSummary}`)
        .join('\n\n');

      return {
        answer: `Based on your profile as an **ST candidate** with annual family income of **₹${student.familyIncome.toLocaleString('en-IN')}** enrolled in **${student.course}**, here is your eligibility:\n\n${schemeList || 'You may need to verify your course level or income requirements to apply.'}\n\nWould you like to start an application for any of these?`,
        intent: 'ELIGIBILITY_QUERY',
        contextData: { eligibleSchemes },
        suggestions: ['Start Post-Matric application', 'Check required documents', 'What is Top Class scholarship?'],
      };
    }

    // Intent 5: Documents required
    if (
      q.includes('document') ||
      q.includes('certificate') ||
      q.includes('upload') ||
      q.includes('need to submit')
    ) {
      return {
        answer: `For MoTA scholarship schemes, the primary mandatory documents are:\n\n1. **ST Certificate**: Scheduled Tribe certificate issued by Sub-Divisional Magistrate / Tehsildar (verified via e-District)\n2. **Income Certificate**: Valid annual family income certificate (must be within ₹2.50L for Pre/Post-Matric or ₹6.00L for Top Class/NOS)\n3. **Academic Marksheet**: Last qualifying exam or matriculation marksheet (verified via DigiLocker/APAAR)\n4. **Bonafide / Fee Receipt**: Issued by your current recognized school, college, or university\n5. **Aadhaar & Bank Proof**: Aadhaar card seeded with your active bank account for DBT.\n\nYou can manage all these in your digital **Document Wallet**.`,
        intent: 'DOCUMENT_QUERY',
        suggestions: ['View my Document Wallet', 'Check my eligibility', 'What is my application status?'],
      };
    }

    // Intent 6: Family members
    if (q.includes('family') || q.includes('sibling') || q.includes('brother') || q.includes('sister')) {
      if (student?.familyMembers && student.familyMembers.length > 0) {
        const familyList = student.familyMembers
          .map(
            (m) =>
              `• **${m.name}** (${m.relation}, Age ${m.age}) - Enrolled in ${m.educationLevel}${m.currentScholarship ? ` | Scholarship: ${m.currentScholarship} (${m.scholarshipStatus})` : ''}`
          )
          .join('\n');
        return {
          answer: `Here are the family members linked to your tribal household account:\n\n${familyList}\n\nYou can track multi-child benefits directly from your Profile > Family View!`,
          intent: 'FAMILY_QUERY',
          suggestions: ['Go to Profile', 'Am I eligible?'],
        };
      }
    }

    const studentGreeting = student?.name ? `Hello ${student.name}!` : 'Hello!';

    // Intent 0: Friendly Greeting
    if (
      q === 'hi' ||
      q === 'hello' ||
      q === 'hey' ||
      q.startsWith('hi ') ||
      q.startsWith('hello ') ||
      q.includes('namaste') ||
      q.includes('good morning') ||
      q.includes('good afternoon') ||
      q.includes('good evening')
    ) {
      return {
        answer: `${studentGreeting} I am **JAGO**, your MoTA AI Tribal Scholarship Assistant. I have live access to your student profile (${student?.tribeCategory || 'ST'} category, ${student?.course || 'student candidate'}).\n\nHow can I help you today? You can ask me:\n- "Where is my application?"\n- "Why is my application pending?"\n- "Am I eligible for scholarships?"\n- "When was my scholarship payment made?"\n- "What documents do I need?"`,
        intent: 'GREETING',
        suggestions: [
          'What is my application status?',
          'Am I eligible for scholarships?',
          'When was my scholarship payment made?',
          'What documents do I need?',
        ],
      };
    }

    // Default Fallback with Official Knowledge Base
    return {
      answer: `${studentGreeting} I am **JAGO**, your MoTA AI Tribal Scholarship Assistant. I have direct access to your profile and live application records.\n\nI can help you with:\n- Checking your application status & stage ("Where is my application?")\n- Explaining delays or review steps ("Why is my application pending?")\n- Tracking DBT disbursements ("When was my payment made?")\n- Evaluating your eligibility across all 5 MoTA schemes ("Am I eligible?")\n- Guidance on documents and DigiLocker verification\n\nHow may I help you right now?`,
      intent: 'GENERAL',
      suggestions: [
        'What is my application status?',
        'Am I eligible for scholarships?',
        'When was my scholarship payment made?',
        'What documents do I need?',
      ],
    };
  }
}

export const jagoChatbotService = new JagoChatbotService();
export default jagoChatbotService;
