require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Validate SMTP env
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn('Warning: SMTP configuration appears incomplete. Check .env');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body || {};

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
  const infoAddress = process.env.INFO_EMAIL || 'info@netwise.com';

  // Mail to subscriber
  const mailOptions = {
    from,
    to: email,
    subject: 'NETWISE TECHNOLOGIES - Subscription Confirmation',
    text: `Hello,\n\nThank you for subscribing to NETWISE TECHNOLOGIES. We're excited to keep you updated. If you did not request this, please ignore this email.\n\nBest regards,\nNETWISE TECHNOLOGIES`,
    html: `<p>Hello,</p><p>Thank you for subscribing to <strong>NETWISE TECHNOLOGIES</strong>. We're excited to keep you updated. If you did not request this, please ignore this email.</p><p>Best regards,<br/>NETWISE TECHNOLOGIES</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);

    // Also notify internal address (optional)
    try {
      await transporter.sendMail({
        from,
        to: infoAddress,
        subject: 'New Newsletter Subscription',
        text: `New subscriber: ${email}`,
      });
    } catch (err) {
      console.warn('Failed to send internal notification:', err && err.message);
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('Failed to send subscription email:', err && err.message);
    return res.status(500).json({ error: 'Failed to send confirmation email' });
  }
});

app.listen(PORT, () => {
  console.log(`Subscription server listening on port ${PORT}`);
});
