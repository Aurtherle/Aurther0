let handler = async (m, { conn, command, args, usedPrefix }) => {
  let user = global.db.data.users[m.sender];

  // Check if the user is silenced for the "دجاج" command
  if (user.silencedDjaj) {
    return m.reply(
      `🔇 لا يمكنك استخدام أمر *دجاج* حاليًا. لقد تم إسكاتك بواسطة عنصر *صمت*. انتظر حتى انتهاء المدة.`
    );
  }

  // Check if the user already has a chicken
  if (user.chicken > 0) {
    return m.reply('🐔 لديك بالفعل دجاجة');
  }

  // Check if the user has enough credit
  if (user.credit < 1000) {
    return m.reply(`🟥 *ليس لديك ما يكفي من البيلي في محفظتك لشراء دجاجة*`);
  }

  // Deduct credit and add a chicken
  user.credit -= 1000;
  user.chicken += 1;

  m.reply(
    `🎉 لقد اشتريت الدجاج بنجاح! اكتب \`.قتال\` ثم الكمية لتقاتل.`
  );
};

handler.help = ['buych'];
handler.tags = ['economy'];
handler.command = ['دجاج'];

handler.group = true;

export default handler;