/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import dynamic from 'next/dynamic';
import { ShieldCheck, LogOut, CheckCircle, XCircle, Clock, Calendar, MapPin, User, Users, Filter, ChevronDown, ChevronUp, Zap, FileText, Download, Hash } from 'lucide-react';
import moment from 'moment';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SignatureCanvas = dynamic(() => import('react-signature-canvas'), { ssr: false });

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [processingId, setProcessingId] = useState(null); 
  
  const adminSigCanvas = useRef(null);
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem('userRole', 'admin');
    router.replace('/');
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    // Fetches newest first
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (!error) setBookings(data || []);
    setLoading(false);
  };

  const handleLogout = () => { localStorage.clear(); window.location.href = '/'; };

  const formatIST = (dateString, format = 'DD MMM YYYY, hh:mm A') => {
      if (!dateString) return 'N/A';
      return moment(dateString).utcOffset('+05:30').format(format);
  };

  const sendEmailNotification = async (booking, status, pdfBase64 = null) => {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: booking.user_email,
          status: status,
          eventName: booking.event_name,
          institute: booking.institute,
          pdfBase64: pdfBase64
        })
      });
    } catch (err) {
      console.error("Failed to send email:", err);
    }
  };

  const handleApprove = async (booking, sequenceNumber) => {
    if (adminSigCanvas.current && adminSigCanvas.current.isEmpty()) {
        return alert("⚠️ Please provide an Admin Signature to approve this request.");
    }
    
    setProcessingId(booking.id);
    const adminSignature = adminSigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    const approvedAt = new Date().toISOString(); 

    const updatedBooking = { ...booking, status: 'approved', admin_signature_url: adminSignature, approved_at: approvedAt };
    
    await supabase.from('bookings').update({ status: 'approved', admin_signature_url: adminSignature, approved_at: approvedAt }).eq('id', booking.id);

    setTimeout(async () => {
        const element = document.getElementById(`pdf-template-${booking.id}`);
        
        if (!element) {
            console.error("PDF Template not found in DOM");
            alert("Approved successfully, but PDF generation failed (Element missing).");
            setBookings(prev => prev.map(b => b.id === booking.id ? updatedBooking : b));
            setProcessingId(null);
            return;
        }

        element.style.position = 'absolute'; element.style.left = '0'; element.style.top = '0'; element.style.zIndex = '1000'; element.style.display = 'block';

        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            
            const pdfBase64 = pdf.output('datauristring');
            await sendEmailNotification(updatedBooking, 'approved', pdfBase64);
            alert("✅ Request Approved & Email Notification Sent!");
        } catch (err) {
            console.error(err); alert("Approved, but failed to generate/send PDF email.");
        } finally {
            element.style.position = 'fixed'; element.style.left = '-10000px';
            setBookings(prev => prev.map(b => b.id === booking.id ? updatedBooking : b));
            setProcessingId(null);
        }
    }, 500);
  };

  const handleReject = async (booking) => {
    const reasonInput = prompt("Enter the reason for rejection (optional):", "Schedule Conflict / Venue Pre-booked");
    if (reasonInput === null) return;
    const reason = reasonInput.trim() || "Schedule Conflict / Venue Pre-booked";

    setProcessingId(booking.id);
    const rejectedAt = new Date().toISOString();
    await supabase.from('bookings').update({ 
      status: 'rejected', 
      rejection_reason: reason,
      rejected_by: 'Admin Office',
      rejected_at: rejectedAt
    }).eq('id', booking.id);
    
    await sendEmailNotification(booking, 'rejected');
    
    setBookings(prev => prev.map(b => b.id === booking.id ? { 
      ...b, 
      status: 'rejected', 
      rejection_reason: reason,
      rejected_by: 'Admin Office',
      rejected_at: rejectedAt 
    } : b));
    setProcessingId(null);
    alert(`❌ Request Rejected & Notification Sent.\nReason: ${reason}`);
  };

  const generatePDF = async (booking, sequenceNumber) => {
    setIsGeneratingPDF(true);
    const element = document.getElementById(`pdf-template-${booking.id}`);
    
    if (!element) {
        alert("Cannot generate PDF right now.");
        setIsGeneratingPDF(false);
        return;
    }

    element.style.position = 'absolute'; element.style.left = '0'; element.style.top = '0'; element.style.zIndex = '1000'; element.style.display = 'block';

    try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        // Updated filename to use the exact Sequence Number instead of the raw DB ID
        pdf.save(`${booking.institute}_Requisition_Form_${sequenceNumber}.pdf`);
    } catch (err) {
        console.error("PDF Generation Error: ", err); alert("Failed to generate PDF.");
    } finally {
        element.style.position = 'fixed'; element.style.left = '-10000px'; setIsGeneratingPDF(false);
    }
  };

  const renderChecklist = (items) => {
    if (!items || !items.requirements) return <p className="text-slate-400 text-xs italic p-4">No specific logistics requested.</p>;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
        {Object.entries(items.requirements).map(([key, value]) => (
          <div key={key} className="flex items-start gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
            <CheckCircle size={14} className="text-red-500 shrink-0 mt-0.5"/>
            <div>
              <span className="font-bold text-slate-800 block leading-tight">{key}</span>
              {value !== "Yes" && <span className="text-slate-500 text-[10px] font-medium block mt-1 bg-white border border-slate-200 px-2 py-1 rounded-md">{value}</span>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const filteredBookings = bookings.filter(b => b.status === filter);
  const totalOverallEvents = bookings.length;

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-red-600 rounded-full border-t-transparent"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      
      <header className="bg-slate-900 text-white p-4 sm:p-6 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-red-600/20 p-2.5 rounded-xl border border-red-500/30 text-red-500">
               <ShieldCheck size={20} /> 
             </div>
             <div>
               <h1 className="text-lg font-black uppercase tracking-widest leading-none text-white">V - Booking</h1>
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Admin Console</p>
             </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/5 px-4 py-2.5 rounded-xl transition-all">
            <LogOut size={14}/> <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 mt-4">
        
        <div className="mb-8 flex justify-between items-center sm:justify-start gap-6">
            <div className="inline-flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
                {['pending', 'approved', 'rejected'].map(status => (
                    <button 
                        key={status} onClick={() => setFilter(status)}
                        className={`px-5 sm:px-8 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${filter === status ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                        {status} <span className="ml-1 opacity-70">({bookings.filter(b => b.status === status).length})</span>
                    </button>
                ))}
            </div>
            
            {/* Overall Portal Statistics */}
            <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-xs font-bold text-slate-500">
                <Hash size={14} className="text-red-500"/>
                Total Portal Events: <span className="text-slate-900 font-black">{totalOverallEvents}</span>
            </div>
        </div>

        <div className="space-y-4">
            {filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                    <div className="bg-slate-50 p-4 rounded-full mb-4"><FileText size={32} className="text-slate-300"/></div>
                    <p className="font-bold text-sm text-slate-400 uppercase tracking-widest">Inbox Zero</p>
                </div>
            ) : (
                filteredBookings.map((booking) => {
                    // Calculate chronological Sequence Number (Oldest = 1, Newest = length)
                    const absoluteIndex = bookings.findIndex(b => b.id === booking.id);
                    const sequenceNumber = bookings.length - absoluteIndex;

                    return (
                    <div key={booking.id} className="bg-white rounded-2xl sm:rounded-4xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
                        
                        <div className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4" onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}>
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className={`shrink-0 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest border text-center min-w-[60px] bg-slate-50 text-slate-700 border-slate-200`}>
                                    {booking.institute || 'VSIT'}
                                </div>
                                <div className="grow">
                                    {/* Sequence Number Display */}
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                        <Hash size={10} className="text-red-500"/> Form #{sequenceNumber} of {totalOverallEvents}
                                    </div>
                                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight mb-1">{booking.event_name}</h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-500 text-[10px] sm:text-xs font-bold">
                                        <span className="flex items-center gap-1.5"><User size={12}/> {booking.coordinator || booking.user_email?.split('@')[0]}</span>
                                        <span className="flex items-center gap-1.5"><Calendar size={12}/> {formatIST(booking.start_time, 'MMM D')}</span>
                                        <span className="flex items-center gap-1.5"><Clock size={12}/> {formatIST(booking.start_time, 'h:mm A')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-0 border-slate-100">
                                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : booking.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {booking.status === 'pending' && <Clock size={12}/>}
                                    {booking.status === 'approved' && <CheckCircle size={12}/>}
                                    {booking.status === 'rejected' && <XCircle size={12}/>}
                                    {booking.status}
                                </div>
                                <div className="bg-slate-50 p-2 rounded-full text-slate-400">
                                    {expandedId === booking.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                </div>
                            </div>
                        </div>

                        {expandedId === booking.id && (
                            <div className="border-t border-slate-100 bg-slate-50/50 animate-in slide-in-from-top-2">
                                <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin size={12} className="text-red-500"/> Venues Requested</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {booking.venue.split(',').map((v, i) => (
                                                    <span key={i} className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-700">
                                                        {v.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                                <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Timing (IST)</span>
                                                <span className="text-xs sm:text-sm font-black text-slate-800">{formatIST(booking.start_time, 'h:mm A')} - {formatIST(booking.end_time, 'h:mm A')}</span>
                                            </div>
                                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                                <span className="text-[10px] font-black text-slate-400 uppercase block mb-1 items-center gap-1"><Users size={10}/> Attendees</span>
                                                <span className="text-xs sm:text-sm font-black text-slate-800">{booking.attendees || 'N/A'}</span>
                                            </div>
                                        </div>

                                        {booking.external_participants && booking.external_participants !== "No" && (
                                            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 shadow-sm">
                                                <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-2"><Users size={12}/> External Participants</h4>
                                                <p className="text-xs font-bold text-amber-900">{booking.external_participants}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50"><Zap size={12} className="text-red-500"/> Logistics Checklist</h4>
                                            {renderChecklist(booking.items)}
                                        </div>
                                        
                                        {booking.signature_url && (
                                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col items-start">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Faculty Signature</h4>
                                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 inline-block">
                                                    <img src={booking.signature_url} alt="Faculty Signature" className="h-10 sm:h-12 w-auto mix-blend-multiply opacity-80"/>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {booking.status === 'pending' && (
                                    <div className="p-5 sm:p-6 bg-slate-100 border-t border-slate-200">
                                        <div className="mb-6 max-w-sm">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><ShieldCheck size={14} className="text-red-500"/> Admin Approval Signature</h4>
                                            <div className="h-24 border-2 border-dashed border-slate-300 rounded-xl bg-white relative overflow-hidden group">
                                                <SignatureCanvas ref={adminSigCanvas} penColor="black" canvasProps={{className: 'w-full h-full absolute inset-0'}} />
                                                <button type="button" onClick={() => adminSigCanvas.current?.clear()} className="absolute bottom-2 right-2 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 hover:text-red-600">Clear</button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                                            <button disabled={processingId === booking.id} onClick={() => handleReject(booking)} className="px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-red-600 bg-white border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50">
                                                Reject
                                            </button>
                                            {/* Passed sequenceNumber to handleApprove */}
                                            <button disabled={processingId === booking.id} onClick={() => handleApprove(booking, sequenceNumber)} className="px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait">
                                                {processingId === booking.id ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <CheckCircle size={16}/>}
                                                {processingId === booking.id ? "Processing..." : "Approve & Seal"}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {booking.status === 'approved' && (
                                    <div className="p-5 sm:p-6 bg-green-50/50 border-t border-green-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white border border-green-200 p-2 rounded-xl">
                                                <img src={booking.admin_signature_url} alt="Admin Signature" className="h-10 w-auto mix-blend-multiply opacity-80" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Approved By Admin</p>
                                                <p className="text-xs font-bold text-slate-600 mt-1">{formatIST(booking.approved_at, 'DD MMM YYYY, hh:mm:ss A')} (IST)</p>
                                            </div>
                                        </div>
                                        
                                        {/* Passed sequenceNumber to generatePDF */}
                                        <button onClick={() => generatePDF(booking, sequenceNumber)} disabled={isGeneratingPDF} className="w-full md:w-auto px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-black shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                            {isGeneratingPDF ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Download size={16}/>}
                                            Download PDF Receipt
                                        </button>
                                    </div>
                                )}

                                {/* --- HIDDEN PDF TEMPLATE (Strict Hex Colors) --- */}
                                <div id={`pdf-template-${booking.id}`} style={{ backgroundColor: '#ffffff', color: '#000000' }} className="fixed left-[-10000px] w-[800px] p-12 font-sans box-border">
                                    <div className="flex justify-between items-center border-b-2 border-[#0f172a] pb-6 mb-8">
                                        <img src="/logo.png" alt="Logo" className="h-16 w-auto object-contain" />
                                        <div className="text-right">
                                            <h1 className="text-2xl font-black uppercase tracking-widest text-[#0f172a]">Facility Requisition</h1>
                                            <p className="text-sm font-bold text-[#64748b] tracking-widest mt-1">V - BOOKING PORTAL</p>
                                            {/* Form Sequence Number included in the PDF header */}
                                            <div className="mt-3 inline-block bg-[#f1f5f9] border border-[#cbd5e1] px-3 py-1.5 rounded-lg">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#475569]">Form No: {sequenceNumber} / {totalOverallEvents}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-6 gap-x-12 mb-8">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">Institute</p>
                                            <p className="text-base font-bold text-[#1e293b]">{booking.institute}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">Event Name</p>
                                            <p className="text-base font-bold text-[#1e293b]">{booking.event_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">Teacher Coordinator</p>
                                            <p className="text-base font-bold text-[#1e293b]">{booking.coordinator} <br/><span className="text-sm font-medium text-[#64748b]">{booking.user_email}</span></p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">Date & Time (IST)</p>
                                            <p className="text-base font-bold text-[#1e293b]">{formatIST(booking.start_time, 'DD MMM YYYY')}<br/><span className="text-sm font-medium text-[#64748b]">{formatIST(booking.start_time, 'hh:mm A')} - {formatIST(booking.end_time, 'hh:mm A')}</span></p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">Approved Venues</p>
                                            <p className="text-base font-bold text-[#1e293b]">{booking.venue}</p>
                                        </div>
                                    </div>

                                    <div className="mb-12">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-3 border-b border-[#e2e8f0] pb-2">Logistics Requirements</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            {booking.items?.requirements ? Object.entries(booking.items.requirements).map(([key, value]) => (
                                                <div key={key} className="text-sm">
                                                    <span className="font-bold text-[#1e293b]">• {key}:</span> <span className="text-[#475569]">{value}</span>
                                                </div>
                                            )) : <p className="text-sm text-[#64748b]">None</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-12 mt-16 pt-8 border-t-2 border-[#f1f5f9]">
                                        <div className="text-center">
                                            <div className="h-20 flex items-center justify-center mb-2">
                                                {booking.signature_url && <img src={booking.signature_url} className="h-full object-contain mix-blend-multiply" />}
                                            </div>
                                            <div className="border-t border-[#cbd5e1] pt-2">
                                                <p className="text-xs font-black uppercase tracking-widest text-[#1e293b]">Faculty Signature</p>
                                                <p className="text-[10px] font-bold text-[#94a3b8] mt-1">{booking.coordinator}</p>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="h-20 flex items-center justify-center mb-2">
                                                {(booking.admin_signature_url || (adminSigCanvas.current && !adminSigCanvas.current.isEmpty() ? adminSigCanvas.current.getTrimmedCanvas().toDataURL('image/png') : null)) && <img src={booking.admin_signature_url || adminSigCanvas.current.getTrimmedCanvas().toDataURL('image/png')} className="h-full object-contain mix-blend-multiply" />}
                                            </div>
                                            <div className="border-t border-[#cbd5e1] pt-2">
                                                <p className="text-xs font-black uppercase tracking-widest text-[#1e293b]">Admin Approval</p>
                                                <p className="text-[10px] font-bold text-[#94a3b8] mt-1">Approved: {formatIST(booking.approved_at || new Date().toISOString(), 'DD/MM/YYYY, hh:mm A')} (IST)</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-12 text-center text-[10px] font-bold text-[#cbd5e1] uppercase tracking-widest">
                                        Generated by V - Booking Central System • {formatIST(new Date(), 'DD MMM YYYY, hh:mm A')}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    );
                })
            )}
        </div>
      </main>
    </div>
  );
}