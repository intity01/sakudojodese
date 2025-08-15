import React, { useState } from 'react';

const PlanScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  
  // Generate week strip
  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(selectedDate);

  return (
    <div className="plan-screen">
      {/* Week Strip */}
      <div className="week-strip">
        {weekDates.map((date, index) => (
          <button
            key={date.toISOString()}
            className={`week-day ${date.toDateString() === selectedDate.toDateString() ? 'active' : ''}`}
            onClick={() => setSelectedDate(date)}
          >
            <span className="day-name">{weekDays[index]}</span>
            <span className="day-number">{date.getDate()}</span>
          </button>
        ))}
      </div>

      {/* Day Panel */}
      <div className="day-panel">
        <div className="day-header">
          <h2>{selectedDate.toLocaleDateString('th-TH', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}</h2>
        </div>

        {/* Time Blocks */}
        <div className="time-blocks">
          <div className="time-block">
            <span className="time">09:00</span>
            <div className="block-content">
              <h4>ทบทวนคำศัพท์</h4>
              <p>English CEFR B1 - Business</p>
            </div>
          </div>
          
          <div className="time-block">
            <span className="time">14:00</span>
            <div className="block-content">
              <h4>แบบฝึกหัดไวยากรณ์</h4>
              <p>Japanese JLPT N3 - Particles</p>
            </div>
          </div>
          
          <div className="time-block">
            <span className="time">19:00</span>
            <div className="block-content">
              <h4>อ่านบทความ</h4>
              <p>English Reading Comprehension</p>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="bulk-actions">
          <button className="btn btn-secondary btn-sm">เลื่อนวัน</button>
          <button className="btn btn-secondary btn-sm">ปรับ Priority</button>
          <button className="btn btn-primary btn-sm">แปลงเป็น Focus Session</button>
        </div>
      </div>
    </div>
  );
};

export default PlanScreen;