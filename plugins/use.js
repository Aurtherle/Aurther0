let useHandler = async (m, { conn, args }) => {
  const ITEM_EFFECTS = {
    لعنة: {
      apply: (user, targetUser) => {
        let reductionPercentage = Math.floor(Math.random() * 21) + 10;
        let reductionAmount = Math.floor((reductionPercentage / 100) * targetUser.credit);
        targetUser.credit = Math.max(0, targetUser.credit - reductionAmount);
        return `🌀 لقد استخدمت *لعنة* على @${targetUser.id.split('@')[0]}. 🪙 ثروته انخفضت بنسبة ${reductionPercentage}% (${reductionAmount} 🪙).`;
      },
    },
    صمت: {
      apply: (user, targetUser) => {
        targetUser.silencedDjaj = true;
        setTimeout(() => (targetUser.silencedDjaj = false), 3600000); // 1 hour
        return `🔇 لقد استخدمت *صمت* على @${targetUser.id.split('@')[0]}. لا يمكنه استخدام أمر .دجاج لمدة ساعة!`;
      },
    },
  };

  let who = m.sender;
  let user = global.db.data.users[who];
  if (!user.inventory) user.inventory = [];

  if (!args[0] || !args[1]) {
    return conn.reply(m.chat, `❓ الاستخدام: \`!استخدام <العنصر> @user\``, m);
  }

  let itemName = args[0].trim().toLowerCase();
  let target = m.mentionedJid && m.mentionedJid[0];
  if (!target) throw `❌ يجب تحديد شخص لاستخدام العنصر عليه.`;

  let targetUser = global.db.data.users[target];
  if (!targetUser) throw `❌ المستخدم المستهدف غير موجود في قاعدة البيانات.`;

  let inventoryItem = user.inventory.find((item) => item.name === itemName);
  if (!inventoryItem || inventoryItem.count <= 0) {
    return conn.reply(m.chat, `❌ ليس لديك عنصر "${args[0]}" في مخزونك!`, m);
  }

  if (!ITEM_EFFECTS[itemName]) {
    return conn.reply(m.chat, `❌ العنصر "${itemName}" لا يحتوي على أي تأثير معروف.`, m);
  }

  inventoryItem.count -= 1; // Reduce item count
  let effectMessage = ITEM_EFFECTS[itemName].apply(user, targetUser);
  conn.reply(m.chat, effectMessage, m, { mentions: [target] });
};

useHandler.help = ['use'];
useHandler.tags = ['economy'];
useHandler.command = ['استخدام', 'use'];

export default useHandler;