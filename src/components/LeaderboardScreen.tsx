// Leaderboard Screen Component
// Public leaderboard interface with filters and rankings

import React, { useState, useEffect } from 'react';
import { Container } from './ui/Container';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { TabBar } from './ui/TabBar';
// Use mock service for development
import { mockSuccessEventsService as successEventsService } from '../services/mockSuccessEventsService';
import type { 
  Leaderboard, 
  LeaderboardEntry, 
  SuccessCategory,
  PersonalStats 
} from '../types/successEvents';

interface LeaderboardScreenProps {
  currentUserId?: string;
}

type TimeframeFilter = 'daily' | 'weekly' | 'monthly' | 'all_time';
type CategoryFilter = 'overall' | 'learning' | 'focus' | 'streak';

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ currentUserId }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeFilter>('weekly');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('overall');
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [personalStats, setPersonalStats] = useState<PersonalStats | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScoringModal, setShowScoringModal] = useState(false);

  const timeframeTabs = [
    { id: 'daily', label: 'วันนี้', icon: '📅' },
    { id: 'weekly', label: 'สัปดาห์นี้', icon: '📊' },
    { id: 'monthly', label: 'เดือนนี้', icon: '📈' },
    { id: 'all_time', label: 'ตลอดกาล', icon: '🏆' }
  ];

  const categoryTabs = [
    { id: 'overall', label: 'รวม', icon: '🎯' },
    { id: 'learning', label: 'เรียน', icon: '📚' },
    { id: 'focus', label: 'โฟกัส', icon: '🎯' },
    { id: 'streak', label: 'ต่อเนื่อง', icon: '🔥' }
  ];

  useEffect(() => {
    loadLeaderboardData();
  }, [selectedTimeframe, selectedCategory]);

  useEffect(() => {
    if (currentUserId) {
      loadPersonalStats();
    }
  }, [currentUserId, selectedTimeframe]);

  const loadLeaderboardData = async () => {
    setLoading(true);
    try {
      let categoryToLoad: SuccessCategory;
      
      if (selectedCategory === 'overall') {
        // For overall, we'll combine all categories or use learning as primary
        categoryToLoad = 'learning';
      } else {
        categoryToLoad = selectedCategory as SuccessCategory;
      }

      const data = await successEventsService.getLeaderboard(categoryToLoad, selectedTimeframe);
      setLeaderboard(data);

      // Get user rank if logged in
      if (currentUserId) {
        const rank = await successEventsService.getUserRank(currentUserId, categoryToLoad, selectedTimeframe);
        setUserRank(rank);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalStats = async () => {
    if (!currentUserId) return;

    try {
      const stats = await successEventsService.getPersonalStats(
        currentUserId, 
        selectedTimeframe === 'daily' ? 'day' : 
        selectedTimeframe === 'weekly' ? 'week' :
        selectedTimeframe === 'monthly' ? 'month' : 'all_time'
      );
      setPersonalStats(stats);
    } catch (error) {
      console.error('Failed to load personal stats:', error);
    }
  };

  const formatPoints = (points: number): string => {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`;
    } else if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`;
    }
    return points.toString();
  };

  const getRankIcon = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1: return 'text-yellow-600';
      case 2: return 'text-gray-500';
      case 3: return 'text-amber-600';
      default: return 'text-blue-600';
    }
  };

  if (loading) {
    return (
      <Container className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">กำลังโหลดอันดับ...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 อันดับผู้เรียน</h1>
        <p className="text-gray-600">ดูอันดับและความสำเร็จของผู้เรียนทั้งหมด</p>
      </div>

      {/* Timeframe Filter */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">ช่วงเวลา</h3>
        <TabBar
          tabs={timeframeTabs}
          activeTab={selectedTimeframe}
          onTabChange={(tab) => setSelectedTimeframe(tab as TimeframeFilter)}
        />
      </Card>

      {/* Category Filter */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">หมวดหมู่</h3>
        <TabBar
          tabs={categoryTabs}
          activeTab={selectedCategory}
          onTabChange={(tab) => setSelectedCategory(tab as CategoryFilter)}
        />
      </Card>

      {/* Personal Rank Card (if logged in) */}
      {currentUserId && personalStats && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">อันดับของฉัน</h3>
              <div className="flex items-center space-x-4 mt-2">
                <div className="text-2xl font-bold text-blue-600">
                  {userRank ? `#${userRank}` : 'ไม่อยู่ใน Top 100'}
                </div>
                <div className="text-sm text-blue-700">
                  {formatPoints(personalStats.totalPoints)} คะแนน
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-700">เลเวล {personalStats.levelProgress.currentLevel}</div>
              <div className="text-xs text-blue-600">
                {Math.round(personalStats.levelProgress.progress)}% ไปเลเวลถัดไป
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Top 3 Hero Cards */}
      {leaderboard && leaderboard.entries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leaderboard.entries.slice(0, 3).map((entry, index) => (
            <Card 
              key={entry.userId} 
              className={`p-6 text-center ${
                index === 0 ? 'bg-gradient-to-b from-yellow-50 to-yellow-100 border-yellow-300' :
                index === 1 ? 'bg-gradient-to-b from-gray-50 to-gray-100 border-gray-300' :
                'bg-gradient-to-b from-amber-50 to-amber-100 border-amber-300'
              }`}
            >
              <div className="text-4xl mb-2">{getRankIcon(entry.rank)}</div>
              <div className={`text-2xl font-bold ${getRankColor(entry.rank)} mb-1`}>
                #{entry.rank}
              </div>
              <div className="font-semibold text-gray-900 mb-2">
                {entry.displayName || entry.username}
              </div>
              <div className="text-lg font-bold text-gray-700">
                {formatPoints(entry.points)} คะแนน
              </div>
              {entry.change && (
                <div className={`text-sm mt-1 ${
                  entry.change > 0 ? 'text-green-600' : 
                  entry.change < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {entry.change > 0 ? '↗️' : entry.change < 0 ? '↘️' : '➡️'} 
                  {Math.abs(entry.change)} อันดับ
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">อันดับทั้งหมด</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowScoringModal(true)}
          >
            อธิบายวิธีคิดคะแนน
          </Button>
        </div>

        {leaderboard && leaderboard.entries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">อันดับ</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">ผู้เรียน</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">คะแนน</th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700">เปลี่ยนแปลง</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.entries.map((entry) => (
                  <tr 
                    key={entry.userId}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      entry.isCurrentUser ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getRankIcon(entry.rank)}</span>
                        <span className={`font-bold ${getRankColor(entry.rank)}`}>
                          #{entry.rank}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-3">
                        {entry.avatar ? (
                          <img 
                            src={entry.avatar} 
                            alt={entry.displayName || entry.username}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {(entry.displayName || entry.username).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">
                            {entry.displayName || entry.username}
                            {entry.isCurrentUser && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                คุณ
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="font-bold text-lg text-gray-900">
                        {formatPoints(entry.points)}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      {entry.change !== undefined && (
                        <div className={`inline-flex items-center space-x-1 text-sm ${
                          entry.change > 0 ? 'text-green-600' : 
                          entry.change < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          <span>
                            {entry.change > 0 ? '↗️' : entry.change < 0 ? '↘️' : '➡️'}
                          </span>
                          <span>{Math.abs(entry.change)}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">ยังไม่มีข้อมูลอันดับ</h3>
            <p className="text-gray-500">เริ่มเรียนเพื่อปรากฏในอันดับ!</p>
          </div>
        )}
      </Card>

      {/* Personal Performance Summary */}
      {currentUserId && personalStats && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">สถิติส่วนตัว</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatPoints(personalStats.totalPoints)}
              </div>
              <div className="text-sm text-gray-600">คะแนนรวม</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {personalStats.sessionsCompleted}
              </div>
              <div className="text-sm text-gray-600">เซสชันเสร็จ</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(personalStats.averageScore)}%
              </div>
              <div className="text-sm text-gray-600">คะแนนเฉลี่ย</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {personalStats.currentStreak}
              </div>
              <div className="text-sm text-gray-600">วันต่อเนื่อง</div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                เลเวล {personalStats.levelProgress.currentLevel}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(personalStats.levelProgress.progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${personalStats.levelProgress.progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatPoints(personalStats.levelProgress.currentXP)} / {formatPoints(personalStats.levelProgress.nextLevelXP)} XP
            </div>
          </div>
        </Card>
      )}

      {/* Recent Achievements */}
      {personalStats && personalStats.recentAchievements.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">ความสำเร็จล่าสุด</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {personalStats.recentAchievements.map((achievement) => (
              <div 
                key={achievement.id}
                className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <div className="font-semibold text-gray-900">{achievement.name}</div>
                  <div className="text-sm text-gray-600">{achievement.description}</div>
                  <div className="text-xs text-orange-600 font-medium">
                    +{achievement.points} คะแนน
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Scoring Explanation Modal */}
      {showScoringModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">🎯 วิธีคิดคะแนน</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowScoringModal(false)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                {/* Base Points */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">คะแนนพื้นฐาน</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>ทำควิซเสร็จ</span>
                      <span className="font-semibold">50 คะแนน</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>คะแนนเต็ม</span>
                      <span className="font-semibold">200 คะแนน</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>โฟกัสเสร็จ</span>
                      <span className="font-semibold">25 คะแนน</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>ต่อเนื่องรายวัน</span>
                      <span className="font-semibold">15 คะแนน</span>
                    </div>
                  </div>
                </div>

                {/* Multipliers */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">ตัวคูณคะแนน</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">ความยาก</h4>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">A1/N5: 1.0x</span>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">B1/N3: 1.3x</span>
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">C1/N2: 1.8x</span>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded">C2/N1: 2.0x</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">ความต่อเนื่อง</h4>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">7 วัน: 1.2x</span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">30 วัน: 1.5x</span>
                        <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded">100 วัน: 2.0x</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">เวลา</h4>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">เช้า: 1.1x</span>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">กลางวัน: 1.0x</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">กลางคืน: 0.9x</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Bonus */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">โบนัสคะแนน</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>โบนัสความแม่นยำ:</strong> +5 คะแนนทุก 10% ของคะแนนที่ได้
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      ตอบถูก 90% = +45 คะแนนโบนัส
                    </p>
                  </div>
                </div>

                {/* Example Calculation */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">ตัวอย่างการคำนวณ</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>ควิซ C2 ระดับ, คะแนน 90%, ต่อเนื่อง 7 วัน, เวลาเช้า:</strong>
                    </p>
                    <div className="text-xs text-blue-700 space-y-1">
                      <div>• คะแนนพื้นฐาน: 50</div>
                      <div>• โบนัสความแม่นยำ: +45 (90% × 5)</div>
                      <div>• ตัวคูณความยาก: ×2.0 (C2)</div>
                      <div>• ตัวคูณต่อเนื่อง: ×1.2 (7 วัน)</div>
                      <div>• ตัวคูณเวลา: ×1.1 (เช้า)</div>
                      <div className="border-t pt-1 font-semibold">
                        = (50 + 45) × 2.0 × 1.2 × 1.1 = <strong>251 คะแนน</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>อันดับอัปเดตทุก 15 นาที • แสดงผู้เรียน Top 100</p>
        <p className="mt-1">
          อัปเดตล่าสุด: {leaderboard ? new Date(leaderboard.lastUpdated).toLocaleString('th-TH') : 'ไม่ทราบ'}
        </p>
      </div>
    </Container>
  );
};