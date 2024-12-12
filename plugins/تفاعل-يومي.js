let handler = async (m, { conn }) => {
  // Ensure the database structure is ready
  if (!global.db.data.users) throw `🚨 لا يوجد بيانات للمستخدمين.`;

  // Get the current date in a format suitable for tracking daily activity
  const today = new Date().toISOString().slice(0, 10);

  // Get the bot's ID
  let botId = conn.user.jid;

  // Get the group participants (users in the group where the command was used)
  let groupMetadata = await conn.groupMetadata(m.chat);
  let groupMembers = groupMetadata.participants.map(participant => participant.jid);

  // If the user sending the message is not in the group yet, we initialize their data
  let user = global.db.data.users[m.sender];
  if (!user) {
    global.db.data.users[m.sender] = {
      messages: 0,
      daily: {
        [today]: 1, // Start with 1 for the new user's first message
      },
    };
  } else {
    if (!user.daily) user.daily = {}; // Ensure the 'daily' field exists
    if (!user.daily[today]) user.daily[today] = 0; // Initialize today's messages to 0
    user.daily[today]++; // Increment today's message count
  }

  // Collect all users in the group, calculate their daily messages
  let users = Object.entries(global.db.data.users)
    .map(([id, data]) => ({
      id,
      name: data.name || 'مستخدم غير معروف',
      dailyMessages: (data.daily || {})[today] || 0, // Default to 0 if no messages today
    }))
    .filter(
      user => groupMembers.includes(user.id) && user.id !== botId && user.name !== 'مستخدم غير معروف' && user.dailyMessages > 0
    )
    .sort((a, b) => b.dailyMessages - a.dailyMessages); // Sort by daily messages

  if (users.length === 0) {
    return m.reply("🚨 لا توجد رسائل اليوم.");
  }

  // Build the leaderboard message
  let mentions = [];
  let leaderboard = `*❃ ───────⊰ ❀ ⊱─────── ❃*\n`;
  leaderboard += `🏆 *لوحة الصدارة - تفاعل اليوم* 🏆\n\n`;

  leaderboard += users
    .map((user, index) => {
      // Add user to mentions array
      mentions.push(user.id);

      // Use the stored name
      let name = user.name;
      let mention = `@${user.id.split('@')[0]}`;
      return `${index + 1}. *${name}* - ${user.dailyMessages} رسائل (${mention})`;
    })
    .join('\n');

  leaderboard += `\n\n💬 *إجمالي المتفاعلين اليوم:* ${users.length}\n`;
  leaderboard += `*❃ ───────⊰ ❀ ⊱─────── ❃*`;

  // Send the leaderboard with mentions
  try {
    await conn.sendMessage(m.chat, { text: leaderboard, mentions }, { quoted: m });
  } catch (error) {
    console.error(error);
    throw `⚠️ حدث خطأ أثناء إرسال لوحة الصدارة اليومية.`;
  }
};

handler.help = ['تفاعل-يومي'];
handler.tags = ['group', 'info'];
handler.command = ['تفاعل-يومي'];

export default handler;