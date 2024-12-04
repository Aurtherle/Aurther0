const handler = async (m, { conn, args, groupMetadata }) => {
  let who =
    m.quoted?.sender ||
    (m.mentionedJid && m.mentionedJid[0]) ||
    (m.fromMe ? conn.user.jid : m.sender);

  if (!global.db || !global.db.data || !global.db.data.users) {
    throw 'قاعدة البيانات غير مهيأة.';
  }

  if (!(who in global.db.data.users)) {
    throw 'المستخدم غير موجود في قاعدة البيانات';
  }

  const user = global.db.data.users[who];
  const { name, kickTime } = user;

  // Ensure name is not blank
  if (!name || name.trim() === '') {
    throw 'اسم المستخدم غير مسجل. يرجى التسجيل أولاً.';
  }

  let replyMessage = `*❃ ──────⊰ ❀ ⊱────── ❃*\n\n`;
  replyMessage += `◍ *لقبهُ: ${name}* \n`;

  // Check if the user has a scheduled kick
  if (kickTime) {
    const timeLeft = new Date(kickTime) - Date.now();
    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24)); // Calculate days left
    replyMessage += `◍ *العضوية : زائر*\n`;
    replyMessage += `◍ *وقت الزيارة المتبقي : ${daysLeft} ايام*\n\n`;
  } else {
    replyMessage += `◍ *العضوية : دائم*\n\n`;
  }

  replyMessage += `*❃ ──────⊰ ❀ ⊱────── ❃*`;

  m.reply(replyMessage);
};

handler.help = ['myns'];
handler.tags = ['xp'];
handler.command = ['لقبه', 'لقبي'];
handler.group = true;

export default handler;