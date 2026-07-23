import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.EMAIL_FROM ?? "noreply@matchhouse.app";

export async function sendVerificationEmail(
  to: string,
  otp: string
): Promise<void> {
  await transporter.sendMail({
    from: `"Match House" <${FROM}>`,
    to,
    subject: "Verifica il tuo account Match House",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Benvenuto su Match House!</h2>
        <p>Il tuo codice di verifica è:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #6c63ff; padding: 16px 0;">
          ${otp}
        </div>
        <p>Il codice è valido per 15 minuti.</p>
        <p>Se non hai creato un account, ignora questa email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await transporter.sendMail({
    from: `"Match House" <${FROM}>`,
    to,
    subject: "Reset password Match House",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Reset della password</h2>
        <p>Hai richiesto il reset della password. Clicca il link sottostante:</p>
        <a href="${resetUrl}" style="display:inline-block; padding: 12px 24px; background-color: #6c63ff; color: white; border-radius: 8px; text-decoration: none;">
          Reimposta password
        </a>
        <p>Il link scade tra 1 ora.</p>
        <p>Se non hai richiesto il reset, ignora questa email.</p>
      </div>
    `,
  });
}

export async function sendMatchNotificationEmail(
  to: string,
  matchedUserName: string
): Promise<void> {
  await transporter.sendMail({
    from: `"Match House" <${FROM}>`,
    to,
    subject: "Nuovo match su Match House!",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Hai un nuovo match!</h2>
        <p>Hai fatto match con <strong>${matchedUserName}</strong>.</p>
        <p>Apri l'app per iniziare a chattare.</p>
      </div>
    `,
  });
}
