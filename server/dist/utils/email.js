"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
exports.sendVerificationEmail = sendVerificationEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const transporter = nodemailer_1.default.createTransport({
    host: env_1.env.emailHost,
    port: env_1.env.emailPort,
    secure: false,
    auth: {
        user: env_1.env.emailUser,
        pass: env_1.env.emailPass,
    },
});
async function sendEmail(to, subject, html) {
    if (!env_1.env.emailHost || !env_1.env.emailUser) {
        console.log(`[email] ${subject} -> ${to}`);
        return;
    }
    await transporter.sendMail({
        from: env_1.env.emailFrom,
        to,
        subject,
        html,
    });
}
async function sendPasswordResetEmail(to, resetToken) {
    const url = `${env_1.env.frontendUrl}/reset-password?token=${resetToken}`;
    await sendEmail(to, "Reset your password", `<p>Click <a href="${url}">here</a> to reset your password.</p>`);
}
async function sendVerificationEmail(to, token) {
    const url = `${env_1.env.frontendUrl}/verify-email?token=${token}`;
    await sendEmail(to, "Verify your email", `<p>Click <a href="${url}">here</a> to verify your email.</p>`);
}
//# sourceMappingURL=email.js.map