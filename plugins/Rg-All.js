import { createHash } from 'crypto';

// Helper function for delay
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let handler = async (m, { conn, text, quotedMessage }) => {
  // Get the correct user (who is registering)
  let who = m.quoted
    ? m.quoted.sender
    : m.mentionedJid && m.mentionedJid[0]
    ? m.mentionedJid[0]
    : m.fromMe
    ? conn.user.jid
    : m.sender;

  // Check if there's a quoted message with a user list
  if (!m.quoted || !m.quoted.text) throw '*يرجى الرد على الرسالة التي تحتوي على قائمة المستخدمين.*';

  let listText = m.quoted.text.trim();

  if (!listText) throw '*الرسالة المقتبسة لا تحتوي على قائمة المستخدمين.*';

  // Split the text into lines and filter those starting with "◍"
  let lines = listText.split('\n').map(line => line.trim()).filter(line => line.startsWith('◍'));

  if (lines.length === 0) throw '*لم يتم العثور على أي مستخدمين صالحين للتسجيل.*';

  for (let line of lines) {
    // Remove the "◍" symbol and extra spaces
    let cleanLine = line.replace('◍', '').trim();

    // Split the line into name and mention (mention is the last part)
    const parts = cleanLine.split(' ');
    let name = parts.slice(0, parts.length - 1).join(' '); // Everything except the mention part
    let mention = parts[parts.length - 1].replace('@', ''); // Remove @ symbol

    // Skip users marked with "⚠️"
    if (line.includes('⚠️')) {
      m.reply(`*${name}: تم تخطيه لأنه غير مسجل*`);
      continue;
    }

    // Ensure the user exists in the database
    if (!global.db.data.users[mention]) {
      global.db.data.users[mention] = {
        registered: false,
        name: null,
        regTime: null,
      };
    }

    let user = global.db.data.users[mention];

    // Check if the user is already registered
    if (user.registered) {
      m.reply(`*${name}: تم تسجيله بالفعل*`);
      continue;
    }

    // Check if the name is taken by any other user
    const isNameTaken = Object.values(global.db.data.users).some(existingUser => {
      if (typeof existingUser.name === 'string') {
        return existingUser.name.toLowerCase() === name.toLowerCase();
      }
      return false;
    });

    if (isNameTaken) {
      m.reply(`*${name}: الاسم مستخدم بالفعل*`);
      continue;
    }

    // Register the user
    user.name = name.trim();
    user.regTime = Date.now();
    user.registered = true;

    // Generate the unique ID (sn)
    let sn = createHash('md5').update(mention).digest('hex').slice(0, 21);

    // Send registration success message
    m.reply(`*❃ ──────⊰ ❀ ⊱────── ❃*\n◍ *تم تسجيلك في قاعدة البيانات*\n*❃ ──────⊰ ❀ ⊱────── ❃*\n◍ *الاسم:* *${name}*\n◍ *الايدي:* *${sn}*\n*❃ ──────⊰ ❀ ⊱────── ❃*`);

    // Wait before processing the next registration
    await sleep(200); // 200ms delay to avoid rate limits
  }
};

handler.help = ['bulkregister'].map(v => v + ' <قائمة المستخدمين>');
handler.tags = ['registration'];
handler.command = ['جماعي', 'bulkregister'];
handler.group = true;

export default handler;
