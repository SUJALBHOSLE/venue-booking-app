/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabaseClient';
import dynamic from 'next/dynamic';
import { 
  Mic, Zap, Video, CheckSquare, Square, User, Users, LayoutGrid, LogOut, 
  Utensils, Music, Monitor, Camera, Lightbulb, MapPin, CalendarClock, PenTool, 
  Calendar, Clock, ShieldCheck, CheckCircle2, XCircle, Download, Search, 
  Edit3, FileText, ChevronRight, Sparkles, Filter, Info, UserCheck, Award, ArrowRight, Building2,
  BarChart3, MessageSquare, Bot, Send, Plus, Trash2, Sliders, AlertTriangle, RefreshCw, Check
} from 'lucide-react';
import moment from 'moment';
import { generateGatePass } from '@/utils/generatePDF';
import LoginButton from '@/components/LoginButton';
import ThemeToggle from '@/components/ThemeToggle';

const SignatureCanvas = dynamic(() => import('react-signature-canvas'), { ssr: false });

const TIME_SLOTS = ["07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM"];

const INSTITUTES = ["VDT", "VSIT", "VIT", "VPT", "VSB", "VCP", "VIIE"];

// Default Campus Venues Database with Seating Capacities & Installed Tech
const INITIAL_VENUES_DATABASE = [
  { id: "v1", name: "Auditorium", capacity: 300, status: "Available", tech: ["Laser Projector", "Line Array Sound", "Stage Focus Lights", "LED Backdrop Wall", "Air Conditioned"] },
  { id: "v2", name: "Board Room (7th Floor)", capacity: 25, status: "Available", tech: ["Dual TV Displays", "Executive Conference Mic System", "Video Conferencing", "Air Conditioned"] },
  { id: "v3", name: "Meeting Room (7th Floor)", capacity: 15, status: "Available", tech: ["HD Display TV", "Podium Mic", "Air Conditioned"] },
  { id: "v4", name: "6th Floor Activity Area", capacity: 200, status: "Available", tech: ["PA System", "Mobile Projectors", "Flexible Stage Deck"] },
  { id: "v5", name: "M-101", capacity: 70, status: "Available", tech: ["HD Projector", "Smart Audio", "Whiteboard"] },
  { id: "v6", name: "M-501", capacity: 80, status: "Available", tech: ["Laser Projector", "Podium Mic", "Air Conditioned"] },
  { id: "v7", name: "M-413", capacity: 60, status: "Available", tech: ["HD Projector", "Smart Audio"] },
  { id: "v8", name: "B-105", capacity: 60, status: "Available", tech: ["HD Projector", "Whiteboard"] },
  { id: "v9", name: "D-305", capacity: 65, status: "Available", tech: ["HD Projector", "Mic System"] },
  { id: "v10", name: "A-302", capacity: 70, status: "Available", tech: ["HD Projector", "Smart Board"] },
  { id: "v11", name: "Y Block Seminar Hall", capacity: 150, status: "Available", tech: ["HD Projector", "Wireless Mics", "Stage Lights", "Air Conditioned"] },
  { id: "v12", name: "VP Seminar Hall", capacity: 180, status: "Available", tech: ["Laser Projector", "Dolby Audio", "Stage Lighting", "Air Conditioned"] },
  { id: "v13", name: "VIT Amphitheatre", capacity: 500, status: "Available", tech: ["Open Air Acoustic Setup", "High Power Focus Lights", "Mobile PA System"] },
  { id: "v14", name: "A Block Entrance Amphi", capacity: 250, status: "Available", tech: ["Open Air Seating", "PA Audio Connections"] },
  { id: "v15", name: "VIT Gate 1 Plaza", capacity: 350, status: "Available", tech: ["Outdoor Open Ground", "High Electrical Power Points"] },
  { id: "v16", name: "VIT Gate 2 Amphi", capacity: 300, status: "Available", tech: ["Step Amphitheatre", "Outdoor Lighting"] },
  { id: "v17", name: "VIT Gate 2 Plaza", capacity: 400, status: "Available", tech: ["Outdoor Plaza", "3-Phase Power Outlet"] },
  { id: "v18", name: "M Block Entrance Amphi", capacity: 200, status: "Available", tech: ["Step Seating", "Outdoor PA System"] },
  { id: "v19", name: "M Block Atrium", capacity: 250, status: "Available", tech: ["Covered High-Ceiling Atrium", "Display Banner Trusses"] },
  { id: "v20", name: "VIT Plaza", capacity: 450, status: "Available", tech: ["Main Quadrangle", "High Power Electrical Hookups"] },
  { id: "v21", name: "Garden Near Pump Room", capacity: 100, status: "Available", tech: ["Lawn Area", "Basic Lighting"] },
  { id: "v22", name: "VP Office Side Area", capacity: 50, status: "Available", tech: ["Quiet Open Area"] },
  { id: "v23", name: "Parking Area", capacity: 600, status: "Available", tech: ["Spacious Outdoor Lot", "High Power Outlets"] },
  { id: "v24", name: "X Block Tree Area", capacity: 80, status: "Available", tech: ["Shaded Tree Grove"] },
  { id: "v25", name: "Playground 1", capacity: 1000, status: "Available", tech: ["Full Sports Ground", "High Power Generator Hookups", "Flood Lights"] },
  { id: "v26", name: "Playground 2", capacity: 800, status: "Available", tech: ["Secondary Sports Ground", "Flood Lights"] },
  { id: "v27", name: "Garden Behind X Block", capacity: 120, status: "Available", tech: ["Lawn Garden Setup"] },
  { id: "v28", name: "Sports S-Den", capacity: 40, status: "Available", tech: ["Indoor Sports Arena", "AC"] },
  { id: "v29", name: "Sports Den Amphi", capacity: 150, status: "Available", tech: ["Indoor Step Seating", "PA Audio"] },
  { id: "v30", name: "VP Lawn", capacity: 250, status: "Available", tech: ["Manicured Lawn", "Garden Lighting"] },
  { id: "v31", name: "VP Courtyard", capacity: 180, status: "Available", tech: ["Central Courtyard", "3-Phase Power Outlet"] },
  { id: "v32", name: "Any Classroom/Lab", capacity: 60, status: "Available", tech: ["Projector", "Smart Board"] }
];

const REQUIREMENTS = [
  { id: 'sound', label: 'Sound System & Microphones', icon: <Mic size={14}/>, hasDetails: true, category: 'Audio' },
  { id: 'prayer', label: 'Play Prayer Song', icon: <Music size={14}/>, category: 'Audio' },
  { id: 'anthem', label: 'Play National Anthem', icon: <Music size={14}/>, category: 'Audio' },
  { id: 'audioRec', label: 'Audio Recording System', icon: <Mic size={14}/>, category: 'Audio' },
  { id: 'projector', label: 'HD Projector & Screen', icon: <Monitor size={14}/>, category: 'Visual' },
  { id: 'backdrop', label: 'Stage Backdrop / PPT Video Wall', icon: <Monitor size={14}/>, category: 'Visual' },
  { id: 'podium', label: 'Podium Setup & Branding', icon: <Monitor size={14}/>, category: 'Visual' },
  { id: 'videoRec', label: '4K Video Recording', icon: <Video size={14}/>, category: 'Media' },
  { id: 'liveStream', label: 'Live Streaming Setup', icon: <Video size={14}/>, category: 'Media' },
  { id: 'photography', label: 'Event Photography Coverage', icon: <Camera size={14}/>, category: 'Media' },
  { id: 'lamp', label: 'Inauguration Lamp & Brass Samai', icon: <Zap size={14}/>, category: 'Stage' },
  { id: 'stage', label: 'Stage Design & VIP Chairs', icon: <LayoutGrid size={14}/>, hasDetails: true, category: 'Stage' },
  { id: 'lights', label: 'Special Stage Lighting / Focus Lights', icon: <Lightbulb size={14}/>, hasDetails: true, category: 'Stage' },
  { id: 'electrical', label: 'Additional Electrical 3-Phase Power', icon: <Zap size={14}/>, category: 'Electrical' },
  { id: 'standee', label: 'Display Standees & Direction Boards', icon: <LayoutGrid size={14}/>, category: 'Logistics' },
  { id: 'food', label: 'Catering & High Tea Arrangement', icon: <Utensils size={14}/>, hasDetails: true, category: 'Hospitality' }
];

const INITIAL_MOCK_BOOKINGS = [
  {
    id: "vdt-req-001",
    institute: "VSIT",
    event_name: "Annual Technical Symposium & TechFest",
    coordinator: "Dr. Rohini K.",
    user_email: "rohini.k@vsit.edu.in",
    venue: "Auditorium, 6th Floor Activity Area",
    start_time: moment().add(1, 'days').hours(10).minutes(0).toISOString(),
    end_time: moment().add(1, 'days').hours(17).minutes(0).toISOString(),
    attendees: "250 Students / 20 Others",
    external_participants: "Tech Mahindra External Judges",
    status: "approved",
    moderator_name: "Prof. S. Sharma",
    moderator_notes: "Reviewed and verified venue availability.",
    approved_at: moment().subtract(2, 'hours').toISOString(),
    items: {
      requirements: {
        "Sound System & Microphones": "2 Wireless Mics + Collar Mic",
        "HD Projector & Screen": "Yes",
        "Stage Design & VIP Chairs": "6 VIP Chairs on stage",
        "Catering & High Tea Arrangement": "Tea & Snacks for 30 VIP guests"
      }
    }
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
    attendees: "180 Students / 10 Faculty",
    external_participants: "IIT Bombay Alumni Instructors",
    status: "pending_admin",
    moderator_name: "Prof. S. Sharma",
    moderator_notes: "Approved by Moderator. Checked electrical load requirements.",
    items: {
      requirements: {
        "Sound System & Microphones": "4 Mics required",
        "Additional Electrical 3-Phase Power": "3 Phase 32A Connection",
        "4K Video Recording": "Entire workshop duration"
      }
    }
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
    attendees: "15 Dignitaries",
    external_participants: "No",
    status: "pending",
    items: {
      requirements: {
        "Podium Setup & Branding": "VDT Crest Logo",
        "Catering & High Tea Arrangement": "Executive Lunch"
      }
    }
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
    attendees: "600 Students",
    external_participants: "External Judges & Performers",
    status: "rejected",
    rejection_reason: "Schedule Conflict: VIT Amphitheatre is pre-booked for Semester Examination Logistics setup.",
    rejected_by: "Department Moderator",
    rejected_at: moment().subtract(1, 'days').toISOString(),
    items: {
      requirements: {
        "Sound System & Microphones": "High Power PA System",
        "Stage Design & VIP Chairs": "Stage Setup + 10 Chairs"
      }
    }
  }
];

export default function RequisitionPortal() {
  const [activeTab, setActiveTab] = useState('landing-calendar'); // 'landing-calendar', 'book', 'requirements', 'analytics', 'chatbot', 'moderator', 'admin', 'my-bookings'
  const [userRole, setUserRole] = useState('faculty'); // 'faculty', 'moderator', 'admin'
  const [bookings, setBookings] = useState(INITIAL_MOCK_BOOKINGS);
  const [venues, setVenues] = useState(INITIAL_VENUES_DATABASE);
  const [selectedVenues, setSelectedVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSessionId, setUserSessionId] = useState('demo-user');
  const [userEmail, setUserEmail] = useState('faculty@vdt.edu.in');
  const [selectedEventModal, setSelectedEventModal] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);

  // Filter States for Faculty History
  const [historyStatusFilter, setHistoryStatusFilter] = useState('ALL'); // 'ALL', 'pending', 'approved', 'rejected'
  
  // Rejection Reason Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [targetBookingToReject, setTargetBookingToReject] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [selectedPresetReason, setSelectedPresetReason] = useState('Schedule Conflict / Venue Pre-booked');

  // Filter States for Calendar
  const [calendarSearch, setCalendarSearch] = useState('');
  const [calendarInstituteFilter, setCalendarInstituteFilter] = useState('ALL');
  
  // Admin Venue Manager Selected Venue
  const [adminSelectedVenueId, setAdminSelectedVenueId] = useState('v1');
  const [adminCapacityInput, setAdminCapacityInput] = useState(300);
  const [adminStatusInput, setAdminStatusInput] = useState("Available");
  const [adminNewTechInput, setAdminNewTechInput] = useState('');

  // Theme State
  const [theme, setTheme] = useState('dark');

  // AI Chatbot State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: '👋 Hello! I am the Vidyalankar Dnyanpeeth Trust AI Venue Assistant.\n\nAsk me anything like:\n• "Can 200 people seat in auditorium?"\n• "Which halls seat 150 people?"\n• "Which venues have Laser Projector and AC?"\n• "How does the 2-Tier approval process work?"' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Signature Canvas Refs
  const facultySigCanvas = useRef(null);
  const moderatorSigCanvas = useRef(null);
  const adminSigCanvas = useRef(null);

  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: { durationType: 'single', institute: 'VSIT', coordinatorName: 'Dr. Faculty Member' }
  });

  const durationType = watch("durationType");
  const isExternal = watch("isExternal");

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') || 'faculty';
    setUserRole(savedRole);
    fetchBookingsFromDatabase();

    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (typeof document !== 'undefined') {
      if (savedTheme === 'light') {
        document.documentElement.classList.add('light-mode');
        document.documentElement.classList.remove('dark-mode');
      } else {
        document.documentElement.classList.add('dark-mode');
        document.documentElement.classList.remove('light-mode');
      }
    }
  }, []);

  const fetchBookingsFromDatabase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setBookings(data);
      } else {
        setBookings(INITIAL_MOCK_BOOKINGS);
      }
    } catch (err) {
      console.warn("Using local mock bookings storage fallback:", err);
      setBookings(INITIAL_MOCK_BOOKINGS);
    }
    setLoading(false);
  };

  const toggleVenue = (venueName) => {
    setSelectedVenues(prev => prev.includes(venueName) ? prev.filter(v => v !== venueName) : [...prev, venueName]);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  // --- EXPANDED HIGH-CONTEXT AI CHATBOT LOGIC ---
  const handleSendChatMessage = (textToSend = chatInput) => {
    const query = (textToSend || '').trim();
    if (!query) return;

    const newMessages = [...chatMessages, { sender: 'user', text: query }];
    setChatMessages(newMessages);
    setChatInput('');

    setTimeout(() => {
      let reply = "";
      const lowerQuery = query.toLowerCase();

      // Extract numbers in query for capacity checks
      const numberMatch = lowerQuery.match(/(\d+)/);
      const requestedCapacity = numberMatch ? parseInt(numberMatch[0]) : null;

      // Find venue matching query
      const matchedVenue = venues.find(v => 
        lowerQuery.includes(v.name.toLowerCase()) || 
        (v.name === 'Auditorium' && lowerQuery.includes('auditorium')) || 
        (v.name.includes('Board Room') && (lowerQuery.includes('board room') || lowerQuery.includes('boardroom'))) ||
        (v.name.includes('Amphitheatre') && (lowerQuery.includes('amphi') || lowerQuery.includes('amphitheatre'))) ||
        (v.name.includes('Playground') && (lowerQuery.includes('ground') || lowerQuery.includes('playground')))
      );

      // 1. Capacity + Specific Venue Query (e.g. "Can 200 people seat in Auditorium?")
      if (matchedVenue && requestedCapacity !== null) {
        if (requestedCapacity <= matchedVenue.capacity) {
          reply = `✅ **Yes!** ${matchedVenue.name} can accommodate **${requestedCapacity} people**.\n\n• **Seating Capacity:** ${matchedVenue.capacity} seats\n• **Status:** ${matchedVenue.status}\n• **Installed AV & Tech:** ${matchedVenue.tech.join(', ')}`;
        } else {
          const suitableVenues = venues.filter(v => v.capacity >= requestedCapacity).sort((a,b) => a.capacity - b.capacity);
          const suitableList = suitableVenues.slice(0, 4).map(v => `• **${v.name}**: ${v.capacity} seats (${v.tech.slice(0, 2).join(', ')})`).join('\n');
          reply = `⚠️ **Capacity Warning:** ${matchedVenue.name} seats up to **${matchedVenue.capacity} people**, which is less than your requested **${requestedCapacity} people**.\n\n**Recommended Alternatives for ${requestedCapacity}+ Guests:**\n${suitableList || '• **Playground 1**: 1000 capacity\n• **VIT Amphitheatre**: 500 capacity'}`;
        }
      }
      // 2. Capacity-Only Search (e.g. "Which halls seat 150 people?")
      else if (requestedCapacity !== null && (lowerQuery.includes('seat') || lowerQuery.includes('capacity') || lowerQuery.includes('people') || lowerQuery.includes('student') || lowerQuery.includes('hall') || lowerQuery.includes('room') || lowerQuery.includes('venue') || lowerQuery.includes('fit') || lowerQuery.includes('hold'))) {
        const fittingVenues = venues.filter(v => v.capacity >= requestedCapacity).sort((a,b) => a.capacity - b.capacity);
        if (fittingVenues.length > 0) {
          const options = fittingVenues.slice(0, 5).map(v => `• **${v.name}**: ${v.capacity} seating capacity | Tech: ${v.tech.slice(0, 2).join(', ')}`).join('\n');
          reply = `🏛️ **Campus Venues for ${requestedCapacity}+ People:**\n\n${options}\n\n*Tip: Click the "Book Venue" tab to initiate a requisition for any of these spaces.*`;
        } else {
          reply = `🏟️ For large gatherings of **${requestedCapacity}+ people**, we recommend:\n\n• **Playground 1**: 1,000 capacity (Full Sports Ground, Flood Lights, Generator Power)\n• **Playground 2**: 800 capacity\n• **Parking Area**: 600 capacity\n• **VIT Amphitheatre**: 500 capacity`;
        }
      }
      // 3. Tech Equipment & Feature Filter (e.g. "Which venues have Laser Projector and AC?")
      else if (lowerQuery.includes('ac') || lowerQuery.includes('air condition') || lowerQuery.includes('laser') || lowerQuery.includes('sound') || lowerQuery.includes('mic') || lowerQuery.includes('projector') || lowerQuery.includes('dolby') || lowerQuery.includes('light') || lowerQuery.includes('stream')) {
        const techKeywords = [];
        if (lowerQuery.includes('ac') || lowerQuery.includes('air condition')) techKeywords.push('Air Conditioned', 'AC');
        if (lowerQuery.includes('laser')) techKeywords.push('Laser Projector');
        if (lowerQuery.includes('dolby')) techKeywords.push('Dolby Audio');
        if (lowerQuery.includes('mic') || lowerQuery.includes('sound')) techKeywords.push('Sound', 'Mic', 'PA System');

        const matchingTechVenues = venues.filter(v => 
          v.tech.some(t => techKeywords.some(kw => t.toLowerCase().includes(kw.toLowerCase())))
        );

        if (matchingTechVenues.length > 0) {
          const list = matchingTechVenues.slice(0, 5).map(v => `• **${v.name}** (${v.capacity} seats): ${v.tech.join(', ')}`).join('\n');
          reply = `🎥 **Venues matching your AV / Technology criteria:**\n\n${list}`;
        } else {
          reply = `🔊 **Vidyalankar Campus Tech Specifications:**\n\nOur key spaces (Auditorium, Board Rooms, Seminar Halls) come equipped with Laser Projectors, Line Array Speakers, Wireless Mics, Stage Focus Lights, and AC. Additional AV items like 4K Live Streaming or Video Walls can be selected under the "Specific Requirements" tab!`;
        }
      }
      // 4. Specific Venue Detail Lookup
      else if (matchedVenue) {
        reply = `🏛️ **${matchedVenue.name} Specifications:**\n\n• **Seating Capacity:** ${matchedVenue.capacity} seats\n• **Current Availability:** ${matchedVenue.status}\n• **Installed Technology:** ${matchedVenue.tech.join(', ')}\n\n*Would you like to book ${matchedVenue.name}? Select it under the "Book Venue" tab.*`;
      }
      // 5. Workflow / Policy / Approval Questions
      else if (lowerQuery.includes('approval') || lowerQuery.includes('approve') || lowerQuery.includes('process') || lowerQuery.includes('workflow') || lowerQuery.includes('moderator') || lowerQuery.includes('admin') || lowerQuery.includes('gate pass') || lowerQuery.includes('pdf') || lowerQuery.includes('receipt')) {
        reply = `📜 **V-Booking 2-Tier Approval Workflow:**\n\n1️⃣ **Tier 1 (Moderator Review):** Your faculty requisition is sent to the Department Moderator to verify venue availability and coordinator details.\n2️⃣ **Tier 2 (Admin Stamping):** Once approved by the Moderator, the Admin applies a digital signature stamp and sequence tracking number.\n3️⃣ **PDF Requisition Receipt:** An official downloadable PDF Gate Pass with barcodes and digital signatures is generated automatically for campus security clearance.`;
      }
      // 6. Food / High Tea / Catering Questions
      else if (lowerQuery.includes('food') || lowerQuery.includes('tea') || lowerQuery.includes('catering') || lowerQuery.includes('snack') || lowerQuery.includes('hospitality')) {
        reply = `☕ **Catering & Hospitality Services:**\n\nYou can request High Tea, VIP Refreshments, or Full Event Catering under the **"Specific Requirements"** tab when submitting your booking request!`;
      }
      // 7. Booking Instructions
      else if (lowerQuery.includes('book') || lowerQuery.includes('how') || lowerQuery.includes('submit') || lowerQuery.includes('form')) {
        reply = `📝 **How to Submit a Venue Booking Request:**\n\n1. Click on the **"Book Venue"** tab.\n2. Select your Institute (*VSIT, VIT, VDT, VPT, etc.*) and event timing.\n3. Choose your desired venue with seating capacity.\n4. Select logistics items (Mics, Projector, Stage Lamp, Catering) under **"Specific Requirements"**.\n5. Draw your Faculty Digital Signature and click **Submit Requisition**!`;
      }
      // Default Assistant Knowledge Response
      else {
        reply = `🤖 **Vidyalankar Dnyanpeeth Trust AI Assistant:**\n\nI can answer questions about all **32+ campus venues**, seating capacities, installed AV equipment, approval workflows, and booking policies.\n\n**Try asking me:**\n• *"Can 200 people seat in auditorium?"*\n• *"Which halls seat 150 students?"*\n• *"Which venues have Laser Projector and AC?"*\n• *"How does the 2-Tier approval process work?"*\n• *"What tech is installed in Board Room 7th Floor?"*`;
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 250);
  };

  // --- ADMIN VENUE MANAGER UPDATER ---
  const handleUpdateAdminVenue = () => {
    const venueToUpdate = venues.find(v => v.id === adminSelectedVenueId);
    if (!venueToUpdate) return;

    setVenues(prev => prev.map(v => v.id === adminSelectedVenueId ? {
      ...v,
      capacity: parseInt(adminCapacityInput) || v.capacity,
      status: adminStatusInput
    } : v));

    alert(`✅ Successfully updated ${venueToUpdate.name}! New Seating Capacity: ${adminCapacityInput} seats | Status: ${adminStatusInput}.`);
  };

  const handleAddTechToAdminVenue = () => {
    if (!adminNewTechInput.trim()) return;
    setVenues(prev => prev.map(v => v.id === adminSelectedVenueId ? {
      ...v,
      tech: [...v.tech, adminNewTechInput.trim()]
    } : v));
    setAdminNewTechInput('');
  };

  const handleRemoveTechFromAdminVenue = (techItem) => {
    setVenues(prev => prev.map(v => v.id === adminSelectedVenueId ? {
      ...v,
      tech: v.tech.filter(t => t !== techItem)
    } : v));
  };

  // --- SUBMIT DIRECT BOOKING REQUISITION ---
  const onSubmitBooking = async (data) => {
    if (selectedVenues.length === 0) return alert("⚠️ Please select at least one venue from the list.");
    if (facultySigCanvas.current && facultySigCanvas.current.isEmpty()) {
      return alert("⚠️ Please draw your Faculty Digital Signature before submitting.");
    }

    const facultySignature = facultySigCanvas.current ? facultySigCanvas.current.getTrimmedCanvas().toDataURL() : null;
    const startTimeISO = moment(`${data.date} ${data.startTime}`, "YYYY-MM-DD hh:mm A").toISOString();
    const endTimeISO = moment(`${durationType === 'multi' ? data.endDate : data.date} ${data.endTime}`, "YYYY-MM-DD hh:mm A").toISOString();

    const requirementsDetails = {};
    REQUIREMENTS.forEach(req => {
      if (data[`req_${req.id}`]) {
        requirementsDetails[req.label] = data[`details_${req.id}`] || "Required";
      }
    });

    const newBooking = {
      id: `vdt-req-${Date.now().toString().slice(-6)}`,
      user_id: userSessionId,
      user_email: data.userEmail || userEmail,
      event_name: data.eventName,
      institute: data.institute,
      coordinator: data.coordinatorName,
      venue: selectedVenues.join(', '),
      start_time: startTimeISO,
      end_time: endTimeISO,
      attendees: `${data.attendeesStudent || 0} Students / ${data.attendeesOther || 0} Others`,
      external_participants: data.isExternal ? (data.externalDetails || "Yes") : "No",
      items: { requirements: requirementsDetails },
      signature_url: facultySignature,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('bookings').insert(newBooking);
    } catch (e) {
      console.log("Saved requisition to active state:", e);
    }

    setBookings(prev => [newBooking, ...prev]);
    alert("✅ Requisition Successfully Submitted! Your request has been forwarded to the Moderator for Tier-1 review.");
    reset();
    setSelectedVenues([]);
    if (facultySigCanvas.current) facultySigCanvas.current.clear();
    setActiveTab('my-bookings');
  };

  // --- MODERATOR ACTION: EDIT & APPROVE ---
  const handleModeratorApprove = async (booking) => {
    if (moderatorSigCanvas.current && moderatorSigCanvas.current.isEmpty()) {
      return alert("⚠️ Please provide a Moderator Digital Signature to approve.");
    }
    const moderatorSig = moderatorSigCanvas.current.getTrimmedCanvas().toDataURL();
    const modNotes = document.getElementById(`mod-notes-${booking.id}`)?.value || "Approved by Moderator after requirement verification.";

    const updatedBooking = {
      ...booking,
      status: 'pending_admin',
      moderator_name: userEmail.split('@')[0] || "Moderator",
      moderator_signature_url: moderatorSig,
      moderator_notes: modNotes,
      moderator_approved_at: new Date().toISOString()
    };

    try {
      await supabase.from('bookings').update({ 
        status: 'pending_admin', 
        moderator_signature_url: moderatorSig,
        moderator_notes: modNotes 
      }).eq('id', booking.id);
    } catch (e) {
      console.log("Local state updated:", e);
    }

    setBookings(prev => prev.map(b => b.id === booking.id ? updatedBooking : b));
    alert("🛡️ Moderator Tier-1 Approval Completed! Requisition forwarded to Admin for final stamping.");
  };

  // --- MODERATOR ACTION: SAVE EDITS ---
  const handleSaveModeratorEdit = async () => {
    if (!editingBooking) return;
    setBookings(prev => prev.map(b => b.id === editingBooking.id ? editingBooking : b));
    alert("✏️ Requisition details updated by Moderator.");
    setEditingBooking(null);
  };

  // --- ADMIN ACTION: FINAL SIGNATURE & STAMP ---
  const handleAdminFinalApprove = async (booking) => {
    if (adminSigCanvas.current && adminSigCanvas.current.isEmpty()) {
      return alert("⚠️ Please provide an Admin Digital Signature to apply the Official Approval Stamp.");
    }
    const adminSig = adminSigCanvas.current.getTrimmedCanvas().toDataURL();
    const approvedAt = new Date().toISOString();

    const finalApprovedBooking = {
      ...booking,
      status: 'approved',
      admin_signature_url: adminSig,
      approved_at: approvedAt
    };

    try {
      await supabase.from('bookings').update({
        status: 'approved',
        admin_signature_url: adminSig,
        approved_at: approvedAt
      }).eq('id', booking.id);
    } catch (e) {
      console.log("Local state updated:", e);
    }

    setBookings(prev => prev.map(b => b.id === booking.id ? finalApprovedBooking : b));
    alert("👑 Final Admin Approval & Official Date Stamp Applied! Status is now APPROVED.");
    generateGatePass(finalApprovedBooking);
  };

  const openRejectModal = (booking) => {
    setTargetBookingToReject(booking);
    setRejectionReasonInput('');
    setSelectedPresetReason('Schedule Conflict / Venue Pre-booked');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!targetBookingToReject) return;
    const finalReason = rejectionReasonInput.trim() || selectedPresetReason;
    const updatedBooking = {
      ...targetBookingToReject,
      status: 'rejected',
      rejection_reason: finalReason,
      rejected_by: userRole === 'admin' ? 'Admin Office' : 'Department Moderator',
      rejected_at: new Date().toISOString()
    };

    try {
      await supabase.from('bookings').update({
        status: 'rejected',
        rejection_reason: finalReason,
        rejected_by: userRole === 'admin' ? 'Admin Office' : 'Department Moderator',
        rejected_at: new Date().toISOString()
      }).eq('id', targetBookingToReject.id);
    } catch (e) {
      console.log("Local state updated:", e);
    }

    setBookings(prev => prev.map(b => b.id === targetBookingToReject.id ? updatedBooking : b));
    setRejectModalOpen(false);
    setTargetBookingToReject(null);
    alert(`❌ Request #${targetBookingToReject.id} has been Rejected.\nReason: ${finalReason}`);
  };

  const handleRejectBooking = async (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      openRejectModal(booking);
    } else {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'rejected', rejection_reason: 'Request rejected by authority.' } : b));
    }
  };

  // Filter Bookings
  const approvedBookings = bookings.filter(b => b.status === 'approved');
  const pendingModeratorBookings = bookings.filter(b => b.status === 'pending');
  const pendingAdminBookings = bookings.filter(b => b.status === 'pending_admin');

  return (
    <div className={`min-h-screen font-sans pb-16 selection:bg-orange-500 selection:text-white transition-colors duration-300 ${theme === 'light' ? 'bg-amber-50/50 text-stone-900' : 'bg-stone-900 text-stone-100'}`}>
      
      {/* --- TOP BRAND HEADER & NAVBAR --- */}
      <header className="sticky top-0 z-50 glass-nav shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Company Title */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2.5 rounded-2xl shadow-lg shadow-orange-500/30 text-white shrink-0">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                Vidyalankar Dnyanpeeth Trust
              </h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                <span>V - Booking Requisition Portal</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
            </div>
          </div>

          {/* User Role Switcher, Dark Mode Toggle & Azure OAuth Login */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="hidden md:flex items-center gap-1.5 bg-stone-950/80 px-3 py-1.5 rounded-xl border border-stone-800 text-xs font-bold text-stone-300">
              <span className="text-[10px] text-stone-500 uppercase tracking-wider">Role:</span>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase tracking-widest ${userRole === 'admin' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : userRole === 'moderator' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                {userRole.toUpperCase()}
              </span>
            </div>

            <ThemeToggle theme={theme} setTheme={setTheme} />
            <LoginButton />
          </div>
        </div>

        {/* --- NAVIGATION TABS BAR --- */}
        <div className="border-t border-stone-800/80 bg-stone-950/90 overflow-x-auto hide-scrollbar">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 sm:gap-2 py-1.5 text-xs font-bold">
            
            {/* 1. GENERAL PUBLIC LANDING CALENDAR */}
            <button 
              onClick={() => setActiveTab('landing-calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${activeTab === 'landing-calendar' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-stone-400 hover:text-white hover:bg-stone-900'}`}
            >
              <Calendar size={15}/> <span>Public Events Calendar</span>
            </button>

            {/* 2. DIRECT BOOK VENUE */}
            <button 
              onClick={() => setActiveTab('book')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${activeTab === 'book' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-stone-400 hover:text-white hover:bg-stone-900'}`}
            >
              <PenTool size={15}/> <span>Book Venue</span>
            </button>

            {/* 3. SPECIFIC REQUIREMENTS */}
            <button 
              onClick={() => setActiveTab('requirements')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${activeTab === 'requirements' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-stone-400 hover:text-white hover:bg-stone-900'}`}
            >
              <CheckSquare size={15}/> <span>Specific Requirements</span>
            </button>

            {/* 4. ANALYTICS & DEMAND INSIGHTS */}
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-stone-400 hover:text-white hover:bg-stone-900'}`}
            >
              <BarChart3 size={15}/> <span>Demand Analytics</span>
            </button>

            {/* 5. AI VENUE ASSISTANT CHATBOT */}
            <button 
              onClick={() => setActiveTab('chatbot')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${activeTab === 'chatbot' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-stone-400 hover:text-white hover:bg-stone-900'}`}
            >
              <Bot size={15}/> <span>AI Assistant</span>
            </button>

            {/* 6. MODERATOR REVIEW */}
            {(userRole === 'moderator' || userRole === 'admin') && (
              <button 
                onClick={() => setActiveTab('moderator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${activeTab === 'moderator' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-stone-400 hover:text-white hover:bg-stone-900'}`}
              >
                <UserCheck size={15}/> 
                <span>Moderator Review</span>
                {pendingModeratorBookings.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                    {pendingModeratorBookings.length}
                  </span>
                )}
              </button>
            )}

            {/* 7. ADMIN CONSOLE & VENUE SPEC MANAGER */}
            {userRole === 'admin' && (
              <button 
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${activeTab === 'admin' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-stone-400 hover:text-white hover:bg-stone-900'}`}
              >
                <ShieldCheck size={15}/> 
                <span>Admin & Venue Manager</span>
                {pendingAdminBookings.length > 0 && (
                  <span className="bg-amber-500 text-stone-950 text-[10px] px-1.5 py-0.5 rounded-full font-black animate-bounce">
                    {pendingAdminBookings.length}
                  </span>
                )}
              </button>
            )}

            {/* 8. MY REQUISITIONS */}
            <button 
              onClick={() => setActiveTab('my-bookings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${activeTab === 'my-bookings' ? 'bg-stone-800 text-orange-400 border border-orange-500/30' : 'text-stone-400 hover:text-white hover:bg-stone-900'}`}
            >
              <FileText size={15}/> <span>My Requisitions</span>
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN BODY CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* ====================================================================== */}
        {/* TAB 1: GENERAL PUBLIC LANDING EVENTS CALENDAR */}
        {/* ====================================================================== */}
        {activeTab === 'landing-calendar' && (
          <div className="animate-fade-in-up space-y-6 max-w-6xl mx-auto">
            
            {/* Hero Landing Banner */}
            <div className="glass-orange rounded-3xl p-6 sm:p-10 text-stone-900 shadow-3d relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                  Vidyalankar Dnyanpeeth Trust Central Portal
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-amber-950">
                  Campus Events & Approved Venue Calendar
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-amber-900 leading-relaxed">
                  Welcome to the public events calendar. View all scheduled seminars, tech workshops, cultural summits, and academic gatherings across VDT, VSIT, VIT, VPT, VSB, VCP, and VIIE campus venues.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button onClick={() => setActiveTab('book')} className="bg-stone-900 text-white font-bold text-xs px-6 py-3.5 rounded-2xl hover:bg-black transition-all flex items-center gap-2 shadow-xl">
                  <PenTool size={16}/> Direct Book Venue
                </button>
                <button onClick={() => setActiveTab('chatbot')} className="bg-amber-400 text-amber-950 font-bold text-xs px-6 py-3.5 rounded-2xl hover:bg-amber-300 transition-all flex items-center gap-2 shadow-md">
                  <Bot size={16}/> Ask AI Chatbot
                </button>
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Calendar className="text-orange-400" size={20}/> Approved Campus Schedule
                </h3>
                <p className="text-xs text-stone-400">Total Approved Events: <strong className="text-white">{approvedBookings.length}</strong></p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search size={14} className="absolute left-3 top-3.5 text-stone-500" />
                  <input 
                    type="text" 
                    value={calendarSearch} 
                    onChange={(e) => setCalendarSearch(e.target.value)} 
                    placeholder="Search by event or venue name..." 
                    className="w-full pl-9 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white outline-none focus:border-orange-500" 
                  />
                </div>

                <select 
                  value={calendarInstituteFilter} 
                  onChange={(e) => setCalendarInstituteFilter(e.target.value)} 
                  className="bg-stone-900 border border-stone-800 px-3.5 py-2.5 rounded-xl text-xs font-bold text-stone-200 outline-none"
                >
                  <option value="ALL">All Institutes</option>
                  {INSTITUTES.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                </select>
              </div>
            </div>

            {/* Calendar Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {approvedBookings
                .filter(b => {
                  const matchesSearch = b.event_name?.toLowerCase().includes(calendarSearch.toLowerCase()) || b.venue?.toLowerCase().includes(calendarSearch.toLowerCase());
                  const matchesInst = calendarInstituteFilter === 'ALL' || b.institute === calendarInstituteFilter;
                  return matchesSearch && matchesInst;
                })
                .map((event) => {
                  const venueObj = venues.find(v => v.name === event.venue || event.venue.includes(v.name));
                  return (
                    <div 
                      key={event.id} 
                      onClick={() => setSelectedEventModal(event)}
                      className="bg-stone-950/80 border border-stone-800 hover:border-orange-500/50 rounded-3xl p-6 shadow-xl cursor-pointer hover:-translate-y-1 transition-all group relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">
                          {event.institute || 'VDT'}
                        </span>
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 size={10}/> Approved & Sealed
                        </span>
                      </div>

                      <h3 className="text-base font-black text-white group-hover:text-orange-400 transition-colors leading-tight mb-3">
                        {event.event_name}
                      </h3>

                      <div className="space-y-2 text-xs text-stone-400 font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-orange-400 shrink-0"/>
                          <span className="truncate">{event.venue}</span>
                        </div>

                        {venueObj && (
                          <div className="flex items-center gap-2 text-stone-400 text-[11px]">
                            <Users size={13} className="text-amber-400 shrink-0"/>
                            <span>Seating Capacity: <strong className="text-white">{venueObj.capacity} seats</strong></span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-blue-400 shrink-0"/>
                          <span>{moment(event.start_time).format('D MMM YYYY')}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-amber-400 shrink-0"/>
                          <span>{moment(event.start_time).format('hh:mm A')} - {moment(event.end_time).format('hh:mm A')}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] font-bold text-stone-400 group-hover:text-orange-400">
                        <span>Coordinator: {event.coordinator}</span>
                        <ChevronRight size={16}/>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 2: DIRECT BOOKING FORM WITH SEATING CAPACITIES */}
        {/* ====================================================================== */}
        {activeTab === 'book' && (
          <div className="animate-fade-in-up space-y-6 max-w-5xl mx-auto">
            
            <div className="glass-orange rounded-3xl p-6 sm:p-8 text-stone-900 shadow-3d relative overflow-hidden">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-amber-950 flex items-center gap-3">
                <Sparkles size={24} className="text-orange-600"/> Direct Venue Booking Requisition
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-amber-900 mt-1">
                Select from campus venues with displayed seating capacities & technical AV equipment. Requisitions follow 2-tier approval (Moderator Review &rarr; Admin Final Stamp).
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmitBooking)} className="space-y-6">
              
              {/* Module 1: Core Details */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-orange-400 mb-6 flex items-center gap-2 border-b border-stone-800 pb-4">
                  <LayoutGrid size={16}/> 1. Event & Organization Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 block">Institute / Unit</label>
                    <select {...register("institute")} className="w-full bg-stone-900 border border-stone-700 p-3.5 rounded-xl text-xs font-bold text-stone-100 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all">
                      {INSTITUTES.map(inst => (
                        <option key={inst} value={inst}>{inst} - Vidyalankar</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 block">Teacher / Faculty Coordinator</label>
                    <input {...register("coordinatorName", { required: true })} placeholder="Faculty Full Name" className="w-full bg-stone-900 border border-stone-700 p-3.5 rounded-xl text-xs font-bold text-stone-100 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 block">Activity Name / Event Title</label>
                    <input {...register("eventName", { required: true })} placeholder="e.g. National Level Seminar / Technical Workshop / Cultural Event" className="w-full bg-stone-900 border border-stone-700 p-4 rounded-2xl text-sm font-black text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" />
                  </div>
                </div>
              </div>

              {/* Module 2: Schedule & Audience */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-orange-400 mb-6 flex items-center gap-2 border-b border-stone-800 pb-4">
                  <CalendarClock size={16}/> 2. Schedule, Timing & Audience
                </h3>

                <div className="flex flex-wrap gap-4 mb-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-stone-300 cursor-pointer bg-stone-900 px-4 py-2.5 rounded-xl border border-stone-800">
                    <input type="radio" value="single" {...register("durationType")} className="accent-orange-500 w-4 h-4"/> Single Day Event
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-stone-300 cursor-pointer bg-stone-900 px-4 py-2.5 rounded-xl border border-stone-800">
                    <input type="radio" value="multi" {...register("durationType")} className="accent-orange-500 w-4 h-4"/> Multi Day Event
                  </label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className={`${durationType === 'multi' ? 'col-span-2 md:col-span-1' : 'col-span-2'}`}>
                    <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Start Date</label>
                    <input type="date" {...register("date", { required: true })} className="w-full bg-stone-900 border border-stone-700 p-3 rounded-xl text-xs font-bold text-stone-100 outline-none" />
                  </div>

                  {durationType === 'multi' && (
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">End Date</label>
                      <input type="date" {...register("endDate", { required: true })} className="w-full bg-stone-900 border border-stone-700 p-3 rounded-xl text-xs font-bold text-stone-100 outline-none" />
                    </div>
                  )}

                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Start Time</label>
                    <select {...register("startTime", { required: true })} className="w-full bg-stone-900 border border-stone-700 p-3 rounded-xl text-xs font-bold text-stone-100 outline-none">
                      <option value="">Select Time</option>
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">End Time</label>
                    <select {...register("endTime", { required: true })} className="w-full bg-stone-900 border border-stone-700 p-3 rounded-xl text-xs font-bold text-stone-100 outline-none">
                      <option value="">Select Time</option>
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6 border-t border-stone-800">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase mb-2 flex items-center gap-1"><Users size={12}/> Student Attendees</label>
                      <input type="number" {...register("attendeesStudent")} placeholder="0" className="w-full bg-stone-900 border border-stone-700 p-3 rounded-xl text-xs font-bold text-stone-100 outline-none" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase mb-2 flex items-center gap-1"><User size={12}/> Other Attendees</label>
                      <input type="number" {...register("attendeesOther")} placeholder="0" className="w-full bg-stone-900 border border-stone-700 p-3 rounded-xl text-xs font-bold text-stone-100 outline-none" />
                    </div>
                  </div>

                  <div className="bg-amber-950/30 p-4 rounded-2xl border border-amber-500/20">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" {...register("isExternal")} className="w-4 h-4 accent-orange-500 rounded mt-0.5" />
                      <span className="text-xs font-bold text-amber-200 leading-tight">External speakers / Media / Guests involved?</span>
                    </label>
                    {isExternal && (
                      <input {...register("externalDetails")} placeholder="Specify organization or speaker names..." className="w-full mt-3 bg-stone-900 border border-amber-500/30 p-3 rounded-xl text-xs font-medium text-white outline-none" />
                    )}
                  </div>
                </div>
              </div>

              {/* Module 3: Venue Selector with Seating Capacities */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-orange-400 mb-6 flex items-center justify-between border-b border-stone-800 pb-4">
                  <span className="flex items-center gap-2"><MapPin size={16}/> 3. Select Venue(s) & View Seating Capacity</span>
                  <span className="text-[10px] font-bold text-stone-400 uppercase">Selected: {selectedVenues.length}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                  {venues.map(v => {
                    const isSelected = selectedVenues.includes(v.name);
                    return (
                      <div 
                        key={v.id} 
                        onClick={() => toggleVenue(v.name)} 
                        className={`cursor-pointer p-3.5 rounded-2xl text-xs font-bold flex flex-col justify-between border transition-all ${isSelected ? 'bg-orange-500/20 text-orange-300 border-orange-500 shadow-md shadow-orange-500/10' : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            {isSelected ? <CheckSquare size={16} className="text-orange-400 shrink-0"/> : <Square size={16} className="text-stone-600 shrink-0"/>} 
                            <span className="leading-tight text-white font-black">{v.name}</span>
                          </div>
                          <span className="bg-stone-950 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md text-[10px] shrink-0 font-bold">
                            {v.capacity} seats
                          </span>
                        </div>

                        <div className="text-[10px] text-stone-400 font-medium pl-6">
                          <span>Tech: {v.tech.slice(0, 3).join(', ')}{v.tech.length > 3 ? '...' : ''}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Module 4: Specific Logistics Requirements Checklist */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-orange-400 mb-6 flex items-center justify-between border-b border-stone-800 pb-4">
                  <span className="flex items-center gap-2"><CheckSquare size={16}/> 4. Specific Logistics Checklist</span>
                  <span className="text-[10px] text-stone-400 italic">Select specific audio, video, lighting & catering setup</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {REQUIREMENTS.map((req) => {
                    const isChecked = watch(`req_${req.id}`);
                    return (
                      <div key={req.id} className={`p-3.5 rounded-2xl border transition-all ${isChecked ? 'bg-stone-900 border-orange-500 shadow-md' : 'bg-stone-900/40 border-stone-800 hover:border-stone-700'}`}>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" {...register(`req_${req.id}`)} className="w-4 h-4 accent-orange-500 rounded shrink-0" />
                          <span className={`text-xs font-bold leading-tight ${isChecked ? 'text-white' : 'text-stone-300'}`}>{req.label}</span>
                          {req.icon && <span className={`ml-auto shrink-0 ${isChecked ? 'text-orange-400' : 'text-stone-600'}`}>{req.icon}</span>}
                        </label>

                        {req.hasDetails && isChecked && (
                          <input {...register(`details_${req.id}`)} placeholder="Specify details..." className="w-full mt-3 bg-stone-950 border border-orange-500/40 p-2.5 rounded-xl text-xs outline-none text-white placeholder-stone-500 focus:border-orange-400 transition-colors" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Module 5: Faculty Signature Canvas */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-orange-400 mb-4 flex items-center gap-2">
                  <PenTool size={16}/> 5. Faculty Applicant Digital Signature
                </h3>
                <p className="text-[11px] text-stone-400 mb-3">Draw your signature in the box below to authorize this venue booking requisition.</p>

                <div className="h-40 border-2 border-dashed border-stone-700 rounded-2xl relative bg-stone-900 overflow-hidden group hover:border-orange-500/50 transition-colors">
                  <SignatureCanvas ref={facultySigCanvas} penColor="#f97316" canvasProps={{className: 'w-full h-full absolute inset-0'}} />
                  <button type="button" onClick={() => facultySigCanvas.current?.clear()} className="absolute bottom-3 right-3 text-[10px] font-bold text-stone-400 bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700 hover:text-red-400 transition-colors">
                    Clear
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="w-full py-5 rounded-2xl font-black text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 shadow-2xl shadow-orange-500/30 hover:-translate-y-1 transition-all active:scale-[0.99] uppercase tracking-widest flex items-center justify-center gap-3 text-sm">
                <Zap size={20}/> Submit Venue Requisition
              </button>
            </form>
          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 3: SPECIFIC REQUIREMENTS CATALOG */}
        {/* ====================================================================== */}
        {activeTab === 'requirements' && (
          <div className="animate-fade-in-up space-y-6 max-w-6xl mx-auto">
            
            <div className="glass-orange rounded-3xl p-6 sm:p-8 text-stone-900 shadow-3d flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-amber-950 flex items-center gap-2">
                  <CheckSquare size={24} className="text-orange-600"/> Specific Technical & Logistics Requirements Catalog
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-amber-900 mt-1">
                  Explore equipment specs, sound setups, broadcasting tools, lighting, and catering packages available for campus venues.
                </p>
              </div>

              <button onClick={() => setActiveTab('book')} className="bg-stone-900 text-white font-bold text-xs px-5 py-3 rounded-2xl hover:bg-black transition-all shrink-0 flex items-center gap-2 shadow-lg">
                <span>Book Venue Now</span> <ArrowRight size={16}/>
              </button>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-6 shadow-xl hover:border-orange-500/40 transition-all">
                <div className="bg-blue-500/20 text-blue-400 p-3 rounded-2xl w-fit mb-4 border border-blue-500/30">
                  <Mic size={24}/>
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-wider mb-2">Audio & Sound Systems</h3>
                <p className="text-xs text-stone-400 mb-4 leading-relaxed">
                  High-fidelity line array speakers, wireless lapel & handheld microphones, and digital audio recorders.
                </p>
                <ul className="text-xs text-stone-300 space-y-2 border-t border-stone-800 pt-4">
                  <li className="flex items-center gap-2">• Wireless Handheld Mics (Up to 6)</li>
                  <li className="flex items-center gap-2">• Collar & Headset Lapel Mics</li>
                  <li className="flex items-center gap-2">• Podium Dedicated Gooseneck Mic</li>
                  <li className="flex items-center gap-2">• Digital Audio Master Mixer</li>
                </ul>
              </div>

              <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-6 shadow-xl hover:border-orange-500/40 transition-all">
                <div className="bg-orange-500/20 text-orange-400 p-3 rounded-2xl w-fit mb-4 border border-orange-500/30">
                  <Monitor size={24}/>
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-wider mb-2">Visual & Display Systems</h3>
                <p className="text-xs text-stone-400 mb-4 leading-relaxed">
                  High-lumens laser projectors, LED backdrop screens, presentation Clickers, and dual monitor setup.
                </p>
                <ul className="text-xs text-stone-300 space-y-2 border-t border-stone-800 pt-4">
                  <li className="flex items-center gap-2">• 1080p / 4K Laser Projectors</li>
                  <li className="flex items-center gap-2">• Stage LED Backdrop Video Wall</li>
                  <li className="flex items-center gap-2">• Wireless Presentation Clickers</li>
                  <li className="flex items-center gap-2">• Stage Confidence Monitors</li>
                </ul>
              </div>

              <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-6 shadow-xl hover:border-orange-500/40 transition-all">
                <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-2xl w-fit mb-4 border border-emerald-500/30">
                  <Video size={24}/>
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-wider mb-2">Media & Live Streaming</h3>
                <p className="text-xs text-stone-400 mb-4 leading-relaxed">
                  Professional multi-cam video recording, YouTube/Teams live streaming, and official photographer setup.
                </p>
                <ul className="text-xs text-stone-300 space-y-2 border-t border-stone-800 pt-4">
                  <li className="flex items-center gap-2">• Multi-Cam 4K Video Setup</li>
                  <li className="flex items-center gap-2">• Live Streaming to YouTube / MS Teams</li>
                  <li className="flex items-center gap-2">• Official Event Photography</li>
                  <li className="flex items-center gap-2">• Post-Event Edited Highlight Reel</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 4: ANALYTICS & DEMAND INSIGHTS DASHBOARD */}
        {/* ====================================================================== */}
        {activeTab === 'analytics' && (
          <div className="animate-fade-in-up space-y-6 max-w-6xl mx-auto">
            
            <div className="glass-orange rounded-3xl p-6 sm:p-8 text-stone-900 shadow-3d flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-amber-950 flex items-center gap-2">
                  <BarChart3 size={24} className="text-orange-600"/> Venue Usage & Demand Analytics Dashboard
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-amber-900 mt-1">
                  Real-time analytics on venue popularity, peak booking hours, demand ratios, and logistics equipment frequency across Vidyalankar Dnyanpeeth Trust.
                </p>
              </div>
            </div>

            {/* Metrics KPI Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-stone-950/80 border border-stone-800 p-5 rounded-3xl shadow-xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Total Requisitions</span>
                <span className="text-2xl sm:text-3xl font-black text-white">{bookings.length + 18}</span>
                <span className="text-[10px] text-emerald-400 font-bold block mt-1">+14% vs last month</span>
              </div>

              <div className="bg-stone-950/80 border border-stone-800 p-5 rounded-3xl shadow-xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Approval Rate</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">92.4%</span>
                <span className="text-[10px] text-stone-400 font-bold block mt-1">2-tier verification active</span>
              </div>

              <div className="bg-stone-950/80 border border-stone-800 p-5 rounded-3xl shadow-xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Highest Demand Venue</span>
                <span className="text-lg font-black text-orange-400 truncate block">Auditorium</span>
                <span className="text-[10px] text-amber-400 font-bold block mt-1">300 seating capacity</span>
              </div>

              <div className="bg-stone-950/80 border border-stone-800 p-5 rounded-3xl shadow-xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Peak Time Slot</span>
                <span className="text-lg font-black text-blue-400 block">10:00 AM - 02:00 PM</span>
                <span className="text-[10px] text-stone-400 font-bold block mt-1">Wednesdays & Thursdays</span>
              </div>
            </div>

            {/* Visual Charts & Rankings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Venue Demand Ranking */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center justify-between border-b border-stone-800 pb-3">
                  <span>Most Demanded Venues</span>
                  <span className="text-[10px] text-orange-400 font-bold">BY BOOKING FREQUENCY</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-stone-200 mb-1">
                      <span>1. Auditorium (300 Seats)</span>
                      <span className="text-orange-400">38% Demand</span>
                    </div>
                    <div className="h-2.5 bg-stone-900 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full w-[38%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-stone-200 mb-1">
                      <span>2. VIT Amphitheatre (500 Seats)</span>
                      <span className="text-blue-400">24% Demand</span>
                    </div>
                    <div className="h-2.5 bg-stone-900 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full w-[24%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-stone-200 mb-1">
                      <span>3. Y Block Seminar Hall (150 Seats)</span>
                      <span className="text-amber-400">18% Demand</span>
                    </div>
                    <div className="h-2.5 bg-stone-900 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full w-[18%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-stone-200 mb-1">
                      <span>4. Board Room 7th Floor (25 Seats)</span>
                      <span className="text-emerald-400">12% Demand</span>
                    </div>
                    <div className="h-2.5 bg-stone-900 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[12%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment Demand Frequency */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center justify-between border-b border-stone-800 pb-3">
                  <span>Logistics Equipment Demand</span>
                  <span className="text-[10px] text-blue-400 font-bold">REQUISITION CHECKLIST</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 bg-stone-900 rounded-2xl border border-stone-800">
                    <span className="font-bold text-stone-200">🔊 Sound System & Microphones</span>
                    <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-xl text-xs font-black">94% Requests</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-stone-900 rounded-2xl border border-stone-800">
                    <span className="font-bold text-stone-200">📹 HD Projector & Video Wall</span>
                    <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-xl text-xs font-black">81% Requests</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-stone-900 rounded-2xl border border-stone-800">
                    <span className="font-bold text-stone-200">☕ VIP Catering & High Tea</span>
                    <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-xl text-xs font-black">65% Requests</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-stone-900 rounded-2xl border border-stone-800">
                    <span className="font-bold text-stone-200">🎥 4K Live Streaming Setup</span>
                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-xl text-xs font-black">42% Requests</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 5: VDT AI VENUE ASSISTANT CHATBOT */}
        {/* ====================================================================== */}
        {activeTab === 'chatbot' && (
          <div className="animate-fade-in-up space-y-6 max-w-4xl mx-auto">
            
            <div className="glass-orange rounded-3xl p-6 sm:p-8 text-stone-900 shadow-3d flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-amber-950 flex items-center gap-2">
                  <Bot size={24} className="text-purple-700"/> VDT AI Campus Venue Assistant
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-amber-900 mt-1">
                  Ask capacity questions like <em>"Can 200 people seat in auditorium?"</em> or inquiry technical AV specs for any venue.
                </p>
              </div>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => handleSendChatMessage("Can 200 people seat in auditorium?")} 
                className="bg-stone-950 border border-purple-500/30 text-purple-300 hover:bg-purple-900/30 text-xs px-3.5 py-2 rounded-xl font-bold transition-all"
              >
                💡 "Can 200 people seat in auditorium?"
              </button>
              <button 
                onClick={() => handleSendChatMessage("Which venues have seating for 150+ people?")} 
                className="bg-stone-950 border border-purple-500/30 text-purple-300 hover:bg-purple-900/30 text-xs px-3.5 py-2 rounded-xl font-bold transition-all"
              >
                💡 "Which venues have seating for 150+ people?"
              </button>
              <button 
                onClick={() => handleSendChatMessage("What tech is in Board Room 7th Floor?")} 
                className="bg-stone-950 border border-purple-500/30 text-purple-300 hover:bg-purple-900/30 text-xs px-3.5 py-2 rounded-xl font-bold transition-all"
              >
                💡 "What tech is in Board Room 7th Floor?"
              </button>
            </div>

            {/* Chat Box Container */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-6 shadow-2xl flex flex-col h-[480px]">
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'bot' && (
                      <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        <Bot size={16}/>
                      </div>
                    )}
                    <div className={`p-4 rounded-2xl max-w-lg text-xs leading-relaxed font-medium whitespace-pre-line ${msg.sender === 'user' ? 'bg-orange-500 text-white rounded-br-none' : 'bg-stone-900 text-stone-200 border border-stone-800 rounded-bl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="mt-4 pt-4 border-t border-stone-800 flex items-center gap-3">
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()} 
                  placeholder="Ask a question e.g. 'Can 200 people seat in auditorium?'..." 
                  className="flex-1 bg-stone-900 border border-stone-700 px-4 py-3 rounded-2xl text-xs text-white outline-none focus:border-purple-500 transition-colors" 
                />
                <button 
                  onClick={() => handleSendChatMessage()} 
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
                >
                  <span>Send</span> <Send size={14}/>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 6: MODERATOR REVIEW PORTAL */}
        {/* ====================================================================== */}
        {activeTab === 'moderator' && (userRole === 'moderator' || userRole === 'admin') && (
          <div className="animate-fade-in-up space-y-6 max-w-5xl mx-auto">
            <div className="bg-blue-950/40 border border-blue-500/30 rounded-3xl p-6 text-stone-100 shadow-xl">
              <h2 className="text-xl font-black uppercase tracking-tight text-blue-300 flex items-center gap-2">
                <UserCheck size={22} className="text-blue-400"/> Tier-1 Moderator Review & Editing Portal
              </h2>
              <p className="text-xs text-blue-200/80 mt-1">
                Moderators review faculty venue requisitions, verify technical logistics, make adjustments if needed, draw Moderator Digital Signatures, and forward to Admin.
              </p>
            </div>

            <div className="space-y-4">
              {pendingModeratorBookings.map((b) => (
                <div key={b.id} className="bg-stone-950/80 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-6">
                  
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-800 pb-4">
                    <div>
                      <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider mb-2 inline-block">
                        {b.institute} - Pending Tier 1 Review
                      </span>
                      <h3 className="text-lg font-black text-white">{b.event_name}</h3>
                      <p className="text-xs text-stone-400 mt-0.5">Faculty Coordinator: <strong className="text-stone-200">{b.coordinator}</strong> ({b.user_email})</p>
                    </div>

                    <button 
                      onClick={() => setEditingBooking({ ...b })} 
                      className="flex items-center gap-1.5 text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-2 rounded-xl transition-all border border-stone-700"
                    >
                      <Edit3 size={14}/> Edit Requisition Details
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-stone-900/60 p-4 rounded-2xl border border-stone-800">
                      <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Allocated Venues</span>
                      <span className="font-bold text-white">{b.venue}</span>
                    </div>

                    <div className="bg-stone-900/60 p-4 rounded-2xl border border-stone-800">
                      <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Timing (IST)</span>
                      <span className="font-bold text-white">{moment(b.start_time).format('D MMM YYYY, h:mm A')} - {moment(b.end_time).format('h:mm A')}</span>
                    </div>
                  </div>

                  <div className="bg-stone-900/40 p-4 rounded-2xl border border-stone-800">
                    <span className="text-[10px] font-bold text-stone-400 uppercase block mb-2">Requested Logistics</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-300">
                      {b.items?.requirements ? Object.entries(b.items.requirements).map(([k, v]) => (
                        <div key={k} className="flex items-center gap-2 bg-stone-900 p-2 rounded-xl border border-stone-800">
                          <CheckCircle2 size={12} className="text-blue-400 shrink-0"/>
                          <span><strong>{k}:</strong> {v}</span>
                        </div>
                      )) : <p className="text-stone-500">Standard venue setup</p>}
                    </div>
                  </div>

                  {b.signature_url && (
                    <div className="bg-stone-900/60 p-3.5 rounded-2xl border border-stone-800 flex items-center gap-4">
                      <span className="text-[10px] font-bold text-stone-400 uppercase">Faculty Signature:</span>
                      <img src={b.signature_url} alt="Faculty Sig" className="h-10 w-auto bg-white/10 p-1 rounded-lg border border-white/20"/>
                    </div>
                  )}

                  <div className="bg-blue-950/20 border border-blue-500/20 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                      <PenTool size={14}/> Moderator Signature & Notes
                    </h4>

                    <input 
                      id={`mod-notes-${b.id}`} 
                      placeholder="Add moderator remarks / instructions for admin..." 
                      className="w-full bg-stone-900 border border-stone-700 p-3 rounded-xl text-xs text-white outline-none focus:border-blue-500" 
                    />

                    <div className="h-28 border-2 border-dashed border-stone-700 rounded-xl relative bg-stone-900 overflow-hidden">
                      <SignatureCanvas ref={moderatorSigCanvas} penColor="#3b82f6" canvasProps={{className: 'w-full h-full absolute inset-0'}} />
                      <button type="button" onClick={() => moderatorSigCanvas.current?.clear()} className="absolute bottom-2 right-2 text-[9px] font-bold text-stone-400 bg-stone-800 px-2.5 py-1 rounded-md border border-stone-700">Clear</button>
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                      <button onClick={() => handleRejectBooking(b.id)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20">
                        Reject
                      </button>

                      <button onClick={() => handleModeratorApprove(b)} className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 flex items-center gap-2">
                        <CheckCircle2 size={16}/> Approve & Forward to Admin
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {pendingModeratorBookings.length === 0 && (
                <div className="text-center py-20 bg-stone-950/60 rounded-3xl border border-dashed border-stone-800">
                  <UserCheck size={36} className="mx-auto text-stone-600 mb-3"/>
                  <p className="text-stone-400 font-bold text-sm">No pending moderator requisitions.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 7: ADMIN CONSOLE & VENUE SEATING CAPACITY / TECH MANAGER */}
        {/* ====================================================================== */}
        {activeTab === 'admin' && userRole === 'admin' && (
          <div className="animate-fade-in-up space-y-8 max-w-5xl mx-auto">
            
            {/* Section 1: Final Approval Stamping Console */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-3xl p-6 text-stone-100 shadow-xl">
              <h2 className="text-xl font-black uppercase tracking-tight text-emerald-300 flex items-center gap-2">
                <ShieldCheck size={22} className="text-emerald-400"/> Tier-2 Admin Final Stamping & Seal Console
              </h2>
              <p className="text-xs text-emerald-200/80 mt-1">
                Final approval console for Vidyalankar Dnyanpeeth Trust. Review moderator notes, apply Admin Digital Signatures, and affix the Official Date Stamp.
              </p>
            </div>

            <div className="space-y-4">
              {pendingAdminBookings.map((b) => (
                <div key={b.id} className="bg-stone-950/80 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-6">
                  
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-800 pb-4">
                    <div>
                      <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider mb-2 inline-block">
                        {b.institute} - Pending Final Admin Seal
                      </span>
                      <h3 className="text-lg font-black text-white">{b.event_name}</h3>
                      <p className="text-xs text-stone-400 mt-0.5">Faculty: <strong>{b.coordinator}</strong> | Venue: <strong className="text-orange-400">{b.venue}</strong></p>
                    </div>

                    <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <UserCheck size={14}/> Verified by Moderator ({b.moderator_name})
                    </span>
                  </div>

                  {b.moderator_notes && (
                    <div className="bg-blue-950/30 border border-blue-500/20 p-4 rounded-2xl text-xs text-blue-200">
                      <strong>Moderator Remarks:</strong> {b.moderator_notes}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {b.signature_url && (
                      <div className="bg-stone-900/60 p-3 rounded-2xl border border-stone-800">
                        <span className="text-[10px] font-bold text-stone-400 uppercase block mb-2">1. Faculty Signature</span>
                        <img src={b.signature_url} alt="Faculty Sig" className="h-10 w-auto bg-white/10 p-1 rounded-lg border border-white/20"/>
                      </div>
                    )}

                    {b.moderator_signature_url && (
                      <div className="bg-stone-900/60 p-3 rounded-2xl border border-stone-800">
                        <span className="text-[10px] font-bold text-stone-400 uppercase block mb-2">2. Moderator Signature</span>
                        <img src={b.moderator_signature_url} alt="Moderator Sig" className="h-10 w-auto bg-white/10 p-1 rounded-lg border border-white/20"/>
                      </div>
                    )}
                  </div>

                  <div className="bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-2"><PenTool size={14}/> 3. Admin Approval Signature & Official Stamp</span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-md">LIVE STAMPING ACTIVE</span>
                    </h4>

                    <div className="h-28 border-2 border-dashed border-stone-700 rounded-xl relative bg-stone-900 overflow-hidden">
                      <SignatureCanvas ref={adminSigCanvas} penColor="#10b981" canvasProps={{className: 'w-full h-full absolute inset-0'}} />
                      <button type="button" onClick={() => adminSigCanvas.current?.clear()} className="absolute bottom-2 right-2 text-[9px] font-bold text-stone-400 bg-stone-800 px-2.5 py-1 rounded-md border border-stone-700">Clear</button>
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                      <button onClick={() => handleRejectBooking(b.id)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20">
                        Reject
                      </button>

                      <button onClick={() => handleAdminFinalApprove(b)} className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/30 flex items-center gap-2">
                        <Award size={16}/> Final Approve & Apply Date Stamp
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {pendingAdminBookings.length === 0 && (
                <div className="text-center py-10 bg-stone-950/60 rounded-3xl border border-dashed border-stone-800">
                  <ShieldCheck size={32} className="mx-auto text-stone-600 mb-2"/>
                  <p className="text-stone-400 font-bold text-xs">No requisitions awaiting admin final approval.</p>
                </div>
              )}
            </div>

            {/* Section 2: ADMIN VENUE CAPACITY & TECH SPECS MANAGER */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="border-b border-stone-800 pb-4">
                <h3 className="text-base font-black text-amber-400 uppercase tracking-tight flex items-center gap-2">
                  <Sliders size={20}/> Admin Control: Venue Seating Capacity & Installed Tech Manager
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Dynamically adjust seating capacities, add or remove installed AV tech specs, or set maintenance status for any Vidyalankar Dnyanpeeth Trust venue.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Select Venue to Edit */}
                <div>
                  <label className="text-[11px] font-bold text-stone-400 uppercase block mb-2">Select Venue to Edit</label>
                  <select 
                    value={adminSelectedVenueId} 
                    onChange={(e) => {
                      setAdminSelectedVenueId(e.target.value);
                      const target = venues.find(v => v.id === e.target.value);
                      if (target) {
                        setAdminCapacityInput(target.capacity);
                        setAdminStatusInput(target.status);
                      }
                    }} 
                    className="w-full bg-stone-900 border border-stone-700 p-3 rounded-xl text-xs font-bold text-white outline-none"
                  >
                    {venues.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.capacity} seats)</option>
                    ))}
                  </select>

                  {/* Seating Capacity & Status Inputs */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Seating Capacity</label>
                      <input 
                        type="number" 
                        value={adminCapacityInput} 
                        onChange={(e) => setAdminCapacityInput(e.target.value)} 
                        className="w-full bg-stone-900 border border-stone-700 p-3 rounded-xl text-xs font-bold text-white outline-none" 
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Venue Status</label>
                      <select 
                        value={adminStatusInput} 
                        onChange={(e) => setAdminStatusInput(e.target.value)} 
                        className="w-full bg-stone-900 border border-stone-700 p-3 rounded-xl text-xs font-bold text-white outline-none"
                      >
                        <option value="Available">Available</option>
                        <option value="Under Maintenance">Under Maintenance</option>
                        <option value="High Demand">High Demand</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={handleUpdateAdminVenue} 
                    className="mt-4 w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Check size={16}/> Save Capacity & Status Updates
                  </button>
                </div>

                {/* Tech Equipment Specs Editor */}
                <div className="bg-stone-900/60 p-4 rounded-2xl border border-stone-800 space-y-3">
                  <label className="text-[11px] font-bold text-stone-400 uppercase block">Installed Tech & AV Equipment Specs</label>
                  
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                    {venues.find(v => v.id === adminSelectedVenueId)?.tech.map((t, idx) => (
                      <span key={idx} className="bg-stone-950 border border-stone-700 text-stone-200 text-xs px-3 py-1 rounded-xl flex items-center gap-2 font-bold">
                        {t}
                        <button type="button" onClick={() => handleRemoveTechFromAdminVenue(t)} className="text-red-400 hover:text-red-300">
                          <Trash2 size={12}/>
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <input 
                      type="text" 
                      value={adminNewTechInput} 
                      onChange={(e) => setAdminNewTechInput(e.target.value)} 
                      placeholder="Add new tech (e.g. 4K Laser Projector)..." 
                      className="flex-1 bg-stone-950 border border-stone-700 px-3 py-2.5 rounded-xl text-xs text-white outline-none" 
                    />
                    <button onClick={handleAddTechToAdminVenue} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1">
                      <Plus size={14}/> Add
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 8: MY REQUISITIONS HISTORY */}
        {/* ====================================================================== */}
        {activeTab === 'my-bookings' && (
          <div className="animate-fade-in-up space-y-6 max-w-5xl mx-auto">
            
            <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <FileText className="text-orange-400" size={22}/> My Venue Requisitions & Status Portal
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Track status across 3 approval stages (Submitted &rarr; Moderator Approved &rarr; Admin Final Approved), view rejection reasons, and download stamped Gate Passes.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-stone-900 p-1.5 rounded-2xl border border-stone-800 self-stretch sm:self-auto overflow-x-auto">
                {[
                  { id: 'ALL', label: 'All Requests', count: bookings.length },
                  { id: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending' || b.status === 'pending_admin').length },
                  { id: 'approved', label: 'Approved', count: bookings.filter(b => b.status === 'approved').length },
                  { id: 'rejected', label: 'Rejected', count: bookings.filter(b => b.status === 'rejected').length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setHistoryStatusFilter(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                      historyStatusFilter === tab.id
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
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 text-white">{tab.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {bookings
                .filter(b => {
                  if (historyStatusFilter === 'ALL') return true;
                  if (historyStatusFilter === 'pending') return b.status === 'pending' || b.status === 'pending_admin';
                  return b.status === historyStatusFilter;
                })
                .map((b) => (
                <div key={b.id} className="bg-stone-950/80 border border-stone-800 rounded-3xl p-6 shadow-xl hover:border-stone-700 transition-all space-y-4">
                  
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">
                          {b.institute} - Form #{b.id}
                        </span>
                        <span className="text-[10px] text-stone-400 font-bold bg-stone-900 border border-stone-800 px-3 py-1 rounded-xl">
                          <Calendar size={12} className="inline mr-1 text-orange-400" />
                          {moment(b.start_time).format('D MMM YYYY')} ({moment(b.start_time).format('h:mm A')} - {moment(b.end_time).format('h:mm A')})
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white">{b.event_name}</h3>
                      <p className="text-xs text-stone-400 mt-1">Venue: <span className="text-stone-200 font-bold">{b.venue}</span> | Coordinator: <span className="text-stone-300 font-bold">{b.coordinator}</span></p>
                    </div>

                    <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ${
                      b.status === 'approved' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : b.status === 'pending_admin' 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                          : b.status === 'rejected' 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                            : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    }`}>
                      {b.status === 'approved' && <CheckCircle2 size={14}/>}
                      {b.status === 'pending_admin' && <Clock size={14}/>}
                      {b.status === 'pending' && <Clock size={14}/>}
                      {b.status === 'rejected' && <XCircle size={14}/>}
                      <span>
                        {b.status === 'approved' 
                          ? 'APPROVED & CONFIRMED' 
                          : b.status === 'pending_admin' 
                            ? 'MODERATOR APPROVED (AWAITING ADMIN)' 
                            : b.status === 'rejected' 
                              ? 'REJECTED' 
                              : 'SUBMITTED (PENDING MODERATOR)'}
                      </span>
                    </div>
                  </div>

                  {/* Multi-Tier Approval Stage Tracker */}
                  <div className="bg-stone-900/60 p-4 rounded-2xl border border-stone-800">
                    <span className="text-[10px] font-bold text-stone-400 uppercase block mb-3">Multi-Tier Approval Stage Tracker</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-[10px] font-bold">
                      <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 p-2.5 rounded-xl flex sm:flex-col items-center justify-center gap-1.5">
                        <CheckCircle2 size={14} className="shrink-0"/>
                        <span>1. Form Submitted</span>
                      </div>

                      <div className={`p-2.5 rounded-xl border flex sm:flex-col items-center justify-center gap-1.5 ${
                        b.status === 'rejected' && b.rejected_by?.toLowerCase().includes('moderator')
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : b.status === 'pending_admin' || b.status === 'approved' 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                            : b.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
                              : 'bg-stone-900 text-stone-500 border-stone-800'
                      }`}>
                        {b.status === 'rejected' && b.rejected_by?.toLowerCase().includes('moderator') ? (
                          <XCircle size={14} className="shrink-0"/>
                        ) : b.status === 'pending_admin' || b.status === 'approved' ? (
                          <CheckCircle2 size={14} className="shrink-0"/>
                        ) : (
                          <Clock size={14} className="shrink-0"/>
                        )}
                        <span>
                          2. Moderator Review {b.status === 'rejected' && b.rejected_by?.toLowerCase().includes('moderator') ? '(Rejected)' : ''}
                        </span>
                      </div>

                      <div className={`p-2.5 rounded-xl border flex sm:flex-col items-center justify-center gap-1.5 ${
                        b.status === 'approved' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                          : b.status === 'rejected' && !b.rejected_by?.toLowerCase().includes('moderator')
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : b.status === 'pending_admin'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
                              : 'bg-stone-900 text-stone-500 border-stone-800'
                      }`}>
                        {b.status === 'approved' ? (
                          <Award size={14} className="shrink-0"/>
                        ) : b.status === 'rejected' && !b.rejected_by?.toLowerCase().includes('moderator') ? (
                          <XCircle size={14} className="shrink-0"/>
                        ) : (
                          <Clock size={14} className="shrink-0"/>
                        )}
                        <span>
                          3. Admin Date Stamp {b.status === 'rejected' && !b.rejected_by?.toLowerCase().includes('moderator') ? '(Rejected)' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* REJECTION REASON CALLOUT BOX */}
                  {b.status === 'rejected' && (
                    <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-4 flex items-start gap-3 shadow-lg shadow-red-950/20 animate-fade-in-up">
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

                  {/* DOWNLOAD GATE PASS FOR APPROVED */}
                  {b.status === 'approved' && (
                    <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-stone-800">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 size={12}/> Official Gate Pass Generated & Ready
                      </span>
                      <button 
                        onClick={() => generateGatePass(b)} 
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs px-5 py-3 rounded-2xl hover:shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all"
                      >
                        <Download size={16}/> Download Stamped Gate Pass PDF
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {bookings.filter(b => {
                if (historyStatusFilter === 'ALL') return true;
                if (historyStatusFilter === 'pending') return b.status === 'pending' || b.status === 'pending_admin';
                return b.status === historyStatusFilter;
              }).length === 0 && (
                <div className="text-center py-16 bg-stone-950/60 rounded-3xl border border-dashed border-stone-800">
                  <FileText size={36} className="mx-auto text-stone-600 mb-3" />
                  <p className="text-stone-300 font-bold text-sm">No requisitions found in this category.</p>
                  <p className="text-stone-500 text-xs mt-1">Select another filter tab or submit a new venue booking request.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* REJECTION REASON MODAL */}
        {/* ====================================================================== */}
        {rejectModalOpen && targetBookingToReject && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
            <div className="bg-stone-950 border border-red-500/40 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5">
              
              <div className="flex justify-between items-start border-b border-stone-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/20 text-red-400 p-2.5 rounded-2xl border border-red-500/30">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Reject Requisition Request</h3>
                    <p className="text-xs text-stone-400">Form #{targetBookingToReject.id} &bull; {targetBookingToReject.event_name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setRejectModalOpen(false)}
                  className="text-stone-400 hover:text-white bg-stone-900 p-2 rounded-xl border border-stone-800"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block mb-2">
                    Select Quick Rejection Reason:
                  </label>
                  <select 
                    value={selectedPresetReason} 
                    onChange={(e) => setSelectedPresetReason(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500"
                  >
                    <option value="Schedule Conflict / Venue Pre-booked">Schedule Conflict / Venue Pre-booked</option>
                    <option value="Incomplete Logistics Details / Missing Requirements">Incomplete Logistics Details / Missing Requirements</option>
                    <option value="Audio/Visual Equipment Support Unavailable">Audio/Visual Equipment Support Unavailable</option>
                    <option value="Holiday / Institution Closed on Requested Date">Holiday / Institution Closed on Requested Date</option>
                    <option value="Custom Reason">Custom Reason / Additional Remarks</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block mb-2">
                    Detailed Reason & Remarks for Faculty:
                  </label>
                  <textarea 
                    rows={4}
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    placeholder={`e.g. ${selectedPresetReason}... Provide additional context for the faculty member.`}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500 custom-scrollbar"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-stone-800">
                <button 
                  type="button" 
                  onClick={() => setRejectModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-stone-400 hover:text-white bg-stone-900 border border-stone-800"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleConfirmReject}
                  className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/30 flex items-center gap-2"
                >
                  <XCircle size={16} /> Confirm Rejection
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* FLOATING AI CHATBOT BUTTON */}
        {/* ====================================================================== */}
        <div className="fixed bottom-6 right-6 z-50">
          <button 
            onClick={() => setActiveTab('chatbot')} 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white p-4 rounded-full shadow-2xl shadow-purple-600/40 flex items-center gap-2 font-bold text-xs group hover:scale-105 transition-all"
          >
            <Bot size={22} className="animate-bounce"/>
            <span className="hidden sm:inline">Ask AI Assistant</span>
          </button>
        </div>

        {/* ====================================================================== */}
        {/* EVENT DETAILS MODAL (CALENDAR POPOVER) */}
        {/* ====================================================================== */}
        {selectedEventModal && (
          <div className="fixed inset-0 z-100 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 animate-fade-in-up">
              
              <div className="flex items-start justify-between gap-4 border-b border-stone-800 pb-4">
                <div>
                  <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider mb-2 inline-block">
                    {selectedEventModal.institute} - Approved Event
                  </span>
                  <h3 className="text-xl font-black text-white">{selectedEventModal.event_name}</h3>
                </div>

                <button onClick={() => setSelectedEventModal(null)} className="text-stone-400 hover:text-white p-2 rounded-xl bg-stone-800">
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-stone-300">
                <p><strong>Venue:</strong> {selectedEventModal.venue}</p>
                <p><strong>Date & Time:</strong> {moment(selectedEventModal.start_time).format('D MMM YYYY, h:mm A')} - {moment(selectedEventModal.end_time).format('h:mm A')}</p>
                <p><strong>Coordinator:</strong> {selectedEventModal.coordinator} ({selectedEventModal.user_email})</p>
                <p><strong>Audience:</strong> {selectedEventModal.attendees}</p>
              </div>

              {selectedEventModal.items?.requirements && (
                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800">
                  <span className="text-[10px] font-bold text-stone-400 uppercase block mb-2">Logistics Checklist</span>
                  <ul className="text-xs text-stone-300 space-y-1">
                    {Object.entries(selectedEventModal.items.requirements).map(([k, v]) => (
                      <li key={k}>• <strong>{k}:</strong> {v}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button onClick={() => generateGatePass(selectedEventModal)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-orange-500/30">
                  <Download size={16}/> Download PDF Receipt
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* --- FOOTER CREDITS --- */}
      <footer className="mt-16 border-t border-stone-800 py-8 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-orange-500"/>
            <span className="font-bold text-stone-400 uppercase tracking-wider">Vidyalankar Dnyanpeeth Trust</span>
          </div>

          <p className="text-[11px]">
            Venue Booking & Multi-Tier Approval Portal &bull; Designed for Campus Excellence
          </p>

          <span className="text-[10px] text-stone-600 uppercase tracking-widest font-mono">
            &copy; {new Date().getFullYear()} VDT Portal
          </span>
        </div>
      </footer>
    </div>
  );
}