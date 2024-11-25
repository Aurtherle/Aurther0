import axios from 'axios';
import yts from 'yt-search'; // Import yt-search library

const handler = async (m, { conn, args }) => {
  if (!m || typeof m !== 'object') {
    console.log("Invalid message object.");
    return;
  }

  // Validate arguments
  if (!args.length) {
    throw `*وين رابط أو اسم الفيديو؟*`;
  }

  // Fixed resolution to 720p
  const resolution = '720';

  // Send initial processing message and store the key for editing later
  const pingMsg = await conn.sendMessage(
    m.chat,
    { text: "🔎 جاري البحث... ⏳" },
    { quoted: m }
  );

  try {
    let videoUrl;
    let searchResultMessage = "لم يتم العثور على نتائج.";

    // Check if the input is a URL or a search query
    if (args[0].startsWith("http")) {
      // If it's a URL, use it directly
      videoUrl = args[0];
      searchResultMessage = `✅ تم العثور على رابط الفيديو! جاري التحميل...`;
    } else {
      // If it's a search query, use yt-search to find the video
      const query = args.join(" ");
      console.log(`Searching YouTube for: ${query}`);

      const searchResults = await yts(query);

      if (searchResults.videos.length > 0) {
        const firstResult = searchResults.videos[0];
        videoUrl = firstResult.url; // Get the URL of the first video
        searchResultMessage = `✅ تم العثور على الفيديو: *${firstResult.title}* \nجاري التحميل...`;
      } else {
        throw new Error("لم يتم العثور على نتائج للبحث.");
      }
    }

    // Edit the original message with the search result using relayMessage
    await conn.relayMessage(
      m.chat,
      {
        protocolMessage: {
          key: pingMsg.key,
          type: 14,
          editedMessage: {
            conversation: searchResultMessage,
          },
        },
      },
      {}
    );

    // Call the Exonity API with the video URL
    const apiUrl = `https://exonity.tech/api/ytdlp2-faster?apikey=adminsepuh&url=${videoUrl}`;
    console.log(`Fetching video details from: ${apiUrl}`);
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data.status === 200 && data.result?.media?.mp4) {
      const title = data.result.title || "video";
      const downloadUrl = data.result.media.mp4;

      // Edit again to notify the user about the download
      await conn.relayMessage(
        m.chat,
        {
          protocolMessage: {
            key: pingMsg.key,
            type: 14,
            editedMessage: {
              conversation: `🎥 *${title}*\n🔗 جاري التحميل ...`,
            },
          },
        },
        {}
      );

      // Send the video file (MP4)
      await conn.sendFile(
        m.chat,
        downloadUrl,
        `${title}.mp4`,
        `🎉 تم التحميل !\n📌 العنوان: ${title}`,
        m
      );
    } else {
      throw new Error("لم يتم العثور على رابط تحميل الفيديو.");
    }
  } catch (e) {
    console.error("Error during YouTube download:", e.message);

    // Edit the original message to notify the user about the error
    await conn.relayMessage(
      m.chat,
      {
        protocolMessage: {
          key: pingMsg.key,
          type: 14,
          editedMessage: {
            conversation: `⚠️ حدث خطأ أثناء تحميل الفيديو. تأكد من الرابط أو البحث وحاول مرة أخرى.`,
          },
        },
      },
      {}
    );
  }
};

handler.help = ['youtube <link yt> | <search query>'];
handler.tags = ['downloader'];
handler.command = /^(شغل)$/i;

export default handler;
