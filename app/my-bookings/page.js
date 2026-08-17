'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { generateGatePass } from '@/utils/generatePDF';
import { Download, Calendar, MapPin, ArrowLeft, Clock, History, AlertTriangle, CheckCircle2, XCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import moment from 'moment';

const MOCK_FALLBACK_BOOKINGS = [
  {
    id: "vdt-req-001",
    institute: "VSIT",
    event_name: "Annual Technical Symposium & TechFest",
    coordinator: "Dr. Rohini K.",
    user_email: "rohini.k@vsit.edu.in",
    venue: "Auditorium, 6th Floor Activity Area",
    start_time: moment().add(1, 'days').hours(10).minutes(0).toISOString(),
    end_time: moment().add(1, 'days').hours(17).minutes(0).toISOString(),
    status: "approved",
    moderator_name: "Prof. S. Sharma",
    approved_at: moment().subtract(2, 'hours').toISOString()
  },
  {
    id: "vdt-req-002",
    institute: "VIT",
    event_name: "National Level Robotics Workshop",
    coordinator: "Prof. Amit V.",
    user_email: "amit.v@vit.edu.in",
    venue: "VIT Amphitheatre, Y Block Seminar Hall",
    start_time: moment().add(3, 'days').hours(9).minutes(30).toISOString(),
    end_time: moment().add(3, 'days').hours(16).minutes(30).toISOString(),
    status: "pending_admin"
  },
  {
    id: "vdt-req-003",
    institute: "VDT",
    event_name: "Trustees & Faculty Advisory Summit",
    coordinator: "Dr. V. Patil",
    user_email: "v.patil@vdt.org",
    venue: "Board Room (7th Floor)",
    start_time: moment().add(5, 'days').hours(11).minutes(0).toISOString(),
    end_time: moment().add(5, 'days').hours(14).minutes(0).toISOString(),
    status: "pending"
  },
  {
    id: "vdt-req-004",
    institute: "VPT",
    event_name: "Annual Inter-College Cultural Fest & Musical Night",
    coordinator: "Prof. N. Kadam",
    user_email: "n.kadam@vpt.edu.in",
    venue: "VIT Amphitheatre",
    start_time: moment().add(7, 'days').hours(10).minutes(0).toISOString(),
    end_time: moment().add(7, 'days').hours(18).minutes(0).toISOString(),
    status: "rejected",
    rejection_reason: "Schedule Conflict: VIT Amphitheatre is pre-booked for Semester Examination Logistics setup.",
    rejected_by: "Department Moderator",
    rejected_at: moment().subtract(1, 'days').toISOString()
  }
];

export default function MyBookings() {
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setMyBookings(data);
      } else {
        setMyBookings(MOCK_FALLBACK_BOOKINGS);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setMyBookings(MOCK_FALLBACK_BOOKINGS);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = myBookings.filter(b => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'pending') return b.status === 'pending' || b.status === 'pending_admin';
    return b.status === statusFilter;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 pb-12">
      {/* Header with Dark Orange Gradient */}
      <header className="bg-gradient-to-r from-stone-900 via-orange-950 to-amber-950 text-white p-6 shadow-xl sticky top-0 z-50 border-b border-orange-500/20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black uppercase text-xs bg-white/10 px-4 py-2.5 rounded-xl hover:bg-white/20 transition-all border border-white/20">
            <ArrowLeft size={18} /> Back to Portal
          </Link>
          <div className="flex items-center gap-3">
            <History size={24} className="text-orange-400" />
            <h1 className="text-xl font-black uppercase tracking-tight">Requisition History & Status</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
        
        {/* Status Filter Tabs */}
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-3xl flex flex-wrap justify-between items-center gap-4 shadow-xl">
          <div>
            <h2 className="text-base font-black uppercase tracking-wide text-white">Requisition Filter</h2>
            <p className="text-xs text-stone-400">View pending approvals, confirmed bookings, or rejection reasons.</p>
          </div>

          <div className="flex items-center gap-2 bg-stone-950 p-1.5 rounded-2xl border border-stone-800 flex-wrap">
            {[
              { id: 'ALL', label: 'All Requests', count: myBookings.length },
              { id: 'pending', label: 'Pending', count: myBookings.filter(b => b.status === 'pending' || b.status === 'pending_admin').length },
              { id: 'approved', label: 'Approved', count: myBookings.filter(b => b.status === 'approved').length },
              { id: 'rejected', label: 'Rejected', count: myBookings.filter(b => b.status === 'rejected').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? tab.id === 'approved' 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : tab.id === 'rejected'
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                        : tab.id === 'pending'
                          ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                          : 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-white">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Booking Cards */}
        <div className="space-y-4">
          {filteredBookings.map(b => (
            <div key={b.id} className="bg-stone-900/90 border border-stone-800 p-6 rounded-3xl shadow-xl hover:border-stone-700 transition-all space-y-4">
              
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">
                      {b.institute || 'VDT'} - Form #{b.id}
                    </span>
                    <span className="text-[10px] text-stone-400 font-bold bg-stone-950 border border-stone-800 px-3 py-1 rounded-xl">
                      <Calendar size={12} className="inline mr-1 text-orange-400" />
                      {moment(b.start_time).format('D MMM YYYY')} ({moment(b.start_time).format('h:mm A')} - {moment(b.end_time).format('h:mm A')})
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-white uppercase tracking-tight">
                    {b.event_name || b.activity_name}
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    Venue: <span className="text-stone-200 font-bold">{b.venue || b.venues?.name}</span> | Coordinator: <span className="text-stone-300 font-bold">{b.coordinator || b.user_email}</span>
                  </p>
                </div>
                
                <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 border ${
                  b.status === 'approved' 
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                    : b.status === 'rejected' 
                      ? 'bg-red-500/20 border-red-500/30 text-red-400'
                      : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                }`}>
                  {b.status === 'approved' && <CheckCircle2 size={14}/>}
                  {b.status === 'rejected' && <XCircle size={14}/>}
                  {(b.status === 'pending' || b.status === 'pending_admin') && <Clock size={14}/>}
                  <span>
                    {b.status === 'approved' 
                      ? 'APPROVED & CONFIRMED' 
                      : b.status === 'pending_admin' 
                        ? 'MODERATOR APPROVED' 
                        : b.status === 'rejected' 
                          ? 'REJECTED' 
                          : 'PENDING MODERATOR'}
                  </span>
                </div>
              </div>

              {/* REJECTION REASON CALLOUT */}
              {b.status === 'rejected' && (
                <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-4 flex items-start gap-3 shadow-lg">
                  <div className="bg-red-500/20 text-red-400 p-2.5 rounded-xl shrink-0 mt-0.5 border border-red-500/30">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-red-300 uppercase tracking-wide flex items-center gap-2">
                      Requisition Rejected
                      {b.rejected_by && <span className="text-[10px] text-red-400 font-mono font-normal">({b.rejected_by})</span>}
                    </h4>
                    <p className="text-xs text-red-200 font-medium leading-relaxed">
                      <strong className="text-white font-bold">Reason for Rejection: </strong>
                      {b.rejection_reason || "Venue pre-booked or schedule conflict during requested slot."}
                    </p>
                    {b.rejected_at && (
                      <p className="text-[10px] text-red-400/80 font-mono">
                        Timestamp: {moment(b.rejected_at).format('D MMM YYYY, h:mm A')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* GATE PASS DOWNLOAD */}
              {b.status === 'approved' && (
                <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-stone-800">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={12}/> Official Gate Pass Ready for Download
                  </span>
                  <button 
                    onClick={() => generateGatePass(b)} 
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-tighter hover:shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                  >
                    <Download size={16} />
                    Download Gate Pass PDF
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {filteredBookings.length === 0 && (
            <div className="text-center py-20 bg-stone-900 rounded-3xl border border-dashed border-stone-800 shadow-inner">
              <FileText size={40} className="text-stone-600 mx-auto mb-3" />
              <p className="font-bold text-stone-400 text-sm uppercase tracking-wider">
                No requisitions found under this status filter
              </p>
              <Link href="/" className="mt-4 inline-block text-orange-400 font-bold text-xs underline underline-offset-4">
                Back to main portal to create a booking
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}