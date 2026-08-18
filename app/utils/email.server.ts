export async function sendEmailNotification({
  subject,
  email,
  message,
  type,
  attachmentUrl,
}: {
  subject: string;
  email: string;
  message: string;
  type: string;
  attachmentUrl?: string | null;
}) {
  // We use Web3Forms in the backend to send the email notification for free.
  // This bypasses the frontend integration while still leveraging their free email delivery.
  const accessKey = '4fe03905-e3fa-46e8-a387-364c3763d0ad';

  let fullMessage = `New ${type} submission from: ${email}\n\n`;
  fullMessage += `Message:\n${message}\n\n`;
  
  if (attachmentUrl) {
    fullMessage += `\n\n--- Attachment ---\n`;
    fullMessage += `View Design File: ${attachmentUrl}\n`;
  }

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: subject,
        from_name: 'FlashBind Notifications',
        email: email,
        message: fullMessage,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send email notification:', await response.text());
    }
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}
