const xpperbank = 1
let handler = async (m, { conn, command, args }) => {
  let count = command.replace(/^(ايداع)$/i, '')
  count = count
    ? /ايداع-الكل/i.test(count)
      ? Math.floor(global.db.data.users[m.sender].credit / xpperbank)
      : parseInt(count)
    : args[0]
      ? parseInt(args[0])
      : 1
  count = Math.max(1, count)
  if (global.db.data.users[m.sender].credit >= xpperbank * count) {
    global.db.data.users[m.sender].credit -= xpperbank * count
    global.db.data.users[m.sender].bank += count
    conn.reply(m.chat, `🪙 *لقد قمت بتحويل ${count} بيلي إلى البنك الخاص بك*`, m)
  } else
    conn.reply(
      m.chat,
      `🟥 *ليس لديك ما يكفي من البيلي في محفظتك لإجراء هذه المعاملة*`,
      m
    )
}
handler.help = ['deposit']
handler.tags = ['economy']
handler.command = ['ايداع', 'ايداع-الكل']

handler.disabled = false

export default handler
