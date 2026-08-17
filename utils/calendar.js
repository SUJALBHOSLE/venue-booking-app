export async function addToOutlookCalendar(session, formData, venueName) {
  if (!session || !session.provider_token) {
    console.warn("No Microsoft provider token found. Cannot add to calendar.");
    return;
  }

  const event = {
    subject: `EVENT: ${formData.activity_name}`,
    body: {
      contentType: "HTML",
      content: `Venue: ${venueName}<br>Coordinator: ${formData.teacher_coordinator}<br>Ref: Venue Booking Portal`
    },
    start: {
        dateTime: `${formData.event_date}T${formData.start_time}`,
        timeZone: "India Standard Time"
    },
    end: {
        dateTime: `${formData.event_date}T${formData.end_time}`,
        timeZone: "India Standard Time"
    },
    location: {
        displayName: venueName
    }
  };

  try {
    const response = await fetch("https://graph.microsoft.com/v1.0/me/events", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.provider_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    return true;
  } catch (error) {
    console.error("Calendar Error:", error);
    alert("Booking saved, but failed to add to Outlook Calendar. Please check permissions.");
    return false;
  }
}