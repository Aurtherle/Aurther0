import axios from 'axios';

const handler = {};

// Global message handler for monitoring all messages
handler.all = async function (m) {
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
    { text: "جارٍ المعالجة اصبر شويتين..." },
    { quoted: m }
  );

  try {
    const responseIg = await axios.get(`https://deliriussapi-oficial.vercel.app/download/instagram?url=${link}`);
    const resultIg = responseIg.data;

    if (resultIg.status && resultIg.data?.[0]?.url) {
      const downloadUrl = resultIg.data[0].url;
      await conn.sendFile(m.chat, downloadUrl, 'video.mp4', `Download complete`, m);
    } else {
      throw new Error("لينك خاطئ او حدثت مشكلة اثناء التحميل.");
    }
  } catch (e) {
    console.error("حدثت مشكلة اثناء معالجة اللينك:", e);
    await conn.sendMessage(m.chat, { text: `فشل التحميل حاول لاحقا.` }, { edit: key });
  }
};

export default handler;
