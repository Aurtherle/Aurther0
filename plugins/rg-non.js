let handler = async (m, { conn, participants }) => {
  // Initialize the message text
  let teks = "*❃ ──────⊰ ❀ ⊱────── ❃*\n\n";

  // Loop through participants and find unregistered users
  let unregistered = [];
  for (let mem of participants) {
    let user = global.db.data.users[mem.id] || { registered: false };
    if (!user.registered) {
      unregistered.push(mem.id);
    }
  }

  // If there are unregistered users, create the mention message
  if (unregistered.length > 0) {
    teks += "*⚠️ تنبيه: هؤلاء المستخدمين غير مسجلين*\n\n";
    // Mention each unregistered user, with the ◍ symbol at the start
    for (let userId of unregistered) {
      teks += `◍ @${userId.split('@')[0]}  غير مسجل ⚠️\n`;
    }
  } else {
    teks += "كل المستخدمين في المجموعة مسجلون ✅.\n";
  }

  // End of message
  teks += "\n*❃ ──────⊰ ❀ ⊱────── ❃*";

  // Send the message with mentions to the group
  conn.sendMessage(m.chat, { text: teks, mentions: unregistered });
}

// Command properties
handler.help = ['غير مسجل'];
handler.tags = ['group'];
handler.command = /^(غير-مسجل)$/i;
handler.group = true;
handler.admin = true;

// Export the handler function
export default handler;