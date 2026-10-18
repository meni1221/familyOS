import { useState } from 'react';
import { IconChevronRight, IconChevronLeft, IconPlus } from '@tabler/icons-react';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const monthName = currentDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
    days.push(
      <div
        key={day}
        className={`flex h-10 items-center justify-center rounded-4 text-sm ${
          isToday ? 'bg-forest font-bold text-white' : 'text-ink hover:bg-cream'
        }`}
      >
        {day}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">יומן משפחתי</h1>
        <button className="btn-primary btn-sm">
          <IconPlus className="h-4 w-4" />
          אירוע חדש
        </button>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={prevMonth} className="btn-ghost btn-sm">
            <IconChevronRight className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-semibold text-ink">{monthName}</h2>
          <button onClick={nextMonth} className="btn-ghost btn-sm">
            <IconChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-ink-secondary">
          {['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'].map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    </div>
  );
}
