let handler = async (m, { conn, text }) => {
  let who
  if (m.isGroup) who = m.mentionedJid[0]
  else who = m.chat
  if (!who) throw '✳️ قم بالإشارة إلى المستخدم'
  let txt = text.replace('@' + who.split`@`[0], '').trim()
  if (!txt) throw '✳️ أدخل كمية *البيلي* التي تريد إضافتها'
  if (isNaN(txt)) throw '🔢 الأرقام فقط'
  let dmt = parseInt(txt)
  let diamond = dmt

  if (diamond < 1) throw '✳️ الحد الأدنى هو *1*'
  let users = global.db.data.users
  users[who].credit += dmt

  await m.reply(`≡ *تمت إضافة البيلي*
┌──────────────
▢ *المجموع:* ${dmt}
└──────────────`)
  conn.fakeReply(m.chat, `▢ هل استلمت \n\n *+${dmt}* بيلي`, who, m.text)
}

handler.help = ['addgold <@user>']
handler.tags = ['economy']
handler.command = ['منح']
handler.rowner = true

export default handler
