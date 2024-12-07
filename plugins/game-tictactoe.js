import TicTacToe from '../lib/tictactoe.js'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  conn.game = conn.game ? conn.game : {}
  if (
    Object.values(conn.game).find(
      room =>
        room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(m.sender)
    )
  )
    throw `✳️ أنت بالفعل في لعبة. لإنهاء الجلسة اكتب: *${usedPrefix}لكس*`
  if (!text) throw `✳️ الرجاء وضع رقم الغرفة`
  let room = Object.values(conn.game).find(
    room => room.state === 'WAITING' && (text ? room.name === text : true)
  )
  // m.reply('[WIP Feature]')
  if (room) {
    m.reply('✅ تم العثور على شريك')
    room.o = m.chat
    room.game.playerO = m.sender
    room.state = 'PLAYING'
    let arr = room.game.render().map(v => {
      return {
        X: '❎',
        O: '⭕',
        1: '1️⃣',
        2: '2️⃣',
        3: '3️⃣',
        4: '4️⃣',
        5: '5️⃣',
        6: '6️⃣',
        7: '7️⃣',
        8: '8️⃣',
        9: '9️⃣',
      }[v]
    })
    let str = `
📢 الدور الآن على اللاعب @${room.game.currentTurn.split('@')[0]}
        
${arr.slice(0, 3).join('')}
${arr.slice(3, 6).join('')}
${arr.slice(6).join('')}

▢ *رقم الغرفة* ${room.id}

▢ *القواعد*
‣ قم بترتيب 3 رموز عمودياً، أفقيًا أو قطريًا للفوز. ‣ اكتب *استسلام* للخروج من اللعبة وإعلان الهزيمة.
`.trim()
    if (room.x !== room.o)
      await conn.reply(room.x, str, m, {
        mentions: conn.parseMention(str),
      })
    await conn.reply(room.o, str, m, {
      mentions: conn.parseMention(str),
    })
  } else {
    room = {
      id: 'tictactoe-' + +new Date(),
      x: m.chat,
      o: '',
      game: new TicTacToe(m.sender, 'o'),
      state: 'WAITING',
    }
    if (text) room.name = text

    conn.reply(
      m.chat,
      `⏳ *انتظار شريك*\nاكتب الأمر التالي للانضمام:\n▢ *${usedPrefix + command} ${text}*

🎁 الجائزة: *4999 نقطة خبرة*`,
      m,
      {
        mentions: conn.parseMention(text),
      }
    )

    conn.game[room.id] = room
  }
}

handler.help = ['tictactoe <رقم الغرفة>']
handler.tags = ['game']
handler.command = ['tictactoe', 'اكس', 'ttt', 'xo']

export default handler