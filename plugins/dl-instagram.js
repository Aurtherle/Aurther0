import fetch from 'node-fetch';
import axios from 'axios';
import instagramGetUrl from 'instagram-url-direct';
import { instagram } from '@xct007/frieren-scraper';
import { instagramdl } from '@bochilteam/scraper';

const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!args[0]) throw `يرجى تقديم رابط إنستغرام.\n*${usedPrefix + command} https://www.instagram.com/p/CCoI4DQBGVQ/?igshid=YmMyMTA2M2Y=*`;

  // Removed fkontak and simply send the message
  const { key } = await conn.sendMessage(m.chat, { text: "يرجى الانتظار..." });
  await conn.sendMessage(m.chat, { text: "جارِ جلب البيانات...", edit: key });

  try {
    const responseIg = await axios.get(`https://deliriusapi-official.vercel.app/download/instagram?url=${args[0]}`);
    const resultlIg = responseIg.data;
    let linkig = resultlIg.data[0].url;
    await conn.sendFile(m.chat, linkig, 'video.mp4', `إليك الفيديو من إنستغرام`, m);
  } catch {
    try {
      const resultD = await instagramdl(args[0]);
      const linkD = resultD[0].download_link;
      await conn.sendFile(m.chat, linkD, 'video.mp4', `إليك الفيديو من إنستغرام`, m);
      await conn.sendMessage(m.chat, { text: "اكتمل", edit: key });
    } catch {
      try {
        const apiUrll = `https://api.betabotz.org/api/download/igdowloader?url=${encodeURIComponent(args[0])}&apikey=bot-secx3`;
        const responsel = await axios.get(apiUrll);
        const resultl = responsel.data;
        for (const item of resultl.message) {
          const shortUrRRl = await (await fetch(`https://tinyurl.com/api-create.php?url=${item.thumbnail}`)).text();
          let tXXxt = `✨ *الرابط | URL:* ${shortUrRRl}\n\nتم اكتمال التحميل`.trim();
          conn.sendFile(m.chat, item._url, null, tXXxt, m);
          await conn.sendMessage(m.chat, { text: "اكتمل", edit: key });
          await new Promise((resolve) => setTimeout(resolve, 10000));
        }
      } catch {
        try {
          const datTa = await instagram.v1(args[0]);
          for (const urRRl of datTa) {
            const shortUrRRl = await (await fetch(`https://tinyurl.com/api-create.php?url=${args[0]}`)).text();
            const tXXxt = `✨ *الرابط | URL:* ${shortUrRRl}\n\nتم اكتمال التحميل`.trim();
            conn.sendFile(m.chat, urRRl.url, 'video.mp4', tXXxt, m);
            await conn.sendMessage(m.chat, { text: "اكتمل", edit: key });
            await new Promise((resolve) => setTimeout(resolve, 10000));
          }
        } catch {
          try {
            const resultss = await instagramGetUrl(args[0]).url_list[0];
            const shortUrl2 = await (await fetch(`https://tinyurl.com/api-create.php?url=${args[0]}`)).text();
            const txt2 = `✨ *الرابط | URL:* ${shortUrl2}\n\nتم اكتمال التحميل`.trim();
            await conn.sendFile(m.chat, resultss, 'video.mp4', txt2, m);
            await conn.sendMessage(m.chat, { text: "اكتمل", edit: key });
          } catch {
            try {
              const resultssss = await instagramdl(args[0]);
              const shortUrl3 = await (await fetch(`https://tinyurl.com/api-create.php?url=${args[0]}`)).text();
              const txt4 = `✨ *الرابط | URL:* ${shortUrl3}\n\nتم اكتمال التحميل`.trim();
              for (const { url } of resultssss) await conn.sendFile(m.chat, url, 'video.mp4', txt4, m);
              await conn.sendMessage(m.chat, { text: "اكتمل", edit: key });
            } catch {
              try {
                const human = await fetch(`https://api.lolhuman.xyz/api/instagram?apikey=${lolkeysapi}&url=${args[0]}`);
                const json = await human.json();
                const videoig = json.result;
                const shortUrl1 = await (await fetch(`https://tinyurl.com/api-create.php?url=${args[0]}`)).text();
                const txt1 = `✨ *الرابط | URL:* ${shortUrl1}\n\nتم اكتمال التحميل`.trim();
                await conn.sendFile(m.chat, videoig, 'video.mp4', txt1, m);
                await conn.sendMessage(m.chat, { text: "اكتمل", edit: key });
              } catch (e) {
                conn.sendMessage(m.chat, { text: `حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.`, edit: key });
                console.log(`خطأ: ${e}`);
              }
            }
          }
        }
      }
    }
  }
};

handler.help = ['انستغرام <رابط ig>'];
handler.tags = ['تحميل'];
handler.command = /^انستا$/i;
handler.limit = 2;
handler.register = true;

export default handler;