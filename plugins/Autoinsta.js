import axios from 'axios';

const handler = async (m, { conn, command, text }) => {
  const chat = global.db.data.chats[m.chat]; // Access chat-specific settings
  if (!chat) return; // Ensure chat data exists

  // Command to toggle auto-download for the specific chat
  if (command === "ado") {
    if (!text || !["on", "off"].includes(text.toLowerCase())) {
      throw `حدد تشغل ولا توقف`;
    }

    chat.autoDownload = text.toLowerCase() === "on";
    const status = chat.autoDownload ? "تفعيله" : "تعطيله";
    await conn.sendMessage(m.chat, { text: `تنزيل الانستا التلقائي تم *${status}* لهذه الدردشة.` });
    return;
  }
};

// Global message handler for monitoring messages
handler.all = async function (m) {
  const chat = global.db.data.chats[m.chat]; // Access chat-specific settings
  if (!chat || !chat.autoDownload) return; // Skip if auto-download is disabled for this chat

  const message = m.text?.trim();

  // Check if the message contains an Instagram link
  if (isInstagramLink(message)) {
    await processInstagramLink(m, this, message); // Pass 'conn' as 'this' in handler.all
  }
};

const isInstagramLink = (text) => {
  if (!text) return false;
  const instaRegex = /https?:\/\/(www\.)?instagram\.com\/[^\s]+/i;
  return instaRegex.test(text);
};

const processInstagramLink = async (m, conn, link) => {
  // Notify user about the download process
  const { key } = await conn.sendMessage(
    m.chat,
    { text: "جارٍ المعالجة..." },
    { quoted: m }
  );

  try {
    const responseIg = await axios.get(`https://deliriussapi-oficial.vercel.app/download/instagram?url=${link}`);
    const resultIg = responseIg.data;

    if (resultIg.status && resultIg.data?.[0]?.url) {
      const downloadUrl = resultIg.data[0].url;
      await conn.sendFile(m.chat, downloadUrl, 'video.mp4', `Download complete`, m);
    } else {
      throw new Error("حدث خطأ.");
    }
  } catch (e) {
    console.error("حدث خطأ اثناء معالجة رابط الانستا:", e);
    await conn.sendMessage(m.chat, { text: `فشل التحميل حاول لاحقا.` }, { edit: key });
  }
};

handler.help = ['autodownload [on/off]'];
handler.tags = ['utility'];
handler.command = /^(autodownload|ado)$/i;

export default handler;
