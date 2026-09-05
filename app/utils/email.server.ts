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
}): Promise<boolean> {
  const escapeHtml = (value: string) =>
    value.replace(/[&<>'"]/g, (character) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      };

      return entities[character];
    });

  const safeType = escapeHtml(type);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br/>');

  let htmlMessage = `<h2>New ${safeType} submission</h2>`;
  htmlMessage += `<p><strong>From:</strong> ${safeEmail}</p>`;
  htmlMessage += `<p><strong>Message:</strong><br/>${safeMessage}</p>`;
  
  if (attachmentUrl) {
    try {
      const parsedAttachmentUrl = new URL(attachmentUrl);
      if (['http:', 'https:'].includes(parsedAttachmentUrl.protocol)) {
        htmlMessage += `<hr/><p><strong>Design File Attachment:</strong> <a href="${escapeHtml(parsedAttachmentUrl.toString())}">View File</a></p>`;
      }
    } catch {
      console.error('Skipped invalid attachment URL in email notification');
    }
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
        subject,
        html: htmlMessage,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send email notification:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}
