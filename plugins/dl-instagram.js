import axios from 'axios';

const handler = async (m, { conn, args, command, usedPrefix }) => {
  // Validate the message object
  if (!m || typeof m !== 'object') {
    console.log("Invalid message object.");
    return;
  }

  // Validate arguments
  if (!args[0]) {
    throw `*وين لينك الانستا ؟*`;
  }

  // Send initial processing message
  const { key } = await conn.sendMessage(
    m.chat,
    { text: "جاري المعالجة..." },
    { quoted: m }
  );
  await conn.sendMessage(m.chat, { text: "صبر...", edit: key });

  // Method 1: Use the primary API
  try {
    const responseIg = await axios.get(`https://deliriussapi-oficial.vercel.app/download/instagram?url=${args[0]}`);
    const resultIg = responseIg.data;

    if (resultIg.status && resultIg.data?.[0]?.url) {
      const downloadUrl = resultIg.data[0].url;
      await conn.sendFile(m.chat, downloadUrl, 'video.mp4', `Download complete`, m);
    } else {
      throw new Error("حدث خطأ.");
    }
  } catch (e) {
    console.error("An error occurred with the primary method:", e);

    // Send error message
    await conn.sendMessage(
      m.chat,
      { text: `An error occurred while processing your request. Please try again later.` },
      { edit: key }
    );
  }
};

handler.help = ['instagram <link ig>'];
handler.tags = ['downloader'];
handler.command = /^(انستا)$/i;

export default handler;
