const xppercredit = 1
let handler = async (m, { conn, command, args }) => {
  let count = command.replace(/^(سحب)/i, '')
  count = count
    ? /-الكل/i.test(count)
      ? Math.floor(global.db.data.users[m.sender].bank / xppercredit)
      : parseInt(count)
    : args[0]
      ? parseInt(args[0])
      : 1
  count = Math.max(1, count)
  if (global.db.data.users[m.sender].bank >= xppercredit * count) {
    global.db.data.users[m.sender].bank -= xppercredit * count
    global.db.data.users[m.sender].credit += count
    conn.reply(m.chat, `تم نقل 🪙 ${count} بيلي إلى محفظتك`, m)
  } else
    conn.reply(
      m.chat,
      `🟥 *ليس لديك ما يكفي من الذهب في البنك لإجراء هذه المعاملة*`,
      m
    )
}
handler.help = ['withdraw']
handler.tags = ['economy']
handler.command = ['سحب', 'with', 'withdrawall', 'سحب-الكل', 'wt', 'wtall']

handler.disabled = false

export default handler
