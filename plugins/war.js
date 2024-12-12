let pendingGames = {}; // Object to keep track of pending games

// Game handler
let handler = async (m, { conn, args }) => {
  let user = m.sender;
  let target = m.mentionedJid && m.mentionedJid[0];

  if (!target) {
    return conn.reply(m.chat, `❓ الاستخدام: \`!حرب @user <مبلغ>\``, m);
  }

  let bet = parseInt(args[1]);
  if (isNaN(bet) || bet <= 0) {
    return conn.reply(
      m.chat,
      `❌ يجب إدخال مبلغ صالح للقتال. مثال: \`.حرب @user 5000\``,
      m
    );
  }

  // Ensure both users have enough credits
  const player1Data = global.db.data.users[user];
  const player2Data = global.db.data.users[target];

  if (!player1Data || player1Data.credit < bet) {
    return conn.reply(
      m.chat,
      `❌ ليس لديك رصيد كافٍ (${bet} مطلوب). رصيدك الحالي: ${player1Data ? player1Data.credit : 0}.`,
      m
    );
  }

  if (!player2Data || player2Data.credit < bet) {
    return conn.reply(
      m.chat,
      `❌ لا يمتلك ${player2Data ? player2Data.name : "اللاعب"} رصيدًا كافياً (${bet} مطلوب).`,
      m
    );
  }

  // Ensure both players have swords
  const player1Inventory = getInventory(user);
  const player2Inventory = getInventory(target);

  if (!player1Inventory['سيف'] || !player2Inventory['سيف']) {
    return conn.reply(
      m.chat,
      `⚠️ يجب أن يمتلك كلا اللاعبين سيوفًا لبدء المعركة.\nقم بشراء سيف من المتجر باستخدام \`!شراء سيف\`.`,
      m
    );
  }

  pendingGames[user] = {
    opponent: target,
    chat: m.chat,
    bet,
  };

  conn.reply(
    m.chat,
    `⚔️ *${player2Data.name}*، هل تقبل تحدي الحرب من *${player1Data.name}* بمبلغ ${bet}؟\n\n✅ اكتب "نعم" لقبول التحدي\n❌ اكتب "لا" لرفض التحدي`,
    m,
    { mentions: [user, target] }
  );
};

// Handle responses
handler.all = async function (m) {
  let user = m.sender;
  let message = m.text.trim().toLowerCase();

  // Find the pending game for the user
  let pendingGame = Object.values(pendingGames).find(
    (game) => game.opponent === user
  );

  if (!pendingGame) return;

  let initiator = Object.keys(pendingGames).find(
    (key) => pendingGames[key].opponent === user
  );

  if (!initiator) return;

  let chat = pendingGame.chat;

  if (message === 'نعم') {
    const { bet } = pendingGame;
    const player1Data = global.db.data.users[initiator];
    const player2Data = global.db.data.users[user];

    // Deduct credits from both players
    player1Data.credit -= bet;
    player2Data.credit -= bet;

    delete pendingGames[initiator];

    conn.reply(
      chat,
      `🎮 *${player2Data.name}* قبل التحدي بمبلغ ${bet}! المعركة تبدأ قريبًا...`,
      null,
      { mentions: [initiator, user] }
    );

    // Start the war after approval
    startWar(chat, initiator, user, conn, m, bet);
  } else if (message === 'لا') {
    delete pendingGames[initiator];

    conn.reply(
      chat,
      `❌ *${global.db.data.users[user].name}* رفض التحدي.`,
      null,
      { mentions: [initiator, user] }
    );
  }
};

// War function
async function startWar(chat, player1, player2, conn, m, bet) {
  let player1Inventory = getInventory(player1);
  let player2Inventory = getInventory(player2);

  let player1Health = 100;
  let player2Health = 100;

  let round = 1;

  const player1Data = global.db.data.users[player1];
  const player2Data = global.db.data.users[player2];

  // Create the initial message
  const initialMessage = await conn.reply(
    chat,
    `⚔️ *المعركة تبدأ!*\n\nجاري تحميل الجولة الأولى...`,
    m
  );

  const updateMessage = async (newText) => {
    await conn.relayMessage(
      chat,
      {
        protocolMessage: {
          key: initialMessage.key,
          type: 14,
          editedMessage: {
            conversation: newText,
          },
        },
      },
      {}
    );
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  while (player1Health > 0 && player2Health > 0) {
    await delay(2000);

    // Attack logic
    let player1Damage = Math.floor(Math.random() * 20) + 10;
    let player2Damage = Math.floor(Math.random() * 20) + 10;

    // Sword bonus (سيف)
    player1Damage += 10;
    player2Damage += 10;

    // Shield usage (درع)
    if (player2Inventory['درع'] > 0) {
      player1Damage -= 10;
      player2Inventory['درع'] -= 1; // Consume the shield
    }
    if (player1Inventory['درع'] > 0) {
      player2Damage -= 10;
      player1Inventory['درع'] -= 1; // Consume the shield
    }

    // Potion usage (جرعة)
    if (player1Health <= 50 && player1Inventory['جرعة'] > 0) {
      player1Health += 20;
      player1Inventory['جرعة'] -= 1; // Consume a potion
    }

    if (player2Health <= 50 && player2Inventory['جرعة'] > 0) {
      player2Health += 20;
      player2Inventory['جرعة'] -= 1; // Consume a potion
    }

    // Update inventories
    saveInventory(player1, player1Inventory);
    saveInventory(player2, player2Inventory);

    player2Health -= Math.max(0, player1Damage);
    player1Health -= Math.max(0, player2Damage);

    // Consolidated round message
    let roundMessage = `⚔️ *جولة ${round}:*\n\n🎮 *${player1Data.name}*: ${player1Health} صحة\n🛡️ دروع: ${player1Inventory['درع']}\n🧪 جرعات: ${player1Inventory['جرعة']}\n\n🎮 *${player2Data.name}*: ${player2Health} صحة\n🛡️ دروع: ${player2Inventory['درع']}\n🧪 جرعات: ${player2Inventory['جرعة']}\n\n🗡️ *${player1Data.name}* ألحق بـ *${player2Data.name}* ${Math.max(
      0,
      player1Damage
    )} ضررًا.\n🗡️ *${player2Data.name}* ألحق بـ *${player1Data.name}* ${Math.max(
      0,
      player2Damage
    )} ضررًا.`;

    await updateMessage(roundMessage);
    round++;
  }

  await delay(2000);

  let winner = player1Health > 0 ? player1 : player2;
  let loser = player1Health > 0 ? player2 : player1;

  // Reward the winner
  global.db.data.users[winner].credit += bet * 2;

  conn.reply(
    chat,
    `🏆 *المعركة انتهت!*\n\n🥇 *الفائز*: ${global.db.data.users[winner].name} (+${bet * 2} 💰)\n💀 *الخاسر*: ${global.db.data.users[loser].name}`,
    null,
    { mentions: [winner, loser] }
  );
}

// Inventory management functions
function getInventory(player) {
  let user = global.db.data.users[player];
  if (!user || !user.inventory) {
    return { 'سيف': 0, 'درع': 0, 'جرعة': 0 };
  }
  return user.inventory.reduce((acc, item) => {
    acc[item.name] = item.count;
    return acc;
  }, {});
}

function saveInventory(player, inventory) {
  let user = global.db.data.users[player];
  if (!user || !user.inventory) return;
  user.inventory = Object.keys(inventory).map((name) => ({
    name,
    count: inventory[name],
  }));
}

handler.help = ['حرب'];
handler.tags = ['game'];
handler.command = ['حرب'];

export default handler;