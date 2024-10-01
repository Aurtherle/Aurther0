let ro = 3000
let handler = async (m, { conn, usedPrefix, command }) => {
  let time = global.db.data.users[m.sender].lastrob + 7200000
  if (new Date() - global.db.data.users[m.sender].lastrob < 7200000)
    throw `⏱️¡مرحباً! انتظر *${msToTime(time - new Date())}* لتسرق مرة أخرى`
  let who
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
  else who = m.chat
  if (!who) throw `✳️ منشن الي تبي تسرقة`
  if (!(who in global.db.data.users)) throw `✳️ المستخدم غير موجود في قاعدة بياناتي`
  let users = global.db.data.users[who]
  let rob = Math.floor(Math.random() * ro)
  if (users.exp < rob)
    return m.reply(
      `*مطفر شف غيره`,
      null,
      { mentions: [who] }
    )
  global.db.data.users[m.sender].exp += rob
  global.db.data.users[who].exp -= rob

  m.reply(
    `
  ‣ تمت سرقة *${rob} XP* من @${who.split`@`[0]}
  `,
    null,
    { mentions: [who] }
  )
  global.db.data.users[m.sender].lastrob = new Date() * 1
}

handler.help = ['rob']
handler.tags = ['economy']
handler.command = ['سرقة', 'rob']

export default handler

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds

  return hours + ' ساعة(s) ' + minutes + ' دقيقة(d)'
}
