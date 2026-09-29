import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

const translations: Translations = {
  // Brand & Header
  portalTitle: {
    en: 'MoTA Scholarship Portal',
    hi: 'जनजातीय कार्य मंत्रालय छात्रवृत्ति पोर्टल',
  },
  portalSubtitle: {
    en: 'Empowering Tribal Students Through Education',
    hi: 'शिक्षा के माध्यम से जनजातीय विद्यार्थियों का सशक्तिकरण',
  },
  govOfIndia: {
    en: 'Government of India',
    hi: 'भारत सरकार',
  },
  minOfTribalAffairs: {
    en: 'Ministry of Tribal Affairs',
    hi: 'जनजातीय कार्य मंत्रालय',
  },
  searchPlaceholder: {
    en: 'Search scholarships, schemes, or anything...',
    hi: 'छात्रवृत्ति, योजनाएं या कुछ भी खोजें...',
  },

  // Navigation
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  scholarships: { en: 'Scholarships', hi: 'छात्रवृत्ति योजनाएं' },
  applications: { en: 'Applications', hi: 'आवेदन' },
  documents: { en: 'Documents', hi: 'दस्तावेज़' },
  payments: { en: 'Payments', hi: 'भुगतान (DBT)' },
  notifications: { en: 'Notifications', hi: 'सूचनाएं' },
  chatWithJago: { en: 'Chat with JAGO', hi: 'जागो एआई से बात करें' },
  profile: { en: 'Profile', hi: 'मेरी प्रोफ़ाइल' },
  adminDashboard: { en: 'Admin Dashboard', hi: 'प्रशासक डैशबोर्ड' },
  logout: { en: 'Logout', hi: 'लॉगआउट' },

  // Sidebar Footer
  educationEmpowermentProgress: {
    en: 'Education • Empowerment • Progress',
    hi: 'शिक्षा • सशक्तिकरण • प्रगति',
  },

  // Student Dashboard
  welcomeGreeting: {
    en: 'Hello',
    hi: 'नमस्ते',
  },
  welcomeBannerTitle: {
    en: 'Welcome to MoTA Unified Scholarship Platform',
    hi: 'जनजातीय कार्य मंत्रालय एकीकृत छात्रवृत्ति मंच में आपका स्वागत है',
  },
  welcomeBannerSub: {
    en: 'Your gateway to 5 major scholarship schemes for ST students. Apply, track, and achieve your dreams.',
    hi: 'अनुसूचित जनजाति के छात्रों के लिए 5 प्रमुख छात्रवृत्ति योजनाओं का प्रवेश द्वार। आवेदन करें, ट्रैक करें और अपने सपनों को साकार करें।',
  },
  profileCompletion: {
    en: 'Your Profile Completion',
    hi: 'प्रोफ़ाइल पूर्णता',
  },
  completeProfile: {
    en: 'Complete Profile',
    hi: 'प्रोफ़ाइल पूरी करें',
  },

  // Metrics
  amountReceived: { en: 'Amount Received', hi: 'प्राप्त कुल राशि' },
  dbtLabel: { en: 'Direct Benefit Transfer (DBT)', hi: 'प्रत्यक्ष लाभ अंतरण (DBT)' },
  applicationsActive: { en: 'Applications Active', hi: 'सक्रिय आवेदन' },
  currentCycle: { en: 'Current Cycle: 2025-26', hi: 'वर्तमान सत्र: 2025-26' },
  actionRequired: { en: 'Action Required', hi: 'आवश्यक कार्रवाई' },
  allReqSatisfied: { en: 'All requirements satisfied', hi: 'सभी आवश्यकताएं पूर्ण हैं' },
  documentsUploaded: { en: 'Documents Uploaded', hi: 'अपलोड किए गए दस्तावेज़' },
  digilockerVerified: { en: 'DigiLocker & e-District Verified', hi: 'डिजिलॉकर एवं ई-डिस्ट्रिक्ट सत्यापित' },

  // Featured Schemes
  featuredSchemes: { en: 'Featured Scholarship Schemes', hi: 'प्रमुख छात्रवृत्ति योजनाएं' },
  exploreAllSchemes: {
    en: 'Explore the 5 major schemes for ST students',
    hi: 'अनुसूचित जनजाति के विद्यार्थियों के लिए 5 मुख्य योजनाओं की जानकारी लें',
  },
  viewAll: { en: 'View All', hi: 'सभी देखें' },
  applyNow: { en: 'Apply Now', hi: 'अभी आवेदन करें' },
  viewDetails: { en: 'View Details', hi: 'विवरण देखें' },

  // JAGO Helper
  needHelp: { en: 'Need Help?', hi: 'सहायता चाहिए?' },
  chatWithJagoSub: {
    en: 'Chat with JAGO - Your AI Scholarship Assistant',
    hi: 'जागो से बात करें - आपका व्यक्तिगत एआई छात्रवृत्ति सहायक',
  },
  chatNow: { en: 'Chat Now', hi: 'अभी चैट करें' },

  // Updates Ticker
  latestUpdates: { en: 'Latest Updates', hi: 'नवीनतम सूचनाएं' },
  updatesText: {
    en: 'Application window for Post-Matric Scholarship is open for 2025-26.',
    hi: 'वर्ष 2025-26 के लिए पोस्ट-मैट्रिक छात्रवृत्ति हेतु आवेदन पोर्टल खुला है।',
  },

  // Scholarships Page
  allSchemesFilter: { en: 'All (5)', hi: 'सभी (5)' },
  quickLinks: { en: 'Quick Links', hi: 'त्वरित लिंक' },
  eligibilityCriteria: { en: 'Eligibility Criteria', hi: 'पात्रता मानदंड' },
  requiredDocuments: { en: 'Required Documents', hi: 'आवश्यक दस्तावेज़' },
  applicationProcess: { en: 'Application Process', hi: 'आवेदन प्रक्रिया' },
  importantDates: { en: 'Important Dates', hi: 'महत्वपूर्ण तिथियां' },
  faqs: { en: 'FAQs', hi: 'अक्सर पूछे जाने वाले प्रश्न' },
  haveDoubts: { en: 'Have doubts?', hi: 'कोई संदेह है?' },
  quoteText: {
    en: 'Education is the key to a brighter future.',
    hi: 'शिक्षा ही उज्ज्वल भविष्य की कुंजी है।',
  },

  // Applications
  myApplications: { en: 'My Applications', hi: 'मेरे आवेदन' },
  trackStatusSub: {
    en: 'Track your application status and view details.',
    hi: 'अपने आवेदन की स्थिति ट्रैक करें और विवरण देखें।',
  },
  allFilter: { en: 'All', hi: 'सभी' },
  pendingFilter: { en: 'Pending', hi: 'लंबित' },
  underReviewFilter: { en: 'Under Review', hi: 'समीक्षाधीन' },
  approvedFilter: { en: 'Approved', hi: 'स्वीकृत' },
  rejectedFilter: { en: 'Rejected', hi: 'अस्वीकृत' },
  quickActions: { en: 'Quick Actions', hi: 'त्वरित कार्य' },
  trackStatus: { en: 'Track Status', hi: 'स्थिति देखें' },
  uploadDocuments: { en: 'Upload Documents', hi: 'दस्तावेज़ अपलोड करें' },
  viewPayments: { en: 'View Payments', hi: 'भुगतान देखें' },

  // Admin Dashboard
  totalApplications: { en: 'Total Applications', hi: 'कुल आवेदन' },
  approvedMetric: { en: 'Approved', hi: 'स्वीकृत' },
  pendingMetric: { en: 'Pending', hi: 'लंबित' },
  rejectedMetric: { en: 'Rejected', hi: 'अस्वीकृत' },
  applicationsTrend: { en: 'Applications Trend', hi: 'आवेदन रुझान' },
  schemeWiseDistribution: { en: 'Scheme-wise Distribution', hi: 'योजनावार वितरण' },
  recentApplications: { en: 'Recent Applications', hi: 'हाल के आवेदन' },
  studentName: { en: 'Student Name', hi: 'विद्यार्थी का नाम' },
  scheme: { en: 'Scheme', hi: 'योजना' },
  applicationId: { en: 'Application ID', hi: 'आवेदन संख्या' },
  status: { en: 'Status', hi: 'स्थिति' },
  date: { en: 'Date', hi: 'दिनांक' },
  verifyDocuments: { en: 'Verify Documents', hi: 'दस्तावेज़ सत्यापन' },
  processPayments: { en: 'Process Payments', hi: 'भुगतान प्रक्रिया' },
  viewReports: { en: 'View Reports', hi: 'रिपोर्ट देखें' },
  manageSchemes: { en: 'Manage Schemes', hi: 'योजना प्रबंधन' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('mota_lang');
    return saved === 'hi' ? 'hi' : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mota_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language] || translations[key].en;
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
