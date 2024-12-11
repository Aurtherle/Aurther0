let inventoryHandler = async (m, { conn, args }) => {
  const INVENTORY_ICON = '👜';
  const COUNT_ICON = '🔢';

  let user = global.db.data.users[m.sender];
  if (!user) {
    return conn.reply(m.chat, `❌ تعذر العثور على بيانات المستخدم.`, m);
  }

  if (!user.inventory || user.inventory.length === 0) {
    return conn.reply(
      m.chat,
      `${INVENTORY_ICON} *مخزونك فارغ!*\n\nاذهب إلى المتجر باستخدام \`.متجر\` لشراء عناصر.`,
      m
    );
  }

  let page = parseInt(args[0]) || 1;
  let itemsPerPage = 5;
  let totalPages = Math.ceil(user.inventory.length / itemsPerPage);
  if (page < 1 || page > totalPages) {
    return conn.reply(
      m.chat,
      `❌ رقم الصفحة غير صالح. اختر صفحة بين 1 و ${totalPages}.`,
      m
    );
  }

  let start = (page - 1) * itemsPerPage;
  let paginatedList = user.inventory.slice(start, start + itemsPerPage);

  let inventoryList = paginatedList
    .map((item) => `- *${item.name}*: ${item.count} ${COUNT_ICON}`)
    .join('\n');

  conn.reply(
    m.chat,
    `${INVENTORY_ICON} *مخزونك الحالي (صفحة ${page}/${totalPages})*\n\n${inventoryList}\n\nاستخدم \`.استخدام <عنصر> @user\` لاستخدام عنصر.`,
    m
  );
};

inventoryHandler.help = ['inventory'];
inventoryHandler.tags = ['economy'];
inventoryHandler.command = ['مخزون', 'عناصر'];

export default inventoryHandler;