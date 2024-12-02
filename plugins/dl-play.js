import axios from 'axios';
import yts from 'yt-search'; // Import the yt-search library

const handler = async (m, { conn, args }) => {
  if (!m || typeof m !== 'object') {
    console.log("Invalid message object.");
    return;
  }

  // Validate arguments
  if (!args.length) {
    throw `*وين رابط أو اسم الفيديو؟*`;
  }

  // Send initial processing message
  const { key } = await conn.sendMessage(
    m.chat,
    { text: "جاري البحث... ⏳" },
    { quoted: m }
  );

  try {
    let videoUrl;

    // Check if the input is a URL or a search query
    if (args[0].startsWith("http")) {
      // If it's a URL, use it directly
      videoUrl = args[0];
    } else {
      // If it's a search query, use yt-search to find the video
      const query = args.join(" ");
      console.log(`Searching YouTube for: ${query}`);

      const searchResults = await yts(query);

      if (searchResults.videos.length > 0) {
        const firstResult = searchResults.videos[0];
        videoUrl = firstResult.url; // Get the URL of the first video
      } else {
        throw new Error("لم يتم العثور على نتائج للبحث.");
      }
    }

    // Call the download API with the video URL
    const apiUrl = `https://deliriussapi-oficial.vercel.app/download/ytmp4?url=${videoUrl}`;
    console.log(`Downloading video from: ${apiUrl}`);
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data.status && data.data?.download?.url) {
      const title = data.data.title || "video";
      const size = data.data.download.size || "غير معروف";
      const downloadUrl = data.data.download.url;
      const filename = data.data.download.filename || `${title}.mp4`;

      // Notify the user about the download
      await conn.sendMessage(
        m.chat,
        { text: `🎥 *${title}*\nالحجم: ${size}\n🔗 جاري التحميل...` },
        { edit: key }
      );

      // Send the video file with the correct filename and MIME type
      await conn.sendFile(
        m.chat,
        downloadUrl,
        filename,
        `🎉 تم التحميل بنجاح!\n📌 العنوان: ${title}\nالحجم: ${size}`,
        m,
        false, // If your library supports MIME types, set it here, e.g., { mimetype: 'video/mp4' }
        { mimetype: 'video/mp4' } // Specify the correct MIME type
      );
    } else {
      throw new Error("لم يتم العثور على رابط تحميل الفيديو.");
    }
  } catch (e) {
    console.error("Error during YouTube download:", e.message);

    // Notify the user about the error
    await conn.sendMessage(
      m.chat,
      { text: `⚠️ حدث خطأ أثناء تحميل الفيديو. تأكد من الرابط أو البحث وحاول مرة أخرى.` },
      { edit: key }
    );
  }
};

handler.help = ['youtube <link yt> | <search query>'];
handler.tags = ['downloader'];
handler.command = /^(شغل)$/i;

export default handler;
