'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Video, CheckCircle2, ChevronLeft, ChevronRight, User } from 'lucide-react';
import moment from 'moment';

/**
 * Interactive Calendar & Events Timeline Widget
 * Designed based on Image 2 reference UI:
 * - Top Horizontal Month Selector (JANUARY ... DECEMBER)
 * - 7-Day Week Header (S M T W T F S)
 * - Interactive 31-Day Month Grid with day event indicator dots
 * - Day Schedule Sheet showing timeline events with time badges
 */
export default function InteractiveCalendarWidget({ approvedBookings = [], theme = 'dark', formatIST, getYouTubeThumbnail }) {
  const [currentMonthDate, setCurrentMonthDate] = useState(moment().startOf('month'));
  const [selectedDayNumber, setSelectedDayNumber] = useState(moment().date());

  const monthsList = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", 
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];

  const currentMonthIndex = currentMonthDate.month();
  const currentYear = currentMonthDate.year();
  const daysInMonth = currentMonthDate.daysInMonth();
  const firstDayOfWeek = currentMonthDate.startOf('month').day(); // 0 = Sunday

  // Generate calendar grid days array
  const calendarDays = [];
  // Empty slots before 1st day of month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push({ isPadding: true, day: null });
  }
  // Days 1 to daysInMonth
  for (let d = 1; d <= daysInMonth; d++) {
    const dayMoment = moment(currentMonthDate).date(d);
    // Find bookings on this specific day
    const dayBookings = approvedBookings.filter(b => {
      const bDate = moment(b.start_time);
      return bDate.isSame(dayMoment, 'day');
    });

    calendarDays.push({
      isPadding: false,
      day: d,
      moment: dayMoment,
      bookingsCount: dayBookings.length,
      hasLiveStream: dayBookings.some(b => b.youtube_live_url || b.items?.requirements?.["Live Streaming Setup"])
    });
  }

  const handleMonthChange = (monthIdx) => {
    const newDate = moment().year(currentYear).month(monthIdx).startOf('month');
    setCurrentMonthDate(newDate);
    setSelectedDayNumber(1);
  };

  const selectedDateMoment = moment(currentMonthDate).date(selectedDayNumber);
  const selectedDayBookings = approvedBookings.filter(b => moment(b.start_time).isSame(selectedDateMoment, 'day'));

  return (
    <div className={`rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all ${theme === 'light' ? 'bg-gradient-to-br from-amber-100/90 via-amber-50 to-orange-100/80 border-amber-300/80 text-amber-950 shadow-amber-500/10' : 'bg-stone-950/90 border-stone-800 text-white'}`}>
      
      {/* HEADER: TITLE & YEAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-amber-500/20">
        <div>
          <h3 className={`text-xl font-black uppercase tracking-tight flex items-center gap-2 ${theme === 'light' ? 'text-amber-950' : 'text-white'}`}>
            <CalendarIcon className="text-orange-500" size={22}/> Public Interactive Calendar
          </h3>
          <p className={`text-xs font-semibold ${theme === 'light' ? 'text-amber-900/80' : 'text-stone-400'}`}>
            Select any day to view approved campus requisitions & live broadcasts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentMonthDate(moment(currentMonthDate).subtract(1, 'month'))}
            className={`p-2 rounded-xl border transition-all ${theme === 'light' ? 'bg-amber-200/80 border-amber-300 text-amber-950 hover:bg-amber-300' : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'}`}
          >
            <ChevronLeft size={16}/>
          </button>
          <span className={`text-sm font-black uppercase tracking-widest px-3 py-1 rounded-xl border ${theme === 'light' ? 'bg-amber-200/90 border-amber-300 text-amber-950' : 'bg-stone-900 border-stone-800 text-white'}`}>
            {currentYear}
          </span>
          <button 
            onClick={() => setCurrentMonthDate(moment(currentMonthDate).add(1, 'month'))}
            className={`p-2 rounded-xl border transition-all ${theme === 'light' ? 'bg-amber-200/80 border-amber-300 text-amber-950 hover:bg-amber-300' : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'}`}
          >
            <ChevronRight size={16}/>
          </button>
        </div>
      </div>

      {/* 1. HORIZONTAL SCROLLABLE MONTH SELECTOR (IMAGE 2 STYLE) */}
      <div className="mb-6 overflow-x-auto hide-scrollbar pb-2">
        <div className="flex items-center gap-2 min-w-max">
          {monthsList.map((mName, mIdx) => {
            const isSelected = mIdx === currentMonthIndex;
            return (
              <button
                key={mName}
                onClick={() => handleMonthChange(mIdx)}
                className={`px-4 py-2 rounded-2xl text-xs font-black tracking-widest uppercase transition-all shrink-0 ${
                  isSelected 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 scale-105' 
                    : theme === 'light'
                    ? 'bg-amber-200/50 text-amber-900/70 hover:bg-amber-300/80 hover:text-amber-950'
                    : 'bg-stone-900/60 text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                {mName}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CALENDAR GRID CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT / TOP: 31-DAY MONTH CALENDAR MATRIX */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Weekday Headers S M T W T F S */}
          <div className="grid grid-cols-7 text-center text-xs font-black uppercase tracking-widest py-2 border-b border-amber-500/20">
            <span className="text-red-500">S</span>
            <span className={theme === 'light' ? 'text-amber-950' : 'text-stone-300'}>M</span>
            <span className={theme === 'light' ? 'text-amber-950' : 'text-stone-300'}>T</span>
            <span className={theme === 'light' ? 'text-amber-950' : 'text-stone-300'}>W</span>
            <span className={theme === 'light' ? 'text-amber-950' : 'text-stone-300'}>T</span>
            <span className={theme === 'light' ? 'text-amber-950' : 'text-stone-300'}>F</span>
            <span className="text-orange-500">S</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {calendarDays.map((item, index) => {
              if (item.isPadding) {
                return <div key={`pad-${index}`} className="h-10 sm:h-12 rounded-2xl opacity-20"></div>;
              }

              const isSelected = item.day === selectedDayNumber;
              const hasEvents = item.bookingsCount > 0;

              return (
                <button
                  key={`day-${item.day}`}
                  onClick={() => setSelectedDayNumber(item.day)}
                  className={`h-11 sm:h-12 rounded-2xl flex flex-col items-center justify-center relative transition-all duration-200 font-bold text-xs ${
                    isSelected
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 scale-105 z-10 ring-2 ring-blue-400'
                      : hasEvents
                      ? theme === 'light'
                        ? 'bg-amber-200/90 text-amber-950 border border-amber-400 font-black'
                        : 'bg-stone-800 text-white border border-stone-700'
                      : theme === 'light'
                      ? 'bg-amber-100/60 text-amber-900/80 hover:bg-amber-200 border border-amber-200/60'
                      : 'bg-stone-900/40 text-stone-400 hover:bg-stone-800 hover:text-white border border-stone-850'
                  }`}
                >
                  <span>{item.day}</span>
                  
                  {/* Event Indicator Dots (Image 2 style) */}
                  {hasEvents && (
                    <span className="flex items-center gap-0.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-orange-500 animate-pulse'}`}></span>
                      {item.hasLiveStream && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT / BOTTOM: DAY SCHEDULE SHEET (IMAGE 2 STYLE) */}
        <div className={`lg:col-span-6 rounded-3xl p-6 shadow-xl border ${theme === 'light' ? 'bg-white/90 border-amber-300/80 text-amber-950' : 'bg-stone-900/90 border-stone-800 text-white'}`}>
          
          {/* Selected Date Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-3 rounded-2xl shadow-md text-center min-w-[54px]">
                <span className="text-[10px] font-black uppercase tracking-widest block opacity-80">{selectedDateMoment.format('MMM')}</span>
                <span className="text-xl font-black block leading-none">{selectedDayNumber}</span>
              </div>
              <div>
                <h4 className={`text-base font-black uppercase tracking-tight ${theme === 'light' ? 'text-amber-950' : 'text-white'}`}>
                  {selectedDateMoment.format('dddd')} Schedule
                </h4>
                <p className={`text-xs font-semibold ${theme === 'light' ? 'text-amber-900/70' : 'text-stone-400'}`}>
                  {selectedDayBookings.length} Approved Event{selectedDayBookings.length !== 1 ? 's' : ''} Scheduled
                </p>
              </div>
            </div>

            <span className="bg-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-500/30">
              {selectedDateMoment.format('D MMM YYYY')}
            </span>
          </div>

          {/* Timeline Events List */}
          <div className="space-y-4 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
            {selectedDayBookings.length > 0 ? (
              selectedDayBookings.map((b) => (
                <div key={b.id} className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] flex flex-col gap-2 ${theme === 'light' ? 'bg-amber-50/90 border-amber-200 shadow-sm' : 'bg-stone-950/80 border-stone-800'}`}>
                  
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Clock size={12}/> {moment(b.start_time).format('hh:mm A')} - {moment(b.end_time).format('hh:mm A')}
                    </span>
                    <span className="bg-amber-500/20 text-amber-600 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-amber-500/30">
                      {b.institute}
                    </span>
                  </div>

                  <h5 className={`text-sm font-black leading-tight ${theme === 'light' ? 'text-amber-950' : 'text-white'}`}>{b.event_name}</h5>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-400">
                    <span className={`flex items-center gap-1 ${theme === 'light' ? 'text-amber-900/80' : 'text-stone-400'}`}>
                      <MapPin size={13} className="text-orange-500"/> {b.venue}
                    </span>
                    <span className={`flex items-center gap-1 ${theme === 'light' ? 'text-amber-900/80' : 'text-stone-400'}`}>
                      <User size={13} className="text-blue-500"/> {b.coordinator}
                    </span>
                  </div>

                  {b.youtube_live_url && (
                    <a 
                      href={b.youtube_live_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="mt-1 w-full py-2 rounded-xl text-[11px] font-black text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Video size={13}/> Watch Pre-Scheduled YouTube Stream ↗
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className={`p-8 text-center rounded-2xl border border-dashed ${theme === 'light' ? 'border-amber-300 text-amber-900/60' : 'border-stone-800 text-stone-500'}`}>
                <CalendarIcon size={32} className="mx-auto mb-2 opacity-40 text-orange-500"/>
                <p className="text-xs font-bold mb-1">No Approved Events Scheduled for {selectedDateMoment.format('D MMMM YYYY')}</p>
                <p className="text-[11px]">Click "Book Venue" tab to reserve a campus hall or amphitheatre on this date.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
