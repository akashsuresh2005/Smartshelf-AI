import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ✅ FIXED: Named export (ESM compatible)
export async function sendWhatsApp(to, message, mediaUrl = null) {
  try {
    const msgOptions = {
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`,
      body: message,
    };

    if (mediaUrl) {
      msgOptions.mediaUrl = [mediaUrl];
    }

    const response = await client.messages.create(msgOptions);

    console.log("✅ WhatsApp sent:", response.sid);
    return response;
  } catch (err) {
    console.error("❌ WhatsApp Error:", err.message);
    throw err;
  }
}