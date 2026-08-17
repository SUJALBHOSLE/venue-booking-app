/* eslint-disable @typescript-eslint/no-unused-vars */
// utils/microsoftGraph.js

export async function sendApprovalEmail(session, booking, pdfBlob, adminSignatureUrl) {
  if (!session || !session.provider_token) throw new Error("No Microsoft Token");

  // 1. Convert PDF Blob to Base64 for Attachment
  const pdfBase64 = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(pdfBlob);
  });

  // 2. Prepare the Email Body (Using your text)
  const emailBody = `Dear All,

Please consider this as confirmation mail for Multiple Venue Booking for your activity (${booking.activity_name}) scheduled on ${booking.event_date}.

You are requested to please coordinate with Mr. Pravin Sadke & Facility Management department for further arrangements.

@${booking.teacher_coordinator} (Convener): Please check the requirements at venue one day before the event/activity.

Pravin Sadke: Please find attached herewith booking form with requirements.

Sunil Thube & Sunil Patil: Please check system requirements.

Satish Gode: Please note and check for any security arrangements.

--------------------------------------------------
Approved by Venue Booking Coordinator`;

  // 3. Construct the Graph API Payload
  const mailPayload = {
    message: {
      subject: `APPROVED: ${booking.activity_name} on ${booking.event_date}`,
      body: { contentType: "HTML", content: emailBody },
      toRecipients: [
        { emailAddress: { address: booking.user_email } } // Sends to Applicant
      ],
      ccRecipients: [
        // Add the facility managers' emails here
        { emailAddress: { address: "pravin.sadke@vsit.edu.in" } }, 
        { emailAddress: { address: "sunil.thube@vsit.edu.in" } }
      ],
      attachments: [
        {
          "@odata.type": "#microsoft.graph.fileAttachment",
          name: `GatePass_${booking.activity_name}.pdf`,
          contentType: "application/pdf",
          contentBytes: pdfBase64
        }
      ]
    },
    saveToSentItems: true
  };

  // 4. Send Email
  const mailRes = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${session.provider_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(mailPayload)
  });

  if (!mailRes.ok) {
    const err = await mailRes.json();
    throw new Error(JSON.stringify(err));
  }

  // 5. Create Calendar Event (On Admin's Calendar, inviting the User)
  const eventPayload = {
    subject: `EVENT: ${booking.activity_name}`,
    body: { contentType: "HTML", content: "Venue Booking Confirmed." },
    start: { dateTime: `${booking.event_date}T${booking.start_time}:00`, timeZone: "India Standard Time" },
    end: { dateTime: `${booking.event_date}T${booking.end_time}:00`, timeZone: "India Standard Time" },
    location: { displayName: booking.venues?.name || "College Venue" },
    attendees: [
      { emailAddress: { address: booking.user_email }, type: "required" }
    ]
  };

  await fetch("https://graph.microsoft.com/v1.0/me/events", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${session.provider_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(eventPayload)
  });

  return true;
}