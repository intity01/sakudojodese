// Simple translation hook for Thai/English support

interface Translations {
  [key: string]: {
    th: string;
    en: string;
  };
}

const translations: Translations = {
  tagline: {
    th: 'แพลตฟอร์มเรียนภาษาฟรี',
    en: 'Free Language Learning Platform'
  },
  settings: {
    th: 'การตั้งค่า',
    en: 'Settings'
  },
  progress: {
    th: 'ความคืบหน้า',
    en: 'Progress'
  },
  start: {
    th: 'เริ่มเรียน',
    en: 'Start Learning'
  },
  quiz: {
    th: 'แบบทดสอบ',
    en: 'Quiz'
  },
  study: {
    th: 'ศึกษา',
    en: 'Study'
  },
  exam: {
    th: 'สอบ',
    en: 'Exam'
  },
  read: {
    th: 'อ่าน',
    en: 'Read'
  },
  write: {
    th: 'เขียน',
    en: 'Write'
  },
  english: {
    th: 'ภาษาอังกฤษ',
    en: 'English'
  },
  japanese: {
    th: 'ภาษาญี่ปุ่น',
    en: 'Japanese'
  },
  beginner: {
    th: 'เริ่มต้น',
    en: 'Beginner'
  },
  intermediate: {
    th: 'กลาง',
    en: 'Intermediate'
  },
  advanced: {
    th: 'สูง',
    en: 'Advanced'
  },
  expert: {
    th: 'ผู้เชี่ยวชาญ',
    en: 'Expert'
  },
  score: {
    th: 'คะแนน',
    en: 'Score'
  },
  correct: {
    th: 'ถูก',
    en: 'Correct'
  },
  incorrect: {
    th: 'ผิด',
    en: 'Incorrect'
  },
  total: {
    th: 'รวม',
    en: 'Total'
  },
  next: {
    th: 'ถัดไป',
    en: 'Next'
  },
  previous: {
    th: 'ก่อนหน้า',
    en: 'Previous'
  },
  skip: {
    th: 'ข้าม',
    en: 'Skip'
  },
  finish: {
    th: 'เสร็จสิ้น',
    en: 'Finish'
  },
  back: {
    th: 'กลับ',
    en: 'Back'
  },
  save: {
    th: 'บันทึก',
    en: 'Save'
  },
  cancel: {
    th: 'ยกเลิก',
    en: 'Cancel'
  },
  loading: {
    th: 'กำลังโหลด...',
    en: 'Loading...'
  },
  error: {
    th: 'เกิดข้อผิดพลาด',
    en: 'An error occurred'
  }
};

type Language = 'th' | 'en';

export const useTranslation = () => {
  // For now, always use Thai. Can be extended to support language switching
  const currentLanguage: Language = 'th';

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[currentLanguage] || translation.th || key;
  };

  const setLanguage = (language: Language) => {
    // TODO: Implement language switching
    console.log('Language switching not yet implemented:', language);
  };

  return {
    t,
    currentLanguage,
    setLanguage
  };
};