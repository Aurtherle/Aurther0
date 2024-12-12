const petik = '```';
let confirmation = {};

async function handler(m, { conn, args, usedPrefix, command }) {
  if (confirmation[m.sender]) return m.reply('✳️ أنت تقوم بإجراء تحويل جاري بالفعل');

  let user = global.db.data.users[m.sender];
  if (!user) return m.reply('✳️ لا يمكن العثور على بيانات حسابك');

  // Initialize transfer log if it doesn't exist
  if (!user.transferLog) user.transferLog = [];

  // Clean up logs (keep only today's transfers)
  const today = new Date().setHours(0, 0, 0, 0);
  user.transferLog = user.transferLog.filter(log => log.date === today);

  // Check daily transfer limit
  if (user.transferLog.length >= 3) {
    return m.reply(`❎ لقد وصلت إلى الحد الأقصى للتحويلات اليوم (3 تحويلات)`);
  }

  let usage = `✳️ الاستخدام الصحيح للأمر 
*${usedPrefix + command}* [المبلغ] [@user]

📌 مثال: 
*${usedPrefix + command}* 1000 @${m.sender.split('@')[0]}
`.trim();

  // Validate amount
  const count = Math.min(Number.MAX_SAFE_INTEGER, Math.max(1, isNumber(args[0]) ? parseInt(args[0]) : 0));
  if (!count) return m.reply(usage);

  // Validate recipient
  let who = m.mentionedJid && m.mentionedJid[0]
    ? m.mentionedJid[0]
    : args[1]
      ? args[1].replace(/[@ .+-]/g, '') + '@s.whatsapp.net'
      : '';
  if (!who) return m.reply('✳️ ضع إشارة على المستخدم');
  if (!(who in global.db.data.users)) return m.reply(`✳️ المستخدم غير موجود في قاعدة البيانات`);
  if (user.credit < count) return m.reply(`✳️ رصيدك غير كافٍ لإجراء التحويل`);

  // Send confirmation message
  let confirmMsg = `
هل أنت متأكد أنك تريد تحويل *₹${count} بيلي* إلى *@${(who || '').replace(/@s\.whatsapp\.net/g, '')}*؟ 

- لديك *60 ثانية*
رد بـ ${petik}نعم${petik} أو ${petik}لا${petik}
`.trim();

  m.reply(confirmMsg, null, { mentions: [who] });

  // Save confirmation data
  confirmation[m.sender] = {
    sender: m.sender,
    to: who,
    amount: count,
    messageID: m.id, // Save message ID to avoid processing it again
    timeout: setTimeout(() => {
      delete confirmation[m.sender];
      m.reply('⏳ الوقت انتهى. تم إلغاء التحويل');
    }, 60 * 1000),
  };
}

handler.before = async m => {
  if (m.isBaileys || !(m.sender in confirmation)) return;

  let { timeout, sender, to, amount, messageID } = confirmation[m.sender];

  // Ignore messages that are not responses to the confirmation
  if (m.id === messageID || m.text === '') return;

  let user = global.db.data.users[sender];
  let recipient = global.db.data.users[to];

  if (/لا?/i.test(m.text)) {
    clearTimeout(timeout);
    delete confirmation[sender];
    return m.reply('✅ تم إلغاء التحويل');
  }

  if (/نعم?/i.test(m.text)) {
    if (!user || !recipient) return m.reply('❎ حدث خطأ، حاول مرة أخرى لاحقًا');
    if (user.credit < amount) {
      clearTimeout(timeout);
      delete confirmation[sender];
      return m.reply(`❎ لا تملك رصيدًا كافيًا لإجراء التحويل`);
    }

    // Process transfer
    user.credit -= amount;
    recipient.credit += amount;

    // Log the transfer
    const today = new Date().setHours(0, 0, 0, 0);
    user.transferLog.push({ to, amount, date: today });

    m.reply(
      `✅ تمت المعاملة بنجاح!\n\n*₹${amount} بيلي* تم تحويلها إلى @${(to || '').replace(/@s\.whatsapp\.net/g, '')}`,
      null,
      { mentions: [to] }
    );

    clearTimeout(timeout);
    delete confirmation[sender];
  }
};

handler.help = ['تحويل [المبلغ] [@tag]'];
handler.tags = ['economy'];
handler.command = ['تحويل'];

handler.disabled = false;

export default handler;

function isNumber(x) {
  return !isNaN(x);
}