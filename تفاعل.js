let handler = async (m, { conn }) => {
  // Check if there are users in the database
  if (!global.db.data.users) throw `🚨 لا يوجد بيانات للمستخدمين.`;

  // Get the bot's ID
  let botId = conn.user.jid;

  // Get all users from the database, exclude the bot and those with "مستخدم غير معروف", and sort by messages
  let users = Object.entries(global.db.data.users)
    .map(([id, data]) => ({ id, ...data }))
    .filter(
      user => user.id !== botId && user.name && user.name !== 'مستخدم غير معروف'
    ) // Exclude the bot and unknown users
    .sort((a, b) => b.messages - a.messages);

  // Select the top 10 users
  let topUsers = users.slice(0, 10);

  // Build the leaderboard message
  let mentions = [];
  let leaderboard = `*❃ ────────⊰ ❀ ⊱──────── ❃*\n`;
  leaderboard += `🏆 *لوحة الصدارة - أكثر الأعضاء تفاعلًا* 🏆\n\n`;

  leaderboard += topUsers
    .map((user, index) => {
      // Add user to mentions array
      mentions.push(user.id);

      // Use the stored name
      let name = user.name;
      let mention = `@${user.id.split('@')[0]}`;
      return `${index + 1}. *${name}* - ${user.messages} رسائل (${mention})`;
    })
    .join('\n');

  leaderboard += `\n\n💬 *إجمالي المستخدمين:* ${users.length}\n`;
  leaderboard += `*❃ ────────⊰ ❀ ⊱──────── ❃*`;

  // Send the leaderboard with mentions
  try {
    await conn.sendMessage(m.chat, { text: leaderboard, mentions }, { quoted: m });
  } catch (error) {
    console.error(error);
    throw `⚠️ حدث خطأ أثناء إرسال لوحة الصدارة.`;
  }
};

handler.help = ['leaderboard', 'top'];
handler.tags = ['group', 'info'];
handler.command = ['لوحة', 'تفاعل', 'top'];

export default handler;