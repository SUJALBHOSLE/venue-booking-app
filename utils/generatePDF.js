import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateGatePass = (booking, returnBlob = false) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- TOP HEADER BANNER ---
  doc.setFillColor(249, 115, 22); // Light Orange Primary #F97316
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text("VIDYALANKAR DNYANPEETH TRUST", pageWidth / 2, 12, { align: "center" });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(254, 237, 213);
  doc.text("Official Venue Requisition & Approval Gate Pass", pageWidth / 2, 19, { align: "center" });

  doc.setFontSize(8);
  doc.text("Portal Ref: VDT-REQUISITION-OFFICIAL", pageWidth / 2, 24, { align: "center" });

  // --- REQUISITION SUMMARY HEADER ---
  doc.setFillColor(255, 247, 237);
  doc.rect(10, 32, pageWidth - 20, 16, 'F');
  doc.setDrawColor(251, 146, 60);
  doc.setLineWidth(0.3);
  doc.rect(10, 32, pageWidth - 20, 16, 'S');

  doc.setTextColor(28, 25, 23);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Event: ${booking.event_name || booking.activity_name || 'N/A'}`, 14, 40);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 53, 15);
  const statusLabel = (booking.status || 'APPROVED').toUpperCase();
  doc.text(`Status: ${statusLabel} | Institute: ${booking.institute || 'VDT'} | Form ID: #${booking.id?.slice?.(0, 8) || 'VDT-001'}`, 14, 45);

  // --- DETAILS TABLE ---
  const detailsData = [
    ["Activity / Event", booking.event_name || booking.activity_name || "N/A"],
    ["Institute / Unit", booking.institute || "VDT"],
    ["Venue(s) Allocated", booking.venue || booking.venues?.name || "N/A"],
    ["Date & Duration", `${booking.event_date || (booking.start_time ? booking.start_time.split('T')[0] : 'N/A')}`],
    ["Timing (IST)", `${booking.start_time ? new Date(booking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'} - ${booking.end_time ? new Date(booking.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}`],
    ["Faculty Coordinator", `${booking.coordinator || booking.teacher_coordinator || "N/A"} (${booking.user_email || 'N/A'})`],
    ["Expected Audience", booking.attendees || "Students & Faculty"]
  ];

  autoTable(doc, {
    startY: 52,
    head: [['Specification', 'Details']],
    body: detailsData,
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50, fillColor: [255, 237, 213] } }
  });

  // --- SPECIFIC REQUIREMENTS CHECKLIST ---
  let finalY = (doc.lastAutoTable?.finalY || 110) + 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(234, 88, 12);
  doc.text("Specific Logistics & Technical Requirements Checklist", 14, finalY);

  let reqRows = [];
  if (booking.items && booking.items.requirements) {
    reqRows = Object.entries(booking.items.requirements).map(([key, val]) => [key, val]);
  } else if (booking.form_data) {
    reqRows = Object.entries(booking.form_data)
      .filter(([k]) => k.startsWith('req_') || k.startsWith('checklist_'))
      .map(([k, v]) => [k.replace('req_', '').replace('checklist_', '').toUpperCase(), v === true || v === 'yes' ? 'Required' : String(v)]);
  }

  if (reqRows.length === 0) {
    reqRows = [["Standard Venue Setup", "Projector, Podium & Audio System Allocated"]];
  }

  autoTable(doc, {
    startY: finalY + 3,
    head: [['Requirement Item', 'Specification / Status']],
    body: reqRows,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [51, 65, 85] }
  });

  // --- MULTI-TIER SIGNATURE & OFFICIAL STAMP SECTION ---
  finalY = (doc.lastAutoTable?.finalY || (finalY + 35)) + 12;
  if (finalY > 230) { doc.addPage(); finalY = 20; }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text("Authorized Signatures & Formal Verification", 14, finalY);

  doc.setLineWidth(0.3);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, finalY + 2, pageWidth - 14, finalY + 2);

  const sigBoxY = finalY + 6;
  const colWidth = (pageWidth - 28) / 3;

  // 1. Applicant Signature Box
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text("1. Faculty / Applicant", 14, sigBoxY);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.coordinator || booking.teacher_coordinator || "Faculty", 14, sigBoxY + 4);

  // 2. Moderator Signature Box
  doc.setFont('helvetica', 'bold');
  doc.text("2. Moderator Review", 14 + colWidth, sigBoxY);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.moderator_name || "Moderator Approved", 14 + colWidth, sigBoxY + 4);

  // 3. Admin Final Approval Box
  doc.setFont('helvetica', 'bold');
  doc.text("3. Admin Final Approval", 14 + (colWidth * 2), sigBoxY);
  doc.setFont('helvetica', 'normal');
  doc.text("Vidyalankar DNYANPEETH Trust", 14 + (colWidth * 2), sigBoxY + 4);

  // Draw Signature Images if present
  try {
    const userSig = booking.signature_url || booking.user_signature_url;
    if (userSig && userSig.startsWith('data:image')) {
      doc.addImage(userSig, 'PNG', 14, sigBoxY + 6, 45, 16);
    }
    const modSig = booking.moderator_signature_url;
    if (modSig && modSig.startsWith('data:image')) {
      doc.addImage(modSig, 'PNG', 14 + colWidth, sigBoxY + 6, 45, 16);
    }
    const adminSig = booking.admin_signature_url;
    if (adminSig && adminSig.startsWith('data:image')) {
      doc.addImage(adminSig, 'PNG', 14 + (colWidth * 2), sigBoxY + 6, 45, 16);
    }
  } catch (e) {
    console.error("Signature image rendering note:", e);
  }

  // --- OFFICIAL DIGITAL SEAL & DATE STAMP ---
  const stampY = sigBoxY + 26;
  doc.setDrawColor(16, 185, 129); // Emerald Green Stamp
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(pageWidth - 75, stampY, 61, 20, 3, 3, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text("OFFICIAL STAMP & SEAL", pageWidth - 44.5, stampY + 5, { align: "center" });

  doc.setFontSize(7);
  doc.text("VIDYALANKAR DNYANPEETH TRUST", pageWidth - 44.5, stampY + 9, { align: "center" });

  const stampDate = booking.approved_at ? new Date(booking.approved_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(4, 120, 87);
  doc.text(`VERIFIED: ${stampDate} IST`, pageWidth - 44.5, stampY + 14, { align: "center" });
  doc.text("AUTH CODE: VDT-VERIFIED-GATEPASS", pageWidth - 44.5, stampY + 18, { align: "center" });

  // --- FOOTER ---
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated by Vidyalankar Dnyanpeeth Trust Central Portal • ${new Date().toLocaleDateString()}`, pageWidth / 2, 288, { align: "center" });

  if (returnBlob) {
    return doc.output('blob');
  } else {
    doc.save(`VDT_GatePass_${(booking.event_name || 'Booking').replace(/\s+/g, '_')}.pdf`);
  }
};