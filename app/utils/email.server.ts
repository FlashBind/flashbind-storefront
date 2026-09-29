/** Escapes visitor-typed text before it goes into the notification HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendEmailNotification({
  subject,
  email,
  message,
  type,
  attachmentUrl,
  adminEmail,
  apiKey,
}: {
  subject: string;
  email: string;
  message: string;
  type: string;
  attachmentUrl?: string | null;
  adminEmail: string;
  apiKey: string;
}) {
  let htmlMessage = `<h2>New ${escapeHtml(type)} submission</h2>`;
  htmlMessage += `<p><strong>From:</strong> ${escapeHtml(email)}</p>`;
  htmlMessage += `<p><strong>Message:</strong><br/>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>`;

  if (attachmentUrl) {
    htmlMessage += `<hr/><p><strong>Design File Attachment:</strong> <a href="${escapeHtml(attachmentUrl)}">View File</a></p>`;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FlashBind <info@flashbind.com>',
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
