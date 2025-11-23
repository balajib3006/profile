const nodemailer = require('nodemailer');

// Email notification service
async function sendEmailNotification(messageData, notificationEmail, smtpConfig) {
    if (!smtpConfig || !notificationEmail) {
        console.log('Email notifications not configured');
        return { success: false, error: 'Not configured' };
    }

    try {
        // Create transporter
        const transporter = nodemailer.createTransporter({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.port === 465, // true for 465, false for other ports
            auth: {
                user: smtpConfig.user,
                pass: smtpConfig.pass
            }
        });

        // Email content
        const mailOptions = {
            from: `"Portfolio Admin" <${smtpConfig.user}>`,
            to: notificationEmail,
            subject: `New Message: ${messageData.subject || 'No Subject'}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
                    <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #667eea; margin-top: 0;">📬 New Portfolio Message</h2>
                        
                        <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>From:</strong> ${messageData.name}</p>
                            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${messageData.email}">${messageData.email}</a></p>
                            <p style="margin: 5px 0;"><strong>Subject:</strong> ${messageData.subject || 'N/A'}</p>
                            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                        
                        <div style="background: #fff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
                            <strong>Message:</strong>
                            <p style="margin-top: 10px; white-space: pre-wrap;">${messageData.message}</p>
                        </div>
                        
                        <div style="margin-top: 30px; text-align: center;">
                            <a href="${process.env.ADMIN_URL || 'http://localhost:3000'}/admin/messages.html" 
                               style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                View in Admin Panel
                            </a>
                        </div>
                    </div>
                    
                    <p style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
                        This is an automated notification from your portfolio contact form.
                    </p>
                </div>
            `
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email notification sent:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('Error sending email notification:', error);
        return { success: false, error: error.message };
    }
}

// WhatsApp notification service (optional - requires Twilio)
async function sendWhatsAppNotification(messageData, whatsappNumber) {
    // This requires Twilio to be installed and configured
    // Instructions for setup are in the documentation

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        console.log('WhatsApp notifications not configured (Twilio credentials missing)');
        return { success: false, error: 'Not configured' };
    }

    try {
        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        const message = await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
            to: `whatsapp:${whatsappNumber}`,
            body: `🔔 New Portfolio Message\n\nFrom: ${messageData.name}\nEmail: ${messageData.email}\n\nCheck your admin panel for details.`
        });

        console.log('WhatsApp notification sent:', message.sid);
        return { success: true, messageSid: message.sid };

    } catch (error) {
        console.error('Error sending WhatsApp notification:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendEmailNotification,
    sendWhatsAppNotification
};
