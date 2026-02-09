// 100% FREE WhatsApp Notifications via Meta Cloud API
// Get 1,000 free messages per month forever!
// Setup: https://developers.facebook.com/docs/whatsapp/cloud-api

const axios = require('axios');

const META_API_URL = 'https://graph.facebook.com/v18.0';
const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID || '';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';

let isConfigured = false;

// Check if Meta credentials are configured
function checkConfiguration() {
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
        console.log('⚠️  Meta WhatsApp not configured. Add to .env:');
        console.log('   META_PHONE_NUMBER_ID=your_phone_id');
        console.log('   META_ACCESS_TOKEN=your_token');
        return false;
    }
    isConfigured = true;
    console.log('✅ Meta WhatsApp Cloud API ready (1,000 free msgs/month)');
    return true;
}

// Send WhatsApp message via Meta Cloud API
async function sendWhatsAppNotification(phoneNumber, message) {
    if (!isConfigured && !checkConfiguration()) {
        console.log('📱 Demo mode: Message would be sent:', message.substring(0, 50) + '...');
        return { success: false, demo: true };
    }

    try {
        // Convert phone number format
        // Input: "whatsapp:+919876543210" or "+919876543210"
        // Output: "919876543210" (no + or whatsapp:)
        const cleanNumber = phoneNumber
            .replace('whatsapp:', '')
            .replace('+', '')
            .trim();

        const response = await axios.post(
            `${META_API_URL}/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: cleanNumber,
                type: 'text',
                text: {
                    preview_url: false,
                    body: message
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const messageId = response.data.messages[0].id;
        console.log(`✅ WhatsApp sent to ${cleanNumber}: ${messageId}`);
        return { success: true, id: messageId };

    } catch (error) {
        const errorMsg = error.response?.data?.error?.message || error.message;
        console.error('❌ Meta WhatsApp failed:', errorMsg);

        // Common errors
        if (errorMsg.includes('recipient')) {
            console.log('💡 Make sure the phone number is registered on WhatsApp');
        }
        if (errorMsg.includes('authentication')) {
            console.log('💡 Check your META_ACCESS_TOKEN in .env');
        }

        return { success: false, error: errorMsg };
    }
}

// Same message templates as Twilio version for compatibility
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

// Initialize on load
checkConfiguration();

module.exports = {
    sendWhatsAppNotification,
    getBillPaymentMessage,
    getPendingBillReminder,
    getWelcomeMessage
};
