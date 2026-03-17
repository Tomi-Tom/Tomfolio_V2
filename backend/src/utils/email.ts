import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
});

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

  await transporter.sendMail({
    from: process.env.SMTP_USER || 'noreply@tomfolio.dev',
    to: process.env.ADMIN_EMAIL,
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
