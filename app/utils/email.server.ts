export async function sendEmailNotification({
  subject,
  email,
  message,
  type,
  attachmentUrl,
  adminEmail,
}: {
  subject: string;
  email: string;
  message: string;
  type: string;
  attachmentUrl?: string | null;
  adminEmail: string;
  apiKey: string;
}) {
  let htmlMessage = `<h2>New ${type} submission</h2>`;
  htmlMessage += `<p><strong>From:</strong> ${email}</p>`;
  htmlMessage += `<p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>`;
  
  if (attachmentUrl) {
    htmlMessage += `<hr/><p><strong>Design File Attachment:</strong> <a href="${attachmentUrl}">View File</a></p>`;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FlashBind Notifications <onboarding@resend.dev>',
        to: adminEmail,
        reply_to: email,
        subject: subject,
        html: htmlMessage,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send email notification:', await response.text());
    }
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}
