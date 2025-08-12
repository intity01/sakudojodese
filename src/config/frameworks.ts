// Framework Configuration for Saku Dojo v2
// การตั้งค่าหลักสูตรสำหรับ Saku Dojo v2
// Defines available levels for each framework and track relationships
// กำหนดระดับที่มีในแต่ละหลักสูตรและความสัมพันธ์ระหว่างภาษา

import type { Framework, Track } from "../types/core";

// Define level types for better type safety
// กำหนดประเภทระดับเพื่อความปลอดภัยของ type
export type ClassicLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert"; // ระดับทั่วไป
export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2"; // ระดับมาตรฐานยุโรป
export type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1"; // ระดับมาตรฐานญี่ปุ่น
export type Level = ClassicLevel | CEFRLevel | JLPTLevel; // ระดับทั้งหมดรวมกัน

/**
 * การจับคู่ระดับของแต่ละหลักสูตร
 * Framework level mappings
 * กำหนดระดับที่มีในแต่ละหลักสูตรการเรียน
 * Defines the available levels for each curriculum framework
 */
export const FRAMEWORK_LEVELS = {
    Classic: ["Beginner", "Intermediate", "Advanced", "Expert"] as const, // เริ่มต้น → กลาง → สูง → ผู้เชี่ยวชาญ
    CEFR: ["A1", "A2", "B1", "B2", "C1", "C2"] as const, // มาตรฐานยุโรป: A1 (ต่ำสุด) → C2 (สูงสุด)
    JLPT: ["N5", "N4", "N3", "N2", "N1"] as const, // มาตรฐานญี่ปุ่น: N5 (ต่ำสุด) → N1 (สูงสุด)
} as const satisfies Record<Framework, readonly string[]>;

/**
 * การจับคู่ภาษากับหลักสูตร
 * Track to framework mappings
 * กำหนดว่าแต่ละภาษามีหลักสูตรอะไรบ้าง
 * Defines which frameworks are available for each language track
 */
export const TRACK_FRAMEWORKS = {
    EN: ["Classic", "CEFR"] as const, // อังกฤษ: ทั่วไป + มาตรฐานยุโรป
    JP: ["Classic", "JLPT"] as const, // ญี่ปุ่น: ทั่วไป + มาตรฐานญี่ปุ่น
} as const satisfies Record<Track, readonly Framework[]>;

/**
 * ดึงระดับที่มีในหลักสูตรที่กำหนด
 * Get available levels for a specific framework
 * @param framework หลักสูตรที่ต้องการดูระดับ / The framework to get levels for
 * @returns อาร์เรย์ของระดับ / Array of level strings
 */
export const getFrameworkLevels = (framework: Framework): readonly string[] => {
    return FRAMEWORK_LEVELS[framework] ?? []; // คืนค่าระดับ หรือ อาร์เรย์ว่างถ้าไม่มี
};

/**
 * Get available frameworks for a specific track
 * @param track The track to get frameworks for
 * @returns Array of framework strings
 */
export const getTrackFrameworks = (track: Track): readonly Framework[] => {
    return TRACK_FRAMEWORKS[track] ?? [];
};

/**
 * Check if a framework is valid for a given track
 * @param track The language track
 * @param framework The framework to validate
 * @returns True if framework is valid for track
 */
export const isValidFrameworkForTrack = (track: Track, framework: Framework): boolean => {
    return TRACK_FRAMEWORKS[track].some(f => f === framework);
};

/**
 * Check if a level is valid for a given framework
 * @param framework The framework
 * @param level The level to validate
 * @returns True if level is valid for framework
 */
export const isValidLevelForFramework = (framework: Framework, level: string): boolean => {
    return FRAMEWORK_LEVELS[framework].some(l => l === level);
};

/**
 * Get the first (default) level for a framework
 * @param framework The framework
 * @returns First level string
 */
export const getDefaultLevel = (framework: Framework): string => {
    return FRAMEWORK_LEVELS[framework][0];
};

/**
 * Get the first (default) framework for a track
 * @param track The track
 * @returns First framework or "Classic" as fallback
 */
export const getDefaultFramework = (track: Track): Framework => {
    const frameworks = TRACK_FRAMEWORKS[track];
    return frameworks?.[0] ?? "Classic";
};

/**
 * Get the next level in a framework sequence
 * @param framework The framework
 * @param currentLevel The current level
 * @returns Next level or current level if at end
 */
export const getNextLevel = (framework: Framework, currentLevel: string): string => {
    const levels = FRAMEWORK_LEVELS[framework] as readonly string[];
    if (!levels) return currentLevel;

    const currentIndex = levels.indexOf(currentLevel);
    if (currentIndex === -1 || currentIndex === levels.length - 1) {
        return currentLevel;
    }

    return levels[currentIndex + 1] ?? currentLevel;
};

/**
 * Get the previous level in a framework sequence
 * @param framework The framework
 * @param currentLevel The current level
 * @returns Previous level or current level if at beginning
 */
export const getPreviousLevel = (framework: Framework, currentLevel: string): string => {
    const levels = FRAMEWORK_LEVELS[framework] as readonly string[];
    if (!levels) return currentLevel;

    const currentIndex = levels.indexOf(currentLevel);
    if (currentIndex <= 0) {
        return currentLevel;
    }

    return levels[currentIndex - 1] ?? currentLevel;
};