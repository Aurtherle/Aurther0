import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, args, command, text }) => {
  if (!text) throw `*تحتاج إلى إعطاء رابط فيديو، منشور، صورة أو ريل من تويتر*`
  m.reply(wait)

  let res
  try {
    res = await fetch(`https://api.guruapi.tech/xdown?url=${text}`)
  } catch (error) {
    throw `حدث خطأ: ${error.message}`
  }

  let api_response = await res.json()

  if (!api_response || !api_response.media) {
    throw `لم يتم العثور على فيديو أو صورة أو استجابة غير صالحة من API.`
  }

  const mediaArray = api_response.media

  for (const mediaData of mediaArray) {
    const mediaType = mediaData.type
    const mediaURL = mediaData.url

    let cap = `*تمت >,<*`

    if (mediaType === 'video') {
      conn.sendFile(m.chat, mediaURL, 'x.mp4', cap, m)
    } else if (mediaType === 'image') {
      conn.sendFile(m.chat, mediaURL, 'x.jpg', cap, m)
    }
  }
}

handler.help = ['Twitter']
handler.tags = ['downloader']
handler.command = /^(تويتر|تويت)$/i

export default handler