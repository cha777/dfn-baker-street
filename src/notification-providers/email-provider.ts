import nodemailer, { type Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import logger from '../logger';

class EmailProvider {
  transporter: Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options>;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: Bun.env.EMAIL_TRANSPORT_EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: Bun.env.EMAIL_TRANSPORT_EMAIL_SENDER,
        pass: Bun.env.EMAIL_TRANSPORT_EMAIL_PASSWORD,
      },
    });
  }

  async sendNotification(isSuccessful: boolean, attempt: number, error?: Error) {
    let mailOptions = {
      from: Bun.env.EMAIL_TRANSPORT_EMAIL_SENDER,
      to: Bun.env.EMAIL_TRANSPORT_EMAIL_TO,
      subject: `DFN Baker Street Order (${new Date().toISOString().split('T').shift()}) - ${
        isSuccessful ? 'Successful' : 'Failed'
      }`,
      text: `${
        isSuccessful ? `Order Placed for ${Bun.env.FOOD_TYPE}` : `Order Failed: ${error?.message}`
      }\nAttempt: ${attempt}`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info('Email sent');
    } catch (e) {
      logger.error(`Email send failed: ${e}`);
    }
  }
}

export const provider = new EmailProvider();
