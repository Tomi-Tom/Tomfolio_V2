import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'contact@tomi-tom.dev';

interface ContactMessage {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  content: string;
}

export async function sendContactNotification(
  message: ContactMessage
): Promise<void> {
  const { firstName, lastName, email, phone, content } = message;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New contact message from ${firstName} ${lastName}`,
    text: [
      `Name: ${firstName} ${lastName}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      '',
      content,
    ]
      .filter((line) => line !== null)
      .join('\n'),
  });
}
