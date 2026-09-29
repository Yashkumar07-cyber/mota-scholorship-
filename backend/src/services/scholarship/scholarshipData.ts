// Official MoTA Scholarship Reference Data
// Source of truth: Ministry of Tribal Affairs (https://tribal.nic.in/ScholarshiP.aspx)

export interface OfficialScholarshipDef {
  code: string;
  name: string;
  schemeType: string;
  shortDescription: string;
  detailedDescription: string;
  eligibility: string;
  benefits: string;
  applicationProcess: string;
  requiredDocuments: string;
  importantDates: string;
  sourceUrl: string;
  lastVerifiedAt: Date;
  active: boolean;
}

export const officialScholarshipData: OfficialScholarshipDef[] = [
  {
    code: 'PRE_MATRIC',
    name: 'Pre-Matric Scholarship Scheme for ST Students',
    schemeType: 'CENTRALLY_SPONSORED',
    shortDescription: 'Financial assistance for ST students studying in Classes IX and X to reduce dropout rates.',
    detailedDescription:
      'This is a Centrally Sponsored Scheme implemented through States/UTs who are responsible for inviting applications from students online through State Portal or National Scholarship Portal, checking eligibility verification, and disbursement of scholarship to eligible ST students directly to their bank accounts through DBT. Funds are released by the Ministry of Tribal Affairs to State Governments/UTs based on Statement of Expenditure, Furnishing of Utilization Certificate, and uploading of beneficiary data on DBT Portal. Funds are shared at the ratio of 75:25 between Centre and State/UT, and 90:10 for NE and Special Category States (UT of Jammu & Kashmir, Himachal Pradesh, Uttarakhand). For UTs without legislature, 100% grant is provided by the Centre.',
    eligibility:
      '1. Applicable to students who are studying in Classes IX - X in government or recognized private schools.\n2. Applicant must belong to Scheduled Tribe (ST) community.\n3. Parental income from all sources should not exceed Rs. 2.50 lakhs per annum.\n4. Student must not be holding any other scholarship awarded by the Central/State Government.',
    benefits:
      '1. Day Scholars: ₹225/- per month for a period of 10 months in an academic year.\n2. Hostellers: ₹525/- per month for a period of 10 months in an academic year.\n3. Additional ad-hoc book and stationery grant as prescribed under state schematic norms.\n4. Additional disability allowances for Divyangjan ST students.',
    applicationProcess:
      '1. Online registration by student via State Scholarship Portal or National Scholarship Portal (NSP).\n2. Uploading of mandatory income and ST caste certificates.\n3. Institutional scrutiny and verification by School Principal / Nodal Officer.\n4. District and State Tribal Welfare Department approval.\n5. Electronic fund transfer (DBT) directly into student Aadhaar-seeded bank account.',
    requiredDocuments: JSON.stringify([
      { name: 'ST Certificate', description: 'Caste certificate issued by authorized Revenue Authority / Tehsildar' },
      { name: 'Income Certificate', description: 'Parental annual income certificate (<= Rs 2.50 Lakh)' },
      { name: 'Previous Class Marksheet', description: 'Pass marksheet of Class VIII (for Class IX) or Class IX (for Class X)' },
      { name: 'Bonafide / Enrollment Certificate', description: 'Certificate of enrollment issued by Head of School' },
      { name: 'Aadhaar Card / Bank Passbook', description: 'Bank account seeded with NPCI / Aadhaar' },
    ]),
    importantDates: JSON.stringify({
      portalOpening: '2025-07-01',
      applicationDeadline: '2025-11-30',
      instituteVerificationDeadline: '2025-12-15',
      disbursementCycle: 'Direct transfer quarterly / bi-annually',
    }),
    sourceUrl: 'https://dbttribal.gov.in/',
    lastVerifiedAt: new Date('2026-03-31T00:00:00Z'),
    active: true,
  },
  {
    code: 'POST_MATRIC',
    name: 'Post-Matric Scholarship Scheme for ST Students',
    schemeType: 'CENTRALLY_SPONSORED',
    shortDescription: 'Centrally sponsored support for post-matriculation / higher secondary, undergraduate, and post-graduate studies.',
    detailedDescription:
      'This is a Centrally Sponsored Scheme implemented through States/UTs who are responsible for inviting applications from students online through State Portal or National Scholarship Portal, checking eligibility verification, and disbursement of scholarship to eligible ST students directly to their bank accounts through DBT. Funds are released by the Ministry to State Governments/UTs based on Statement of Expenditure, Furnishing of Utilization Certificate, and uploading of beneficiary data on DBT Portal. Funds are shared 75:25 (Centre:State) and 90:10 for North Eastern and Himalayan States.',
    eligibility:
      '1. Applicable to ST students pursuing any recognized course from a recognized institution for which entry qualification is Matriculation/Class X or above.\n2. Covers Class XI, XII, ITI, Diploma, Undergraduate (BA, B.Sc, B.Com, B.Tech, MBBS, etc.), Postgraduate, and Professional degrees.\n3. Parental annual income from all sources must not exceed Rs. 2.50 lakhs per annum.\n4. Must maintain satisfactory academic attendance and progress.',
    benefits:
      '1. Compulsory non-refundable fees charged by educational institutions subject to ceilings fixed by the State Fee Regulatory Committee.\n2. Maintenance allowance varying from ₹230/- to ₹1,200/- per month depending upon course group and whether student is a Hosteller or Day Scholar.\n3. Study tour charges, thesis typing/printing charges, and book allowance for professional courses.\n4. Special reader / escort allowance for visually impaired and orthopedically challenged students.',
    applicationProcess:
      '1. Online registration on State Scholarship Portal or NSP with One-Time Registration (OTR).\n2. Dynamic fetching of caste and income credentials from State e-District repository.\n3. Level 1 Verification by College / University Nodal Officer (AISHE mapped).\n4. Level 2 Verification by District Welfare Officer / State Tribal Welfare Department.\n5. DBT disbursement via Aadhaar Payment Bridge (APB).',
    requiredDocuments: JSON.stringify([
      { name: 'ST Certificate', description: 'Valid digital certificate from State e-District portal' },
      { name: 'Income Certificate', description: 'Current financial year revenue certificate <= ₹2.50 Lakh' },
      { name: 'Class X / Last Exam Marksheet', description: 'DigiLocker verified mark statement' },
      { name: 'Fee Receipt & College Bonafide', description: 'Itemized compulsory fees breakdown from recognized college' },
      { name: 'Bank Passbook Copy', description: 'Active Aadhaar-seeded bank account details' },
    ]),
    importantDates: JSON.stringify({
      portalOpening: '2025-07-15',
      applicationDeadline: '2025-12-31',
      deficiencyResolutionWindow: '2026-01-15',
      sanctionOrderPeriod: 'January - March 2026',
    }),
    sourceUrl: 'https://dbttribal.gov.in/',
    lastVerifiedAt: new Date('2026-03-31T00:00:00Z'),
    active: true,
  },
  {
    code: 'TOP_CLASS',
    name: 'National Scholarship Scheme (Top Class) For Higher Education of ST Students',
    schemeType: 'CENTRAL_SECTOR',
    shortDescription: '100% Central Sector scholarship for ST students admitted to 265 Premier Institutes (IITs, IIMs, AIIMS, NITs).',
    detailedDescription:
      'This is a Central Sector Scheme fully funded and implemented by the Central Government (Ministry of Tribal Affairs). Scholarship is awarded to all eligible ST fresh students admitted to prescribed undergraduate and postgraduate courses in any of the 265 Premier Institutes across the country (such as Indian Institutes of Technology, Indian Institutes of Management, All India Institute of Medical Sciences, National Institutes of Technology, National Law Universities, etc.) identified by the Ministry. The scholarship continues for the entire duration of the course subject to satisfactory annual progress.',
    eligibility:
      '1. Must be a Scheduled Tribe (ST) student.\n2. Must have secured admission into one of the 265 notified Premier Institutes.\n3. Total family income from all sources must not exceed Rs. 6.00 lakhs per annum.\n4. Available to all eligible fresh students gaining admission each academic year.',
    benefits:
      '1. Full tuition fee and non-refundable mandatory fees charged by the Premier Institute (up to statutory ceilings or actuals for Govt institutions).\n2. Living expenses allowance of ₹3,000/- per month (₹36,000/- per year).\n3. Books and stationery assistance of ₹5,000/- per annum.\n4. One-time computer / laptop grant of ₹45,000/- with accessories for the entire course.',
    applicationProcess:
      '1. Student applies on National Scholarship Portal (scholarships.gov.in).\n2. Institute Nodal Officer verifies admission, category, and fee details on NSP.\n3. Ministry of Tribal Affairs scrutinizes and issues central sanction order.\n4. Direct electronic transfer of institutional fees to institute and living allowances to student.',
    requiredDocuments: JSON.stringify([
      { name: 'ST Caste Certificate', description: 'Certified tribal certificate' },
      { name: 'Income Certificate', description: 'Annual family income certificate <= ₹6.00 Lakh' },
      { name: 'Premier Institute Admission Letter', description: 'Allotment letter from JEE/NEET/CAT/CLAT or Institute' },
      { name: 'Institutional Fee Structure Demand', description: 'Official fee breakdown from IIT/NIT/AIIMS/IIM' },
      { name: 'Class XII Marksheet', description: 'Higher secondary certificate' },
    ]),
    importantDates: JSON.stringify({
      portalOpening: '2025-08-01',
      applicationDeadline: '2025-11-15',
      meritListFinalization: '2025-12-20',
      sanctionIssuance: '2026-01-20',
    }),
    sourceUrl: 'https://scholarships.gov.in',
    lastVerifiedAt: new Date('2026-03-31T00:00:00Z'),
    active: true,
  },
  {
    code: 'NFST',
    name: 'National Fellowship Scheme for Higher Education of ST Students',
    schemeType: 'CENTRAL_SECTOR',
    shortDescription: 'Fellowship for ST scholars pursuing full-time regular M.Phil and Ph.D degrees in universities and INIs.',
    detailedDescription:
      'This is a Central Sector Scheme fully funded and directly implemented by the Ministry of Tribal Affairs for ST scholars pursuing regular M.Phil and Ph.D in UGC recognized universities (under Section 2(f)/12(B) or 3 of UGC Act), Government funded institutions, and Institutes of National Importance (INIs). A total of 750 fresh fellowships are awarded every year based on merit from Master’s degree scores and UGC-NET / CSIR-NET / JRF qualifications, with statutory preference to girl candidates, Divyangjan, and Particularly Vulnerable Tribal Groups (PVTGs).',
    eligibility:
      '1. ST candidate who has passed Post-Graduation with minimum prescribed marks.\n2. Must have registered/admitted in regular M.Phil or Ph.D course in a recognized university/institution.\n3. Selection on merit; preference accorded to girls, Divyangjan, and PVTG scholars.\n4. Scholar must not be availing any other fellowship (e.g. UGC JRF/CSIR/ICAR).',
    benefits:
      '1. Fellowship: ₹25,000/- per month for M.Phil / initial 2 years JRF, and ₹28,000/- to ₹35,000/- per month for Ph.D / SRF (as revised).\n2. Contingency Grant: Humanities & Social Sciences ₹10,000 to ₹20,500/year; Science/Engineering ₹12,000 to ₹25,000/year.\n3. House Rent Allowance (HRA) as per Central Government rates applicable to university city.\n4. Reader/Escort assistance of ₹2,000/month for physically handicapped/visually impaired scholars.',
    applicationProcess:
      '1. Online submission through fellowship.tribal.gov.in.\n2. University Research Supervisor and Registrar verification.\n3. National Selection Committee prepares inter-se merit list of 750 fellows.\n4. Canara Bank DBT portal integration for direct monthly stipend credit.',
    requiredDocuments: JSON.stringify([
      { name: 'ST Certificate', description: 'Mandatory caste certificate' },
      { name: 'Master’s Degree Marksheet & Degree', description: 'Certified postgraduate credentials' },
      { name: 'M.Phil / Ph.D Admission & Joining Letter', description: 'Official registration notification from University' },
      { name: 'Research Proposal Synopsis', description: 'Approved synopsis signed by Research Guide' },
      { name: 'PVTG Certificate (if applicable)', description: 'District Magistrate certification for PVTG quota' },
    ]),
    importantDates: JSON.stringify({
      portalOpening: '2025-06-01',
      applicationDeadline: '2025-09-30',
      provisionalMeritList: '2025-11-15',
      awardLetterIssuance: '2025-12-10',
    }),
    sourceUrl: 'https://fellowship.tribal.gov.in/',
    lastVerifiedAt: new Date('2026-03-31T00:00:00Z'),
    active: true,
  },
  {
    code: 'NOS',
    name: 'National Overseas Scholarship (NOS) Scheme for ST Students',
    schemeType: 'CENTRAL_SECTOR',
    shortDescription: 'Scholarship for meritorious ST students to pursue Post-Graduation, Ph.D., and Post-Doctoral studies abroad.',
    detailedDescription:
      'The National Overseas Scholarship Scheme provides financial assistance to meritorious ST students selected to pursue Post-Graduation (Master’s), Ph.D., and Post-Doctoral research abroad in top-tier accredited international institutions. A total of 20 awards are sanctioned every year, of which 17 awards are allocated for Scheduled Tribes and 3 awards are strictly reserved for students belonging to Particularly Vulnerable Tribal Groups (PVTGs). Selection is conducted by an Expert Committee based on an interview merit evaluation. The selected student is given up to 2 years to gain admission into a recognized foreign university.',
    eligibility:
      '1. ST applicant possessing at least 55% marks or equivalent grade in relevant qualifying degree.\n2. Total parental/family income from all sources must not exceed Rs. 6.00 lakhs per annum.\n3. Age limit: Under 35 years as on 1st July of selection year.\n4. Unconditional admission offer in foreign university ranked within global standards.',
    benefits:
      '1. Complete tuition fees paid directly to international university.\n2. Annual Maintenance Allowance: USD 15,400 for USA and other countries, or GBP 9,900 for the United Kingdom.\n3. Contingency Allowance: USD 1,532 or GBP 1,116 per annum.\n4. Economy class air passage to the country of study and back to India upon completion.\n5. Visa fees, medical insurance premium, and incidental journey allowances.',
    applicationProcess:
      '1. Online application via overseas.tribal.gov.in.\n2. Document validation including passport, visa eligibility, and foreign offer.\n3. Interview evaluation by MoTA National Expert Selection Committee.\n4. Provisional Award Letter issued; funds disbursed through Indian Missions abroad via Ministry of External Affairs.',
    requiredDocuments: JSON.stringify([
      { name: 'ST / PVTG Certificate', description: 'Certified tribal identification certificate' },
      { name: 'Income Certificate', description: 'Family income certificate <= ₹6.00 Lakh/year' },
      { name: 'Unconditional Admission Offer Letter', description: 'Offer letter from top-ranked foreign institution' },
      { name: 'Valid Indian Passport', description: 'Passport with at least 2 years validity' },
      { name: 'Language Proficiency Scorecard', description: 'IELTS / TOEFL / GRE / GMAT test results' },
    ]),
    importantDates: JSON.stringify({
      portalOpening: '2025-05-01',
      applicationDeadline: '2025-07-15',
      expertInterviews: 'August 2025',
      awardListPublished: '2025-09-30',
    }),
    sourceUrl: 'https://overseas.tribal.gov.in/',
    lastVerifiedAt: new Date('2026-03-31T00:00:00Z'),
    active: true,
  },
];
