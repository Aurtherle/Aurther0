import axios from 'axios';

const handler = async (m, { conn, args }) => {
  // Validate the message object
  if (!m || typeof m !== 'object') {
    console.log("Invalid message object.");
    return;
  }

  // Validate arguments
  if (!args[0]) {
    throw `*وين لينك تويتر؟*`;
  }

  // Send initial processing message
  const { key } = await conn.sendMessage(
    m.chat,
    { text: "جاري المعالجة..." },
    { quoted: m }
  );
  await conn.sendMessage(m.chat, { text: "صبر...", edit: key });

  // Fetch the media from Twitter using the API
  try {
    const response = await axios.get(`https://deliriussapi-oficial.vercel.app/download/twitterv2?url=${args[0]}`);
    const result = response.data;

    if (result.status && result.data?.media?.length > 0) {
      const media = result.data.media[0]; // Get the first media item
      const downloadUrl = media.type === "photo" ? media.image : media.video; // Check type
      const filename = media.type === "photo" ? "image.jpg" : "video.mp4";

      // Prepare additional info (optional)
      const description = result.data.description || "No description available.";
      const author = result.data.author.username || "Unknown";

      // Send media and description
      await conn.sendFile(
        m.chat,
        downloadUrl,
        filename,
        `*وصف التغريدة:*\n${description}\n\n*الكاتب:* @${author}`,
        m
      );
    } else {
      throw new Error("No media found.");
    }
  } catch (e) {
    console.error("An error occurred with the Twitter API:", e);

    // Notify the user of the error
    await conn.sendMessage(
      m.chat,
      { text: `حدث خطأ أثناء معالجة طلبك. حاول مرة أخرى لاحقًا` },
      { edit: key }
    );
  }
};

handler.help = ['twitter <link tw>'];
handler.tags = ['downloader'];
handler.command = /^(تويتر|twitter)$/i;

export default handler;