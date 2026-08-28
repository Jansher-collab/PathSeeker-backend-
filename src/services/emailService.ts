import nodemailer from 'nodemailer';

let _transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
  });

  return _transporter;
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// In-memory buffer of dispatched emails for instant preview during dev
export const sentEmailsLog: Array<{
  to: string;
  subject: string;
  type: string;
  html: string;
  sentAt: Date;
}> = [];

// Base Email Wrapper with Career Passport Luxury Theme
const wrapEmailTemplate = (title: string, preheader: string, contentHtml: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0B0F19; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0; }
    .container { max-width: 600px; margin: 30px auto; background: #131B2E; border: 1px solid #23324D; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .header { background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #D4AF37; }
    .logo-badge { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; background: linear-gradient(135deg, #D4AF37 0%, #AA771C 100%); border-radius: 50%; margin-bottom: 12px; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4); font-size: 26px; }
    .title { color: #F8FAFC; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: 0.5px; }
    .subtitle { color: #D4AF37; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-top: 6px; }
    .content { padding: 32px 28px; font-size: 15px; line-height: 1.6; color: #CBD5E1; }
    .card { background: #1B2438; border: 1px solid #2B3A5A; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #0B0F19 !important; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 9999px; text-decoration: none; text-align: center; box-shadow: 0 4px 14px rgba(212,175,55,0.35); }
    .footer { background: #0F172A; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #1E293B; }
    .stamp { display: inline-block; border: 2px dashed #D4AF37; color: #D4AF37; padding: 6px 14px; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: 700; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>
  <div class="container">
    <div class="header">
      <div class="logo-badge">🧭</div>
      <h1 class="title">PathSeeker</h1>
      <div class="subtitle">Official Career Passport Dispatch</div>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0;">PathSeeker Career Passport System &bull; Issued for Professional Trajectory Optimization</p>
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} PathSeeker Inc. All global rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const emailService = {
  // 1. Successful Registration / Welcome Email
  sendWelcomeEmail: async (to: string, name: string, role: string) => {
    const html = wrapEmailTemplate(
      'Welcome to PathSeeker - Career Passport Activated',
      `Welcome to PathSeeker, ${name}! Your Career Passport (${role}) is ready.`,
      `
      <h2 style="color:#F8FAFC; margin-top:0;">Welcome aboard, ${name}! ✈️</h2>
      <p>Congratulations! Your official <strong>PathSeeker Career Passport</strong> has been officially stamped and activated for the <strong>${role}</strong> tier.</p>
      
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="color:#94A3B8; font-size:12px; text-transform:uppercase;">Passport Holder</div>
            <div style="color:#F8FAFC; font-size:18px; font-weight:700;">${name}</div>
          </div>
          <div>
            <span class="stamp">${role.toUpperCase()} TIER</span>
          </div>
        </div>
        <hr style="border:0; border-top:1px solid #2B3A5A; margin:16px 0;" />
        <p style="margin:0; font-size:13px; color:#94A3B8;">
          🎯 <strong>Next Action:</strong> Complete your first AI Career Interest Quiz to receive your inaugural Bronze Explorer Visa Stamp!
        </p>
      </div>

      <div style="text-align:center; margin: 30px 0;">
        <a href="https://path-seeker-frontend.vercel.app/dashboard" class="btn">Launch Career Passport Dashboard &rarr;</a>
      </div>

      <p style="font-size:13px; color:#94A3B8;">If you did not create this account, please contact security@pathseeker.io immediately.</p>
      `
    );

    return emailService.dispatch({ to, subject: `Welcome to PathSeeker, ${name}! 🧭 Your Career Passport is Ready`, html, type: 'welcome' });
  },

  // 2. Login Alert / Security Notification
  sendLoginAlertEmail: async (to: string, name: string, ip: string, device: string, time: string) => {
    const html = wrapEmailTemplate(
      'Security Alert: New Sign-in Detected',
      `New login to PathSeeker on ${device}`,
      `
      <h2 style="color:#F8FAFC; margin-top:0;">New Sign-In Detected 🔒</h2>
      <p>Hello ${name}, we noticed a successful sign-in to your PathSeeker Career Passport account.</p>
      
      <div class="card">
        <table style="width:100%; font-size:14px; color:#CBD5E1;">
          <tr>
            <td style="padding:6px 0; color:#94A3B8;">Device / Browser:</td>
            <td style="padding:6px 0; font-weight:600; text-align:right;">${device}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#94A3B8;">IP Address:</td>
            <td style="padding:6px 0; font-weight:600; text-align:right;">${ip}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#94A3B8;">Timestamp:</td>
            <td style="padding:6px 0; font-weight:600; text-align:right;">${time}</td>
          </tr>
        </table>
      </div>

      <p>If this was you, you can safely disregard this security notice.</p>
      <p style="color:#F87171; font-size:13px;">If you did NOT perform this login, please secure your account immediately by resetting your password:</p>
      <div style="text-align:center; margin:24px 0;">
        <a href="https://path-seeker-frontend.vercel.app/dashboard" class="btn" style="background:#EF4444; color:#FFFFFF !important;">Secure My Account</a>
      </div>
      `
    );

    return emailService.dispatch({ to, subject: 'Security Alert: New Login to Your PathSeeker Account 🛡️', html, type: 'security_login' });
  },

  // 3. Password Reset Request (with secure token link / OTP)
  sendPasswordResetEmail: async (to: string, name: string, resetToken: string, otp: string) => {
    const resetUrl = `https://path-seeker-frontend.vercel.app/reset-password?token=${resetToken}`;
    const html = wrapEmailTemplate(
      'Password Reset Request - PathSeeker',
      `Your PathSeeker password reset code is ${otp}`,
      `
      <h2 style="color:#F8FAFC; margin-top:0;">Reset Your Password 🔑</h2>
      <p>Hello ${name}, we received a request to reset the password for your PathSeeker account.</p>
      
      <div class="card" style="text-align:center;">
        <div style="color:#94A3B8; font-size:12px; text-transform:uppercase; margin-bottom:8px;">Your 6-Digit One-Time Security Code (OTP)</div>
        <div style="font-size:32px; font-weight:800; letter-spacing:6px; color:#D4AF37; font-family:monospace;">${otp}</div>
        <div style="color:#94A3B8; font-size:12px; margin-top:8px;">Valid for 15 minutes</div>
      </div>

      <p style="text-align:center;">Alternatively, click the secure button below to choose a new password directly:</p>
      <div style="text-align:center; margin:26px 0;">
        <a href="${resetUrl}" class="btn">Reset Password Online &rarr;</a>
      </div>

      <p style="font-size:13px; color:#94A3B8;">If you did not request this password reset, no action is required and your account remains safe.</p>
      `
    );

    return emailService.dispatch({ to, subject: 'PathSeeker: Password Reset Request & OTP Code 🔑', html, type: 'password_reset' });
  },

  // 4. Password Successfully Updated Confirmation
  sendPasswordUpdatedEmail: async (to: string, name: string) => {
    const html = wrapEmailTemplate(
      'Password Updated Successfully',
      'Your PathSeeker password was successfully updated',
      `
      <h2 style="color:#F8FAFC; margin-top:0;">Password Changed Successfully ✅</h2>
      <p>Hello ${name},</p>
      <p>This is a confirmation that the password for your PathSeeker Career Passport account was updated on <strong>${new Date().toUTCString()}</strong>.</p>
      
      <div class="card" style="border-left: 4px solid #10B981;">
        <p style="margin:0; font-size:14px; color:#A7F3D0;">
          Your account credentials are now active with your new password.
        </p>
      </div>

      <div style="text-align:center; margin:28px 0;">
        <a href="https://path-seeker-frontend.vercel.app/login" class="btn">Log In to PathSeeker &rarr;</a>
      </div>

      <p style="font-size:13px; color:#F87171;">If you did not perform this change, please contact our emergency response team at security@pathseeker.io immediately.</p>
      `
    );

    return emailService.dispatch({ to, subject: 'Security Confirmation: PathSeeker Password Updated ✅', html, type: 'password_updated' });
  },

  // 5. User Feedback Confirmation Email
  sendFeedbackConfirmationEmail: async (to: string, name: string) => {
    const html = wrapEmailTemplate(
      'Feedback Received - PathSeeker',
      'We have received your feedback successfully.',
      `
      <h2 style="color:#F8FAFC; margin-top:0;">Message Received 📬</h2>
      <p>Hello ${name},</p>
      <p>Thank you for submitting your feedback to the PathSeeker team.</p>
      
      <div class="card">
        <p style="margin:0; font-size:14px; color:#CBD5E1;">
          Our career advisory and engineering team will review your message shortly. We appreciate you taking the time to help us improve the Career Passport experience.
        </p>
      </div>
      <p style="font-size:13px; color:#94A3B8;">This is an automated confirmation. You do not need to reply to this email.</p>
      `
    );

    return emailService.dispatch({ to, subject: 'PathSeeker: We received your feedback', html, type: 'feedback_confirmation' });
  },

  // 6. Admin Feedback Notification
  sendAdminFeedbackNotificationEmail: async (name: string, userEmail: string, category: string, message: string) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pathseeker.io';
    const html = wrapEmailTemplate(
      'New User Feedback Submitted',
      `New feedback from ${name} in category ${category}`,
      `
      <h2 style="color:#F8FAFC; margin-top:0;">New Feedback Alert 🚨</h2>
      <p>A user has submitted new feedback on the PathSeeker platform.</p>
      
      <div class="card">
        <table style="width:100%; font-size:14px; color:#CBD5E1; text-align: left;">
          <tr>
            <th style="padding:6px 0; color:#94A3B8; width: 100px;">User:</th>
            <td style="padding:6px 0; font-weight:600;">${name} (${userEmail})</td>
          </tr>
          <tr>
            <th style="padding:6px 0; color:#94A3B8;">Category:</th>
            <td style="padding:6px 0; font-weight:600;">${category}</td>
          </tr>
        </table>
        <hr style="border:0; border-top:1px solid #2B3A5A; margin:16px 0;" />
        <p style="color:#94A3B8; font-size: 13px; margin-bottom: 4px; text-transform: uppercase;">Message Content:</p>
        <p style="margin:0; font-style: italic; color: #F8FAFC;">"${message}"</p>
      </div>
      `
    );

    return emailService.dispatch({ to: adminEmail, subject: `[PathSeeker Admin] New Feedback: ${category}`, html, type: 'admin_feedback_notification' });
  },

  // Dispatch dispatcher
  dispatch: async ({ to, subject, html, type }: { to: string; subject: string; html: string; type: string }) => {
    // Log to in-memory store for instant inspection in development
    sentEmailsLog.unshift({
      to,
      subject,
      type,
      html,
      sentAt: new Date(),
    });
    if (sentEmailsLog.length > 50) sentEmailsLog.pop();

    console.log(`\n================= [NODEMAILER EMAIL DISPATCHED] =================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Type: ${type}`);
    console.log(`Sent At: ${new Date().toISOString()}`);
    console.log(`=================================================================\n`);

    const activeUser = process.env.SMTP_USER || process.env.EMAIL_USER;

    // If activeUser is present and not a placeholder, send via Nodemailer
    if (activeUser && !activeUser.includes('your-gmail')) {
      try {
        const transporter = getTransporter();
        const info = await transporter.sendMail({
          from: process.env.SMTP_FROM || 'PathSeeker <no-reply@pathseeker.io>',
          to,
          subject,
          html,
        });
        return { success: true, messageId: info.messageId };
      } catch (err: any) {
        console.error(`[SMTP Service Error] Dispatch failed: ${err.message}`);
        throw new Error(`Email dispatch failed: ${err.message}`);
      }
    }

    return { success: true, simulated: true, message: 'Email dispatched to simulated logger & preview engine.' };
  },
};
