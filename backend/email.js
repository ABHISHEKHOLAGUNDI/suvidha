// 100% FREE Email Notifications (Gmail)
// No API limits, works everywhere, instant delivery
// Perfect as fallback if WhatsApp fails

const nodemailer = require('nodemailer');

// Gmail credentials from environment
const GMAIL_USER = process.env.GMAIL_USER || 'abhishekholagundi@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || 'hrmp blqh hxvk dxbk';

let transporter = null;
let isConfigured = false;

// Initialize Gmail transporter
function initEmail() {
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
        console.log('⚠️  Email notifications disabled. Add to .env:');
        console.log('   GMAIL_USER=your.email@gmail.com');
        console.log('   GMAIL_APP_PASSWORD=your_16char_app_password');
        console.log('   Get app password: https://myaccount.google.com/apppasswords');
        return false;
    }

    try {
        transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // Use STARTTLS
            auth: {
                user: GMAIL_USER,
                pass: GMAIL_APP_PASSWORD.replace(/\s/g, '') // Remove any spaces
            },
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 15000
        });

        // Verify connection once at start
        transporter.verify((error, success) => {
            if (error) {
                console.error('❌ Email transporter verification failed:', error.message);
            } else {
                console.log('✅ Email transporter is ready to take messages');
            }
        });

        isConfigured = true;
        console.log('✅ Email notifications ready (SMTP)');
        return true;
    } catch (error) {
        console.error('❌ Email setup failed:', error.message);
        return false;
    }
}

// Send email notification
async function sendEmailNotification(toEmail, subject, message, attachments = []) {
    if (!isConfigured && !initEmail()) {
        console.log('📧 Demo mode: Email would be sent to', toEmail);
        return { success: false, demo: true };
    }

    try {
        const mailOptions = {
            from: `"SUVIDHA Kiosk" <${GMAIL_USER}>`,
            to: toEmail,
            subject: subject,
            text: message,
            attachments: attachments.map(att => {
                // SAFETY: If content is provided, ensure path is NOT provided
                // Nodemailer hangs if 'path' is a large base64 string
                if (att.content && att.path) {
                    const { path, ...safeAtt } = att;
                    return safeAtt;
                }
                return att;
            }),
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #0891b2; border-radius: 10px;">
                    <div style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0;">🏙️ SUVIDHA Kiosk</h1>
                        <p style="color: #e0f2fe; margin: 5px 0 0 0;">Smart City Digital Helpdesk</p>
                    </div>
                    <div style="padding: 30px; background: white;">
                        <pre style="white-space: pre-wrap; font-family: Arial; font-size: 14px; line-height: 1.6;">${message}</pre>
                    </div>
                    <div style="background: #f0f9ff; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #64748b;">
                        <p style="margin: 0;">MeitY C-DAC Smart City Initiative 2026</p>
                        <p style="margin: 5px 0 0 0;">Government of India</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${toEmail}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Email send failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Email templates
function getBillPaymentEmail(userName, billType, amount, transactionId) {
    const subject = `✅ Payment Successful - ₹${amount.toFixed(2)} | SUVIDHA`;
    const message = `Hello ${userName},

🎉 Payment Successful!

Your ${billType.toUpperCase()} bill payment has been processed successfully.

Payment Details:
━━━━━━━━━━━━━━━━
💰 Amount Paid: ₹${amount.toFixed(2)}
📄 Transaction ID: ${transactionId}
📋 Bill Type: ${billType.toUpperCase()}
⏰ Date & Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Thank you for using SUVIDHA Kiosk!

For any queries, visit your nearest SUVIDHA center.

Best regards,
SUVIDHA Team
MeitY C-DAC Smart City Initiative`;

    return { subject, message };
}

function getPendingBillEmail(userName, billType, amount, dueDate) {
    const daysLeft = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    const subject = `⚠️ Bill Reminder - ₹${amount.toFixed(2)} Due | SUVIDHA`;
    const message = `Hello ${userName},

⚠️ Payment Reminder

You have a pending ${billType.toUpperCase()} bill payment.

Bill Details:
━━━━━━━━━━━━━━━━
💰 Amount Due: ₹${amount.toFixed(2)}
📋 Bill Type: ${billType.toUpperCase()}
📅 Due Date: ${dueDate}
⏰ Days Remaining: ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}

${daysLeft <= 3 ? '🚨 URGENT: Bill due soon! Late payment charges may apply.' : ''}

Please pay at your nearest SUVIDHA Kiosk to avoid late fees.

Best regards,
SUVIDHA Team
MeitY C-DAC Smart City Initiative`;

    return { subject, message };
}

// OTP Email Template
function getOTPEmail(userName, otp, billType, amount) {
    const subject = `🔐 Payment OTP: ${otp} | SUVIDHA`;
    const message = `Hello ${userName},

🔐 Your One-Time Password (OTP) for bill payment:

═══════════════════
      ${otp}
═══════════════════

Bill Payment Details:
━━━━━━━━━━━━━━━━━━━━
💰 Amount: ₹${amount.toFixed(2)}
📋 Bill Type: ${billType.toUpperCase()}
⏰ Valid for: 5 minutes

⚠️ SECURITY NOTICE:
• NEVER share this OTP with anyone
• SUVIDHA staff will NEVER ask for your OTP
• If you did not request this payment, please contact us immediately

This OTP will expire in 5 minutes for your security.

Best regards,
SUVIDHA Team
MeitY C-DAC Smart City Initiative`;

    return { subject, message };
}

// Initialize on load
initEmail();

// Email templates
function getGrievanceAdminEmail(ticketId, category, name, description, userEmail) {
    const subject = `📢 New Grievance Alert - ${category} | Ticket #${ticketId}`;
    const message = `Hello Admin,

A new grievance has been reported.

Details:
━━━━━━━━━━━━━━━━
🆔 Ticket ID: ${ticketId}
👤 Citizen: ${name} (${userEmail || 'No Email'})
📂 Category: ${category}
📝 Description: ${description}
⏰ Reported: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Please login to the Admin Dashboard to review and resolve.`;
    return { subject, message };
}

function getGrievanceResolvedEmail(userName, ticketId, category, resolutionProof) {
    const subject = `✅ Issue Resolved - ${category} | Ticket #${ticketId}`;
    const message = `Hello ${userName},

Good news! The grievance you reported has been RESOLVED by the specific department.

Details:
━━━━━━━━━━━━━━━━
🆔 Ticket ID: ${ticketId}
📂 Category: ${category}
✅ Status: RESOLVED
⏰ Resolved On: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

A photo of the resolution/repair is attached to this email as proof.

Thank you for being a responsible citizen!
SUVIDHA City OS`;

    // Handle base64 image attachment
    const attachments = [];
    if (resolutionProof) {
        try {
            // Check if it's a base64 data URI
            if (resolutionProof.startsWith('data:image')) {
                // Extract the base64 data and content type
                const matches = resolutionProof.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    const contentType = matches[1];
                    const base64Data = matches[2];
                    const extension = contentType.split('/')[1] || 'jpg';

                    attachments.push({
                        filename: `resolution-${ticketId}.${extension}`,
                        content: base64Data,
                        encoding: 'base64',
                        contentType: contentType
                    });
                } else {
                    console.warn('⚠️ Invalid base64 data URI format for resolution proof');
                }
            } else {
                // Assume it's a file path or URL
                attachments.push({
                    filename: `resolution-${ticketId}.jpg`,
                    path: resolutionProof
                });
            }
        } catch (e) {
            console.error('❌ Error processing resolution proof attachment:', e);
        }
    }

    return { subject, message, attachments };
}


module.exports = {
    initEmail,
    sendEmailNotification,
    getBillPaymentEmail,
    getPendingBillEmail,
    getOTPEmail,
    getGrievanceAdminEmail,
    getGrievanceResolvedEmail
};
