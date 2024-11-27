let handler = async (m, { conn }) => {
  let av = './Assets/mp3/Guru1.mp3'
  conn.sendFile(m.chat, av, 'audio.mp3', null, m, true, { type: 'audioMessage', ptt: true })
}

handler.customPrefix = /^(كريس)$/i
handler.command = new RegExp()

export default handler
