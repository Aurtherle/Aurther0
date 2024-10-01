import fs from 'fs';
import path from 'path';
import ytdl from 'youtubedl-core';
import { Client } from 'undici';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let handler = async (m, { conn, args, isPrems, isOwner, usedPrefix, command }) => {
  let chat = global.db.data.chats[m.chat];
  if (!args || !args[0]) throw `✳️ مثال:\n${usedPrefix + command} https://youtu.be/YzkTFFwxtXI`;
  if (!args[0].match(/youtu/gi)) throw `❎ تأكد من أن الرابط هو رابط يوتيوب صالح`;
  await m.react('⏳')

  const videoDetails = await ytddl(args[0]);
  if (!videoDetails) throw `❎ حدث خطأ أثناء تحميل الفيديو`;

  const { url, title, author, description } = videoDetails;

  const response = await fetch(url);
  const data = await response.buffer();

  const caption = `*❃ ────────⊰ ❀ ⊱──────── ❃*
	  
❏ العنوان: ${title || 'غير معروف'}
❒ المؤلف: ${author || 'غير معروف'}
❒ الوصف: ${description || 'لا يوجد وصف متاح'}
❒ الرابط: ${args[0]}

*❃ ────────⊰ ❀ ⊱──────── ❃*`;

  conn.sendFile(m.chat, data, `${title || 'video'}.mp4`, caption, m, false, { asDocument: chat.useDocument });
  await m.react('✅')
};


handler.help = ['ytmp4 <yt-link>'];
handler.tags = ['downloader'];
handler.command = ['يوتيوب', 'فيديو', 'يوت'];
handler.diamond = false;

export default handler;

async function getCookies() {
  const cookiesPath = path.resolve(__dirname, '../Assets/cookies.json');
  if (!fs.existsSync(cookiesPath)) {
    throw new Error('ملف الكوكيز غير موجود');
  }
  return JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));
}

async function createClient() {
  const cookies = await getCookies();
  return new Client("https://www.youtube.com", {
    headers: {
      "Cookie": cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
    }
  });
}

async function ytddl(url) {
  try {
    const client = await createClient();
    const yt = await ytdl.getInfo(url, { requestOptions: { client: client } });
    const link = ytdl.chooseFormat(yt.formats, { quality: 'highest', filter: 'audioandvideo' });

    return {
      url: link.url,
      title: yt.videoDetails.title,
      author: yt.videoDetails.author.name,
      description: yt.videoDetails.description,
    };
  } catch (error) {
    console.error("حدث خطأ:", error);
    return null;  // تأكد من إرجاع null في حالة الخطأ
  }
}
