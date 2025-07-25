import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  await sgMail.send({ to, from: process.env.FROM_EMAIL!, subject, html });
} 