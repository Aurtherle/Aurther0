import { toAudio } from '../lib/converter.js'

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  /* let mime = (m.quoted ? m.quoted : m.msg).mimetype || ''
    if (!/video|audio/.test(mime)) throw `✳️ *رد على فيد*`*/
  let media = await q.download?.()
  if (!media) throw '❎ فشل في التحميل'
  let audio = await toAudio(media, 'mp4')
  if (!audio.data) throw '❎ حدث خطأ'
  conn.sendFile(m.chat, audio.data, 'audio.mp3', '', m, null, { mimetype: 'audio/mp4' })
}
handler.help = ['tomp3']
handler.tags = ['fun']
handler.command = /^لصوت$/i

export default handler
