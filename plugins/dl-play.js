import axios from 'axios';

const handler = async (m, { conn, args, command, usedPrefix }) => {
  // Check if the message and arguments are valid
  if (!m || typeof m !== 'object') {
    console.log("Invalid message object.");
    return;
  }

  if (!args[0]) {
    throw `*Please provide the name of the video or link, e.g., "${usedPrefix}${command} imagine dragons believer".*`;
  }

  // Inform the user that processing has started
  const { key } = await conn.sendMessage(
    m.chat,
    { text: "Processing your request, please wait..." },
    { quoted: m }
  );

  try {
    // Search or download YouTube video using an API
    const query = args.join(" ");
    const response = await axios.get(`https://api.yourytapi.com/search`, {
      params: { query }, // Pass the search term or YouTube link
    });

    // Process the response
    const result = response.data;
    if (result.status && result.data?.[0]?.downloadUrl) {
      const video = result.data[0];
      const downloadUrl = video.downloadUrl;

      // Send the video to the user
      const fileName = `${video.title}.mp4`;
      await conn.sendFile(m.chat, downloadUrl, fileName, `Download complete: ${video.title}`, m);
    } else {
      throw new Error("Could not find the video or invalid response from the API.");
    }
  } catch (e) {
    console.error("An error occurred while processing the YouTube request:", e);

    // Inform the user about the error
    await conn.sendMessage(
      m.chat,
      { text: `An error occurred while processing your request. Please try again later.` },
      { edit: key }
    );
  }
};

handler.help = ['yt <search term or link>'];
handler.tags = ['downloader'];
handler.command = /^(شغل)$/i;

export default handler;
