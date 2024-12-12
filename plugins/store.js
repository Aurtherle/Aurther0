let storeHandler = async (m, { conn, args }) => {
  const storeItems = {
    لعنة: { price: 5000 },
    صمت: { price: 1500 },
    سيف: { price: 1000 },
    درع: { price: 800 },
    جرعة: { price: 500 },
  };

  if (!args[0]) {
    let storeList = Object.entries(storeItems)
      .map(([item, info]) => `- *${item}*: ${info.price} 🪙`)
      .join('\n');
    return conn.reply(
      m.chat,
      `🏪 *المتجر*\n\n${storeList}\n\nاستخدم \`.شراء <item>\` لشراء عنصر.`,
      m
    );
  }

  let itemName = args[0].trim().toLowerCase();
  let item = storeItems[itemName];
  if (!item) {
    return conn.reply(m.chat, `❌ العنصر "${args[0]}" غير موجود في المتجر.`, m);
  }

  let user = global.db.data.users[m.sender];
  if (user.credit < item.price) {
    return conn.reply(
      m.chat,
      `❌ لا تملك ما يكفي من الذهب لشراء *${args[0]}* (السعر: ${item.price} 🪙).`,
      m
    );
  }

  user.credit -= item.price;

  if (!user.inventory) user.inventory = [];
  let inventoryItem = user.inventory.find((i) => i.name === itemName);
  if (inventoryItem) {
    inventoryItem.count += 1;
  } else {
    user.inventory.push({ name: itemName, count: 1 });
  }

  conn.reply(
    m.chat,
    `✅ اشتريت *${itemName}* مقابل ${item.price} 🪙.\n👜 تحقق من مخزونك باستخدام \`.مخزون\`.`,
    m
  );
};

storeHandler.help = ['buy'];
storeHandler.tags = ['economy'];
storeHandler.command = ['شراء', 'متجر'];

export default storeHandler;