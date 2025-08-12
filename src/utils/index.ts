// Utility Functions for Saku Dojo v2
// ฟังก์ชันเครื่องมือสำหรับการประมวลผลข้อความ, จัดการอาร์เรย์, และสร้าง ID

/**
 * สร้างรหัสประจำตัวที่ไม่ซ้ำกัน
 * Generate a unique ID string
 * @returns ข้อความสุ่ม 8 ตัวอักษร / Random 8-character alphanumeric string
 */
export const uid = (): string => Math.random().toString(36).slice(2, 10);

/**
 * ทำความสะอาดข้อความให้เป็นมาตรฐานเดียวกัน
 * Normalize text for comparison and matching
 * จัดการช่องว่างแบบญี่ปุ่น, เครื่องหมายคำพูด, และตัวพิมพ์เล็ก-ใหญ่
 * Handles full-width spaces, quotes, and case normalization
 * @param s ข้อความที่ต้องการทำความสะอาด / Input string to normalize
 * @returns ข้อความที่สะอาดแล้ว / Normalized string
 */
export const normalize = (s: string): string =>
    (s || "")
        .toLowerCase() // เปลี่ยนเป็นตัวพิมพ์เล็กทั้งหมด
        .trim() // ตัดช่องว่างหน้า-หลัง
        .replace(/[\u3000\s]+/g, " ") // แปลงช่องว่างแบบญี่ปุ่นเป็นช่องว่างปกติ
        .replace(/[''`]/g, "'") // ทำให้เครื่องหมายคำพูดเป็นแบบเดียวกัน
        .normalize("NFC"); // ทำให้ Unicode เป็นมาตรฐาน

/**
 * สลับตำแหน่งในอาร์เรย์แบบสุ่ม (เหมือนสับไพ่)
 * Shuffle array using Fisher-Yates algorithm
 * ใช้อัลกอริทึม Fisher-Yates ที่มีประสิทธิภาพ
 * @param arr อาร์เรย์ที่ต้องการสลับ / Array to shuffle
 * @returns อาร์เรย์ใหม่ที่ตำแหน่งถูกสลับ (ไม่แก้ไขของเดิม) / New shuffled array (original unchanged)
 */
export const shuffle = <T>(arr: T[]): T[] => {
    const a = arr.slice(); // สร้างสำเนาใหม่
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // สุ่มตำแหน่ง
        // สลับตำแหน่งกัน (Swap)
        const temp = a[i]!;
        a[i] = a[j]!;
        a[j] = temp;
    }
    return a;
};

/**
 * ดึงวันที่ปัจจุบันในรูปแบบ ISO
 * Get current date as ISO string
 * @returns ข้อความวันที่แบบ ISO / ISO date string
 */
export const getCurrentDate = (): string => new Date().toISOString();

/**
 * คำนวณคะแนนเปอร์เซ็นต์
 * Calculate percentage score
 * สูตร: (ถูก ÷ ทั้งหมด) × 100
 * @param correct จำนวนข้อที่ถูก / Number of correct answers
 * @param total จำนวนข้อทั้งหมด / Total number of questions
 * @returns คะแนนเปอร์เซ็นต์ (ปัดเศษ) / Percentage score rounded to nearest integer
 */
export const calculateScore = (correct: number, total: number): number => {
    if (total === 0) return 0; // ถ้าไม่มีข้อสอบ ให้คะแนน 0
    return Math.round((correct / total) * 100); // คำนวณและปัดเศษ
};

/**
 * จำกัดค่าให้อยู่ในช่วงที่กำหนด (เหมือนเทอร์โมสตัท)
 * Clamp a number between min and max values
 * ถ้าต่ำเกินไป → ใช้ค่าต่ำสุด, สูงเกินไป → ใช้ค่าสูงสุด
 * @param value ค่าที่ต้องการจำกัด / Value to clamp
 * @param min ค่าต่ำสุด / Minimum value
 * @param max ค่าสูงสุด / Maximum value
 * @returns ค่าที่อยู่ในช่วงปลอดภัย / Clamped value
 */
export const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max); // เลือกค่าที่อยู่ในช่วง
};

/**
 * หน่วงเวลาการทำงาน (ป้องกันการทำงานบ่อยเกินไป)
 * Debounce function calls
 * เหมือนกดลิฟต์หลายครั้ง - รอให้หยุดกดสักพัก แล้วค่อยทำงาน
 * @param func ฟังก์ชันที่ต้องการหน่วงเวลา / Function to debounce
 * @param wait เวลารอ (มิลลิวินาที) / Wait time in milliseconds
 * @returns ฟังก์ชันใหม่ที่ทำงานช้าลง / Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout); // ยกเลิกการทำงานครั้งก่อน
        timeout = setTimeout(() => func(...args), wait); // ตั้งเวลาใหม่
    };
};

/**
 * จำกัดความถี่การทำงาน (ทำงานได้ครั้งละ 1 ครั้งในช่วงเวลาที่กำหนด)
 * Throttle function calls
 * เหมือนปืนที่ยิงได้ทีละนัด - ต้องรอให้พร้อมก่อนยิงครั้งต่อไป
 * @param func ฟังก์ชันที่ต้องการจำกัดความถี่ / Function to throttle
 * @param limit ช่วงเวลาจำกัด (มิลลิวินาที) / Time limit in milliseconds
 * @returns ฟังก์ชันที่ถูกจำกัดความถี่ / Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean; // ตัวแปรเช็คว่ากำลังรออยู่หรือไม่
    return (...args: Parameters<T>) => {
        if (!inThrottle) { // ถ้าไม่ได้รออยู่
            func(...args); // ทำงานทันที
            inThrottle = true; // เริ่มรอ
            setTimeout(() => (inThrottle = false), limit); // หยุดรอเมื่อครบเวลา
        }
    };
};

/**
 * คัดลอกข้อมูลแบบลึก (รวมข้อมูลข้างในด้วย)
 * Deep clone an object
 * เหมือนถ่ายเอกสารที่มีหลายหน้า - ได้สำเนาครบทุกหน้า
 * @param obj ข้อมูลที่ต้องการคัดลอก / Object to clone
 * @returns ข้อมูลสำเนาใหม่ / Deep cloned object
 */
export const deepClone = <T>(obj: T): T => {
    if (obj === null || typeof obj !== "object") return obj; // ถ้าไม่ใช่ object ให้คืนค่าเดิม
    if (obj instanceof Date) return new Date(obj.getTime()) as T; // คัดลอกวันที่
    if (obj instanceof Array) return obj.map(item => deepClone(item)) as T; // คัดลอกอาร์เรย์
    if (typeof obj === "object") {
        const cloned = {} as T; // สร้าง object ใหม่
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                cloned[key] = deepClone(obj[key]); // คัดลอกแต่ละ property แบบลึก
            }
        }
        return cloned;
    }
    return obj;
};

/**
 * แปลง JSON แบบปลอดภัย (มีค่าสำรอง)
 * Safe JSON parse with fallback
 * ถ้าแปลงไม่ได้ จะใช้ค่าสำรองแทน
 * @param json ข้อความ JSON ที่ต้องการแปลง / JSON string to parse
 * @param fallback ค่าสำรองถ้าแปลงไม่ได้ / Fallback value if parsing fails
 * @returns ข้อมูลที่แปลงแล้ว หรือค่าสำรอง / Parsed object or fallback
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
    try {
        return JSON.parse(json) as T; // พยายามแปลง JSON
    } catch {
        return fallback; // ถ้าแปลงไม่ได้ ใช้ค่าสำรอง
    }
};

/**
 * สร้าง ID แบบปลอดภัยมากขึ้น (ใช้ crypto API)
 * Generate a more secure random ID using crypto API when available
 * ถ้ามี crypto API จะใช้ ถ้าไม่มีจะใช้วิธีธรรมดา
 * @returns รหัสสุ่มที่ปลอดภัย / Random ID string
 */
export const secureUid = (): string => {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const array = new Uint8Array(6); // สร้างอาร์เรย์ 6 ตัว
        crypto.getRandomValues(array); // สุ่มค่าแบบปลอดภัย
        return Array.from(array, byte => byte.toString(36)).join(''); // แปลงเป็นข้อความ
    }
    return uid(); // ถ้าไม่มี crypto ใช้วิธีธรรมดา
};

/**
 * จัดรูปแบบวันที่สำหรับแสดงผล
 * Format date for display
 * แปลงวันที่เป็นรูปแบบที่อ่านง่าย เช่น "Jan 15, 2024"
 * @param date วันที่ (ข้อความหรือ Date object) / Date to format
 * @param locale รูปแบบภาษา (ค่าเริ่มต้น: en-US) / Locale for formatting
 * @returns วันที่ในรูปแบบที่จัดแล้ว / Formatted date string
 */
export const formatDate = (date: string | Date, locale = 'en-US'): string => {
    const d = typeof date === 'string' ? new Date(date) : date; // แปลงเป็น Date object
    return d.toLocaleDateString(locale, {
        year: 'numeric', // ปี 4 หลัก
        month: 'short',  // เดือนแบบย่อ
        day: 'numeric'   // วันเป็นตัวเลข
    });
};

/**
 * ตรวจสอบรูปแบบอีเมล
 * Validate email format
 * @param email ข้อความอีเมลที่ต้องการตรวจสอบ / Email string to validate
 * @returns true ถ้ารูปแบบถูกต้อง / True if valid email format
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // รูปแบบอีเมลพื้นฐาน
    return emailRegex.test(email); // ทดสอบว่าตรงกับรูปแบบหรือไม่
};

/**
 * ทำความสะอาด HTML เพื่อป้องกัน XSS
 * Sanitize HTML content to prevent XSS
 * แปลงโค้ด HTML ที่อันตรายให้เป็นข้อความธรรมดา
 * @param html ข้อความ HTML ที่ต้องการทำความสะอาด / HTML string to sanitize
 * @returns ข้อความ HTML ที่ปลอดภัย / Sanitized HTML string
 */
export const sanitizeHtml = (html: string): string => {
    const div = document.createElement('div'); // สร้าง element ชั่วคราว
    div.textContent = html; // ใส่ข้อความ (จะแปลง HTML tags เป็นข้อความ)
    return div.innerHTML; // ดึงผลลัพธ์ที่ปลอดภัย
};

/**
 * ตรวจสอบว่าข้อความว่างหรือมีแต่ช่องว่าง
 * Check if string is empty or only whitespace
 * @param str ข้อความที่ต้องการตรวจสอบ / String to check
 * @returns true ถ้าว่างหรือมีแต่ช่องว่าง / True if empty or whitespace only
 */
export const isEmpty = (str: string | null | undefined): boolean => {
    return !str || str.trim().length === 0; // ไม่มีข้อความ หรือ ตัดช่องว่างแล้วยาว 0
};

/**
 * ตัดข้อความให้สั้นลงพร้อมใส่จุดไข่ปลา
 * Truncate string to specified length with ellipsis
 * ถ้าข้อความยาวเกินไป จะตัดและใส่ "..." ท้าย
 * @param str ข้อความที่ต้องการตัด / String to truncate
 * @param length ความยาวสูงสุด / Maximum length
 * @returns ข้อความที่ตัดแล้ว / Truncated string
 */
export const truncate = (str: string, length: number): string => {
    if (str.length <= length) return str; // ถ้าสั้นกว่าที่กำหนด ไม่ต้องตัด
    return str.slice(0, length - 3) + '...'; // ตัดและใส่จุดไข่ปลา
};

/**
 * แปลงข้อความเป็น Title Case (ตัวแรกของแต่ละคำเป็นตัวใหญ่)
 * Convert string to title case
 * เช่น "hello world" → "Hello World"
 * @param str ข้อความที่ต้องการแปลง / String to convert
 * @returns ข้อความแบบ Title Case / Title case string
 */
export const toTitleCase = (str: string): string => {
    return str.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase() // ใช้ substring แทน substr
    );
};