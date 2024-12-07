let handler = async (m, { conn, text }) => {
  let room = Object.values(conn.game).find(
    room =>
      room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(m.sender)
  )
  if (room == undefined) return conn.reply(m.chat, `✳️ انت لست في لعبة 🎮 `, m)
  delete conn.game[room.id]
  await conn.reply(m.chat, `✅ تم خذف الغرفة 🎮*`, m)
}
handler.help = ['delttt']
handler.tags = ['game']
handler.command = ['delttc', 'لكس', 'delxo']

export default handler
