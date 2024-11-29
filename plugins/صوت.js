import fetch from 'node-fetch';
import axios from 'axios';
import similarity from 'similarity';

const timeout = 60000; // Timeout in milliseconds
const poin = 10000; // Reward points
const threshold = 0.72; // Similarity threshold

const handler = async (m, { conn, usedPrefix }) => {
  if (!conn.tebaklaguo) conn.tebaklaguo = {};
  const id = m.chat;

  // Check if a game is already running in this chat
  if (id in conn.tebaklaguo) {
    conn.reply(m.chat, '*صبر ما تشوف فيه سؤال ؟*', conn.tebaklaguo[id].msg);
    return;
  }

  // Fetch random character sound data
  const res = await fetchJson(`https://raw.githubusercontent.com/Aurtherle/Games/main/.github/workflows/CharSound.json`);
  const json = res[Math.floor(Math.random() * res.length)];

  // Game caption
  const caption = `*❃ ──────⊰ ❀ ⊱────── ❃*\n*صوت من ؟؟*\n
  *الوقت :* ${(timeout / 1000).toFixed(2)} ثانية
  *الجائزة :* ${poin} خبرة
  رد الجواب على ذي الرسالة
  استخدم "تلميح" للحصول على مساعدة
*❃ ──────⊰ ❀ ⊱────── ❃*`.trim();

  // Send the game message and audio
  const msg = await m.reply(caption);
  await conn.sendMessage(
    m.chat,
    { audio: { url: json.link_song }, fileName: `sound.mp3`, mimetype: 'audio/mpeg' },
    { quoted: m }
  );

  // Store game state
  conn.tebaklaguo[id] = {
    msg,
    json,
    poin,
    timeout: setTimeout(() => {
      if (conn.tebaklaguo[id]) {
        conn.reply(
          m.chat,
          `*❃ ──────⊰ ❀ ⊱────── ❃*\n*خلص الوقت*\n*الجواب :* (${json.jawaban})\n*❃ ──────⊰ ❀ ⊱────── ❃*`,
          msg
        );
        delete conn.tebaklaguo[id];
      }
    }, timeout),
  };
};

// Recognize replies to the bot's message
handler.all = async function (m) {
  const id = m.chat;

  // Check if there's an active game in this chat
  if (!(id in conn.tebaklaguo)) return;

  const game = conn.tebaklaguo[id];

  // Ensure the reply is to the bot's question message
  if (!m.quoted || m.quoted.id !== game.msg.id) return;

  // Check if the user requested a hint
  if (/^(تلميح)$/i.test(m.text)) {
    const hint = generateHint(game.json.jawaban);
    conn.reply(m.chat, `*تلميح:* ${hint}`, m);
    return;
  }

  // Check if the user surrendered
  if (/^(انسحب|surr?ender)$/i.test(m.text)) {
    clearTimeout(game.timeout);
    delete conn.tebaklaguo[id];
    conn.reply(m.chat, '*ماااش مافي مستوى*', m);
    return;
  }

  // Check the user's answer
  const answer = m.text.trim().toLowerCase();
  const correct = game.json.jawaban.toLowerCase().trim();

  if (answer === correct) {
    // Correct answer
    global.db.data.users[m.sender].exp += game.poin;
    conn.reply(m.chat, `*❃ ──────⊰ ❀ ⊱────── ❃*\n*❀ شوكولولو ❀*\n\n*◍ الجائزة :* ${game.poin} خبرة\n*❃ ──────⊰ ❀ ⊱────── ❃*`, m);
    clearTimeout(game.timeout);
    delete conn.tebaklaguo[id];
  } else if (similarity(answer, correct) >= threshold) {
    // Close answer
    conn.reply(m.chat, '*اوخخ قربتت*', m);
  } else {
    // Wrong answer
    conn.reply(m.chat, '*نااه*', m);
  }
};

// Generate a randomized hint for the answer
function generateHint(name) {
  const nameArray = name.split('');
  const revealedIndexes = [];

  // Reveal 50% of the letters
  while (revealedIndexes.length < Math.ceil(name.length / 2)) {
    const randomIndex = Math.floor(Math.random() * name.length);
    if (!revealedIndexes.includes(randomIndex)) {
      revealedIndexes.push(randomIndex);
    }
  }

  // Generate the hint by replacing unrevealed letters with underscores
  return nameArray
    .map((char, index) => (revealedIndexes.includes(index) ? char : '_'))
    .join('');
}

// Fetch JSON data
async function fetchJson(url, options) {
  try {
    options = options || {};
    const res = await axios({
      method: 'GET',
      url: url,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      ...options,
    });
    return res.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch JSON data');
  }
}

handler.help = ['tebaklaguo'];
handler.tags = ['game'];
handler.command = /^صوت_ش|canción$/i;

export const exp = 10000
export default handler;