//import db from '../lib/database.js'

let handler = async (m, { conn, text }) => {
  let who
  if (m.isGroup) who = m.mentionedJid[0]
  else who = m.chat
  if (!who) throw '✳️ قم بالإشارة إلى المستخدم'
  let txt = text.replace('@' + who.split`@`[0], '').trim()
  if (!txt) throw '✳️ أدخل كمية *XP* التي تريد إضافتها'
  if (isNaN(txt)) throw '🔢 الأرقام فقط'
  let xp = parseInt(txt)
  let exp = xp

  if (exp < 1) throw '✳️ الحد الأدنى هو *1*'
  let users = global.db.data.users
  users[who].exp += xp

  await m.reply(`≡ *تمت إضافة XP*
┌──────────────
▢  *المجموع:* ${xp}
└──────────────`)
  conn.fakeReply(m.chat, `▢ هل استلمت \n\n *+${xp} XP*`, who, m.text)
}

handler.help = ['addxp <@user>']
handler.tags = ['economy']
handler.command = ['addxp']
handler.rowner = true

export default handler
