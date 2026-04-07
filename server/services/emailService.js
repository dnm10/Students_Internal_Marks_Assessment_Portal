/**
 * services/emailService.js — AWS SES or Nodemailer fallback
 */
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const nodemailer = require('nodemailer');
const logger     = require('../utils/logger');
const { sesClient, SES_FROM_EMAIL } = require('../config/aws');

// Nodemailer fallback (development/testing)
let devTransporter;
function getDevTransporter() {
  if (!devTransporter) {
    devTransporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST || 'smtp.ethereal.email',
      port:   parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }
  return devTransporter;
}

/**
 * Send an email via AWS SES (production) or Nodemailer (development).
 * @param {{ to: string|string[], subject: string, html: string, text?: string }} opts
 */
async function sendEmail({ to, subject, html, text }) {
  const recipients = Array.isArray(to) ? to : [to];
  const fromEmail  = SES_FROM_EMAIL || process.env.SMTP_USER || 'noreply@portal.edu';
  const collegeName = process.env.COLLEGE_NAME || 'Student Portal';

  if (process.env.NODE_ENV === 'production' && process.env.AWS_ACCESS_KEY_ID) {
    // AWS SES
    try {
      const cmd = new SendEmailCommand({
        Source: `${collegeName} <${fromEmail}>`,
        Destination: { ToAddresses: recipients },
        Message: {
          Subject: { Data: subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: html,        Charset: 'UTF-8' },
            Text: { Data: text || '',  Charset: 'UTF-8' },
          },
        },
      });
      const result = await sesClient.send(cmd);
      logger.info(`Email sent via SES: ${result.MessageId}`);
      return result;
    } catch (err) {
      logger.error('AWS SES send failed:', err.message);
      throw err;
    }
  } else {
    // Nodemailer (dev)
    try {
      const transporter = getDevTransporter();
      const info = await transporter.sendMail({
        from:    `"${collegeName}" <${fromEmail}>`,
        to:      recipients.join(', '),
        subject,
        html,
        text:    text || '',
      });
      logger.info(`Email sent (dev): ${info.messageId}`);
      return info;
    } catch (err) {
      logger.warn('Dev email send failed (non-critical):', err.message);
      // Don't throw — email is non-critical in dev
    }
  }
}

/**
 * Send a bulk email (e.g. attendance shortage) to multiple recipients.
 */
async function sendBulkEmail(recipients) {
  const results = await Promise.allSettled(recipients.map((r) => sendEmail(r)));
  const failed  = results.filter((r) => r.status === 'rejected');
  if (failed.length) {
    logger.warn(`${failed.length} emails failed to send`);
  }
  return results;
}

module.exports = { sendEmail, sendBulkEmail };
