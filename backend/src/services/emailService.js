import pkg from 'nodemailer';
const { createTransport } = pkg;

class EmailService {
  constructor() {
    // Create transporter using Gmail
    this.transporter = createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
      }
    });
  }

  /**
   * Send support email
   * @param {Object} data - Email data
   * @returns {Promise<Object>} - Send result
   */
  async sendSupportEmail(data) {
    const { name, email, category, message } = data;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'adamsasiedu2004@gmail.com',
      replyTo: email,
      subject: `GoXpress Support: ${category || 'General Inquiry'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
            New Support Request
          </h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>From:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong>Category:</strong> ${category || 'Not specified'}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #555;">Message:</h3>
            <p style="line-height: 1.6; color: #666;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
            <p>This email was sent from the GoXpress POS Support Form</p>
          </div>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Support email sent:', info.messageId);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('❌ Email send error:', error);
      throw new Error('Failed to send email: ' + error.message);
    }
  }
}

export default new EmailService();
