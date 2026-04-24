import axios from "axios";

export default function WhatsAppButton({ item }) {
  const sendAlert = async () => {
    try {
      await axios.post("/api/notifications/whatsapp", {
        itemId: item._id,
        phone: "+91XXXXXXXXXX"
      });

      alert("WhatsApp alert sent!");
    } catch (err) {
      alert("Failed to send WhatsApp alert");
    }
  };

  return (
    <button
      onClick={sendAlert}
      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded"
    >
      WhatsApp Alert
    </button>
  );
}