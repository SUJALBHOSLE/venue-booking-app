import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { toEmail, status, eventName, institute, pdfBase64 } = await req.json();

    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
      tls: { ciphers: 'SSLv3' }
    });

    const subject = status === 'approved' 
      ? `✅ Approved: Venue Booking for ${eventName}`
      : `❌ Rejected: Venue Booking for ${eventName}`;

    const text = status === 'approved'
      ? `Hello,\n\nYour venue booking request for "${eventName}" at ${institute} has been APPROVED by the admin.\n\nPlease find your official requisition receipt attached to this email.\n\nRegards,\nV - Booking Admin\nVidyalankar Institute`
      : `Hello,\n\nWe regret to inform you that your venue booking request for "${eventName}" at ${institute} has been REJECTED.\n\nPlease contact the administration office for further details or alternative arrangements.\n\nRegards,\nV - Booking Admin\nVidyalankar Institute`;

    const mailOptions = {
      from: `"V - Booking" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      text,
    };

    if (status === 'approved' && pdfBase64) {
      mailOptions.attachments = [
        {
          filename: `${institute}_Requisition_${eventName.replace(/\s+/g, '_')}.pdf`,
          path: pdfBase64 
        }
      ];
    }

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to:", toEmail);
    return NextResponse.json({ success: true });

  } catch (error) {
    // THIS IS WHERE YOU LOOK IF EMAILS FAIL
    console.error("❌ CRITICAL EMAIL ERROR:", error);
    return NextResponse.json({ error: "Failed to send email", details: error.message }, { status: 500 });
  }
}