// WhatsApp Notification Service using Twilio
// Setup: Get free Twilio account at https://www.twilio.com/try-twilio

const twilio = require('twilio');

// Configuration (will be in .env file)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio Sandbox

let twilioClient = null;

// Initialize Twilio client
function initTwilio() {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
        console.log('⚠️  WhatsApp notifications disabled: Twilio credentials not configured');
        return false;
    }

    try {
        twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        console.log('✅ Twilio WhatsApp client initialized');
        return true;
    } catch (error) {
        console.error('❌ Twilio initialization failed:', error.message);
        return false;
    }
}

// Send WhatsApp notification
async function sendWhatsAppNotification(phoneNumber, message) {
    if (!twilioClient) {
        const initialized = initTwilio();
        if (!initialized) {
            console.log('📱 WhatsApp notification skipped (demo mode):', message);
            return { success: false, demo: true };
        }
    }

    try {
        // Ensure phone number is in WhatsApp format
        const whatsappNumber = phoneNumber.startsWith('whatsapp:')
            ? phoneNumber
            : `whatsapp:${phoneNumber}`;

        const result = await twilioClient.messages.create({
            from: TWILIO_WHATSAPP_NUMBER,
            to: whatsappNumber,
            body: message
        });

        console.log('✅ WhatsApp sent:', result.sid);
        return { success: true, sid: result.sid };
    } catch (error) {
        console.error('❌ WhatsApp send failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Template Messages
function getBillPaymentMessage(userName, billType, amount, transactionId) {
    return `🎉 *SUVIDHA Payment Successful*

Hello ${userName},

Your ${billType.toUpperCase()} bill payment has been processed!

💰 Amount: ₹${amount.toFixed(2)}
📄 Transaction ID: ${transactionId}
⏰ Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Thank you for using SUVIDHA Kiosk!
- MeitY C-DAC Smart City Initiative`;
}

function getPendingBillReminder(userName, billType, amount, dueDate) {
    return `⚠️ *SUVIDHA Bill Reminder*

Hello ${userName},

You have a pending ${billType.toUpperCase()} bill:

💰 Amount Due: ₹${amount.toFixed(2)}
📅 Due Date: ${dueDate}
⏰ Days Remaining: ${Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24))}

Late payment charges may apply after due date.

Pay now at your nearest SUVIDHA Kiosk!
- MeitY C-DAC Smart City Initiative`;
}

function getWelcomeMessage(userName, phone) {
    return `🏙️ *Welcome to SUVIDHA!*

Hello ${userName},

You've successfully registered for WhatsApp notifications.

📱 Number: ${phone}
✅ Notifications: Enabled

You'll receive:
- Bill payment confirmations
- Pending bill reminders
- Service updates
- Emergency alerts

Reply STOP to unsubscribe anytime.
- MeitY C-DAC Smart City Initiative`;
}

// Export functions
module.exports = {
    initTwilio,
    sendWhatsAppNotification,
    getBillPaymentMessage,
    getPendingBillReminder,
    getWelcomeMessage
};
