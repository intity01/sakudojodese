// Thai Time Parser - Kiro Spec Compliant
// รูปแบบ: TITLE DURATION WHEN [TIME] [#TAGS] [!PRIORITY] [@ENERGY] [dep:ID|->ID] [by DATE|by weekday|within X days]

export interface ParsedTask {
  title: string;
  duration: number; // minutes
  date: Date;
  time?: string;
  tags: string[];
  priority?: 'low' | 'medium' | 'high';
  energy?: 'low' | 'medium' | 'high';
  dependencies?: string[];
  deadline?: Date;
}

// วลีเวลาภาษาไทย
const TIME_PHRASES = {
  // ช่วงเวลา
  'เช้านี้': '09:00',
  'เย็นนี้': '18:00', 
  'คืนนี้': '21:00',
  'บ่ายนี้': '15:00',
  'เที่ยง': '12:00',
  'หัวค่ำ': '19:00',
  'เช้ามืด': '05:00',
  
  // พรุ่งนี้+
  'พรุ่งนี้เช้า': '09:00',
  'พรุ่งนี้เย็น': '18:00',
  'พรุ่งนี้เที่ยง': '12:00',
  'พรุ่งนี้เช้ามืด': '05:00'
};

const DATE_PHRASES = {
  // วัน
  'วันนี้': 0,
  'พรุ่งนี้': 1,
  'มะรืนนี้': 2,
  
  // สัปดาห์
  'จันทร์หน้า': getNextWeekday(1),
  'อังคารหน้า': getNextWeekday(2),
  'พุธหน้า': getNextWeekday(3),
  'พฤหัสหน้า': getNextWeekday(4),
  'ศุกร์หน้า': getNextWeekday(5),
  'เสาร์หน้า': getNextWeekday(6),
  'อาทิตย์หน้า': getNextWeekday(0),
  
  // เดือน
  'สิ้นเดือนนี้': getEndOfMonth(),
  'ต้นสัปดาห์หน้า': getNextWeekStart(),
  'ต้นเดือนหน้า': getNextMonthStart(),
  'ปลายเดือนหน้า': getNextMonthEnd()
};

function getNextWeekday(targetDay: number): number {
  const today = new Date();
  const currentDay = today.getDay();
  const daysUntilTarget = (targetDay - currentDay + 7) % 7;
  return daysUntilTarget === 0 ? 7 : daysUntilTarget; // Next week, not today
}

function getEndOfMonth(): number {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return Math.ceil((lastDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getNextWeekStart(): number {
  const today = new Date();
  const currentDay = today.getDay();
  const daysUntilMonday = currentDay === 0 ? 1 : 8 - currentDay; // Next Monday
  return daysUntilMonday;
}

function getNextMonthStart(): number {
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return Math.ceil((nextMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getNextMonthEnd(): number {
  const today = new Date();
  const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  return Math.ceil((nextMonthEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function parseThaiQuickAdd(input: string): ParsedTask {
  const result: ParsedTask = {
    title: '',
    duration: 30, // default 30m
    date: new Date(), // default today
    tags: [],
    dependencies: []
  };

  let remaining = input.trim();

  // Extract tags (#tag)
  const tagMatches = remaining.match(/#(\w+)/g);
  if (tagMatches) {
    result.tags = tagMatches.map(tag => tag.substring(1));
    remaining = remaining.replace(/#\w+/g, '').trim();
  }

  // Extract priority (!high, !medium, !low)
  const priorityMatch = remaining.match(/!(high|medium|low|สูง|กลาง|ต่ำ)/i);
  if (priorityMatch) {
    const priority = priorityMatch[1].toLowerCase();
    result.priority = priority === 'สูง' ? 'high' : 
                     priority === 'กลาง' ? 'medium' : 
                     priority === 'ต่ำ' ? 'low' : priority as any;
    remaining = remaining.replace(/!(high|medium|low|สูง|กลาง|ต่ำ)/i, '').trim();
  }

  // Extract energy (@high, @medium, @low)
  const energyMatch = remaining.match(/@(high|medium|low|สูง|กลาง|ต่ำ)/i);
  if (energyMatch) {
    const energy = energyMatch[1].toLowerCase();
    result.energy = energy === 'สูง' ? 'high' : 
                   energy === 'กลาง' ? 'medium' : 
                   energy === 'ต่ำ' ? 'low' : energy as any;
    remaining = remaining.replace(/@(high|medium|low|สูง|กลาง|ต่ำ)/i, '').trim();
  }

  // Extract dependencies (dep:ID or ->ID)
  const depMatches = remaining.match(/(dep:(\w+)|->(\w+))/g);
  if (depMatches) {
    result.dependencies = depMatches.map(dep => 
      dep.startsWith('dep:') ? dep.substring(4) : dep.substring(2)
    );
    remaining = remaining.replace(/(dep:(\w+)|->(\w+))/g, '').trim();
  }

  // Extract deadline (by DATE|by weekday|within X days)
  const deadlineMatch = remaining.match(/by\s+(\w+)|within\s+(\d+)\s+days?/i);
  if (deadlineMatch) {
    if (deadlineMatch[1]) {
      // by weekday
      const weekday = deadlineMatch[1].toLowerCase();
      const daysMap: Record<string, number> = {
        'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 0,
        'จันทร์': 1, 'อังคาร': 2, 'พุธ': 3, 'พฤหัส': 4, 'ศุกร์': 5, 'เสาร์': 6, 'อาทิตย์': 0
      };
      if (daysMap[weekday] !== undefined) {
        const daysUntil = getNextWeekday(daysMap[weekday]);
        result.deadline = new Date(Date.now() + daysUntil * 24 * 60 * 60 * 1000);
      }
    } else if (deadlineMatch[2]) {
      // within X days
      const days = parseInt(deadlineMatch[2]);
      result.deadline = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
    remaining = remaining.replace(/by\s+\w+|within\s+\d+\s+days?/i, '').trim();
  }

  // Extract duration (30m, 1h, 2h30m, etc.)
  const durationMatch = remaining.match(/(\d+)([hm]|ชม|นาที)/i);
  if (durationMatch) {
    const value = parseInt(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    
    if (unit === 'h' || unit === 'ชม') {
      result.duration = value * 60;
    } else if (unit === 'm' || unit === 'นาที') {
      result.duration = value;
    }
    
    remaining = remaining.replace(/\d+[hm]|\d+(ชม|นาที)/i, '').trim();
  }

  // Extract time and date phrases
  let timeFound = false;
  let dateFound = false;

  // Check for time phrases first
  for (const [phrase, time] of Object.entries(TIME_PHRASES)) {
    if (remaining.includes(phrase)) {
      result.time = time;
      remaining = remaining.replace(phrase, '').trim();
      timeFound = true;
      
      // If it's a "พรุ่งนี้" phrase, set date to tomorrow
      if (phrase.startsWith('พรุ่งนี้')) {
        result.date = new Date(Date.now() + 24 * 60 * 60 * 1000);
        dateFound = true;
      }
      break;
    }
  }

  // Check for date phrases if not found from time phrases
  if (!dateFound) {
    for (const [phrase, daysOffset] of Object.entries(DATE_PHRASES)) {
      if (remaining.includes(phrase)) {
        result.date = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
        remaining = remaining.replace(phrase, '').trim();
        dateFound = true;
        break;
      }
    }
  }

  // Extract explicit time (9:00, 14:30, etc.)
  if (!timeFound) {
    const timeMatch = remaining.match(/(\d{1,2}):(\d{2})|(\d{1,2})\.(\d{2})/);
    if (timeMatch) {
      const hours = timeMatch[1] || timeMatch[3];
      const minutes = timeMatch[2] || timeMatch[4];
      result.time = `${hours.padStart(2, '0')}:${minutes}`;
      remaining = remaining.replace(/\d{1,2}[:.]\d{2}/, '').trim();
    }
  }

  // Remaining text is the title
  result.title = remaining.trim() || 'Untitled';

  return result;
}

// Test function
export function testThaiParser() {
  const testCases = [
    "อ่านอัลกอ 30m พรุ่งนี้ 9:00 #study !high @medium",
    "ประชุมทีม 1h เย็นนี้ #work",
    "ออกกำลังกาย 45นาที เช้าพรุ่งนี้ @high",
    "ทำการบ้าน 2ชม ศุกร์หน้า by sunday #homework !medium",
    "เรียนภาษา within 3 days dep:task1 ->task2"
  ];

  console.log('🧪 Testing Thai Quick Add Parser:');
  testCases.forEach((test, i) => {
    console.log(`\n${i + 1}. "${test}"`);
    console.log(parseThaiQuickAdd(test));
  });
}