import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.emailHost,
  port: env.emailPort,
  secure: false,
  auth: {
    user: env.emailUser,
    pass: env.emailPass,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!env.emailHost || !env.emailUser) {
    console.log(`[email] ${subject} -> ${to}`);
    return;
  }

  await transporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    html,
  });
}

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const url = `${env.frontendUrl}/reset-password?token=${resetToken}`;
  await sendEmail(to, "Reset your password", `<p>Click <a href="${url}">here</a> to reset your password.</p>`);
}

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${env.frontendUrl}/verify-email?token=${token}`;
  await sendEmail(to, "Verify your email", `<p>Click <a href="${url}">here</a> to verify your email.</p>`);
}
