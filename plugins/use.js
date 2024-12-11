let useHandler = async (m, { conn, args }) => {
  let who = m.sender; // User using the item
  let user = global.db.data.users[who]; // Get user data

  if (!args[0] || !args[1]) {
    return conn.reply(m.chat, `❓ الاستخدام: \`!استخدام <item> @user\``, m);
  }

  let itemName = args[0].trim().toLowerCase(); // Normalize input
  let target = m.mentionedJid && m.mentionedJid[0];
  if (!target) throw `❌ يجب تحديد شخص لاستخدام العنصر عليه.`;

  let targetUser = global.db.data.users[target];
  if (!targetUser) throw `❌ المستخدم المستهدف غير موجود في قاعدة البيانات.`;

  // Check inventory for the item
  let inventoryItem = user.inventory?.find((item) => item.name === itemName);
  if (!inventoryItem || inventoryItem.count <= 0) {
    return conn.reply(
      m.chat,
      `❌ ليس لديك عنصر "${args[0]}" في مخزونك!`,
      m
    );
  }

  // Reduce the item's count
  inventoryItem.count -= 1;

  // Format the mention
  let targetMention = '@' + target.split('@')[0]; // Use only the local part of the JID

  // Apply item effects
  if (itemName === 'لعنة') {
    let reductionPercentage = Math.floor(Math.random() * 21) + 10; // Random percentage (10%-30%)
    let reductionAmount = Math.floor((reductionPercentage / 100) * targetUser.credit);
    targetUser.credit -= reductionAmount;

    conn.reply(
      m.chat,
      `🌀 لقد استخدمت *${itemName}* على ${targetMention}\n🪙 ثروته انخفضت بنسبة ${reductionPercentage}% (${reductionAmount} 🪙).`,
      m,
      { mentions: [target] }
    );
  } else if (itemName === 'صمت') {
    targetUser.silencedDjaj = true;
    setTimeout(() => {
      targetUser.silencedDjaj = false;
    }, 3600000); // Silence lasts for 1 hour

    conn.reply(
      m.chat,
      `🔇 لقد استخدمت *${itemName}* على ${targetMention}. لا يمكنه استخدام أمر .دجاج لمدة ساعة!`,
      m,
      { mentions: [target] }
    );
  } else {
    conn.reply(
      m.chat,
      `❌ العنصر "${args[0]}" لا يحتوي على أي تأثير معروف.`,
      m
    );
  }
};

useHandler.help = ['use'];
useHandler.tags = ['economy'];
useHandler.command = ['استخدام', 'use'];

export default useHandler;