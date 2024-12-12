let handler = async (m, { conn }) => {
  // Ensure the database structure is ready
  if (!global.db.data.users) throw `🚨 لا يوجد بيانات للمستخدمين.`;

  // Get the list of participants in the group
  let groupMetadata = await conn.groupMetadata(m.chat);
  let participants = groupMetadata.participants;

  // Get today's date and the upcoming Friday for weekly tracking
  const today = new Date().toISOString().slice(0, 10);
  const dayOfWeek = new Date().getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  let currentFriday = new Date();
  currentFriday.setDate(currentFriday.getDate() + daysUntilFriday);
  currentFriday = currentFriday.toISOString().slice(0, 10); // Format as YYYY-MM-DD

  // Track the messages of users
  let user = global.db.data.users[m.sender];
  if (user) {
    if (!user.weekly) user.weekly = {};  // Initialize weekly tracking if it doesn't exist

    // Increment the user's weekly message count
    if (!user.weekly[currentFriday]) user.weekly[currentFriday] = 0;  // Initialize weekly count if not present
    user.weekly[currentFriday]++;  // Increment weekly message count
  } else {
    // Initialize user data if not present
    global.db.data.users[m.sender] = {
      exp: 0,
      credit: 10,
      bank: 0,
      chicken: 0,
      lastclaim: 0,
      registered: false,
      name: m.name,
      age: -1,
      regTime: -1,
      afk: -1,
      afkReason: '',
      banned: false,
      warn: 0,
      level: 0,
      role: 'Tadpole',
      autolevelup: true,
      messages: 1,
      weekly: {
        [currentFriday]: 1,  // Start counting weekly messages
      },
      kickTime: 0,
      scheduledKick: false,
      remainingKickTime: 0,
    };
  }

  // Prepare the list of users and their weekly message count
  let leaderboard = `*❃ ───────⊰ ❀ ⊱─────── ❃*\n`;
  leaderboard += `🏆 *تفاعل الأسبوع* 🏆\n\n`;

  let mentions = [];
  let usersList = participants
    .map(participant => {
      let userId = participant.jid;
      
      // Check if the userId is valid and exists in the database
      let user = global.db.data.users[userId] || {}; // Default to empty object if not found
      if (!userId || !user || !userId.includes('@')) return ''; // Skip if invalid userId

      let name = user.name || 'مستخدم غير معروف';  // Fallback to "مستخدم غير معروف"
      let weeklyMessages = user.weekly ? user.weekly[currentFriday] || 0 : 0;

      // If it's the bot, count its messages as well and mention it
      if (userId === conn.user.jid) {
        name = "البوت";  // Name it as "البوت" for the bot
        weeklyMessages = user.weekly ? user.weekly[currentFriday] || 0 : 0;
      }

      mentions.push(userId); // Add user to mentions

      // Ensure userId is valid and not undefined, split safely
      let mention = `@${userId.split('@')[0]}`;  // This will safely split if the userId exists
      return `*${name}* - ${weeklyMessages} رسائل ${mention}`;
    })
    .filter(user => user !== '')  // Filter out invalid users
    .join('\n');

  leaderboard += usersList || 'لا توجد رسائل هذا الأسبوع.\n';

  leaderboard += `\n💬 *إجمالي المتفاعلين هذا الأسبوع:* ${participants.length}\n`;
  leaderboard += `*❃ ───────⊰ ❀ ⊱─────── ❃*`;

  // Send the leaderboard message
  try {
    await conn.sendMessage(m.chat, { text: leaderboard, mentions }, { quoted: m });
  } catch (error) {
    console.error(error);
    throw `⚠️ حدث خطأ أثناء إرسال لوحة الصدارة الأسبوعية.`;
  }
};

handler.help = ['تفاعل-اسبوعي'];
handler.tags = ['group', 'info'];
handler.command = ['تفاعل-اسبوعي'];

export default handler;