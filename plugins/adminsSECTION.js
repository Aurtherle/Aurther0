import fs from 'fs'

let handler = async (m, { conn }) => {
    let menu = `
*❃ ────────⊰ ❀ ⊱──────── ❃*
                        *الـمـشـرفـيـن*
*❃ ────────⊰ ❀ ⊱──────── ❃* 

> *◍ منشن*
> *◍ مخفي*
> *◍ طرد*
> *◍ إضافة*
> *◍ ترقية*
> *◍ تخفيض*
> *◍ حذف*
> *◍ فتح جروب*
> *◍ قفل جروب*
> *◍ تغيير الصورة*
> *◍ لينك*
> *◍ مشرف*
> *◍ إنذار*
> *◍ حذف إنذار*
> *◍ لقب*
> *◍ تسجيل*
> *◍ إزالة*
> *◍ ألقاب*
> *◍ زيارة* 

*❃ ────────⊰ ❀ ⊱──────── ❃*`

    let videoPath = './Assets/aurther.mp4'
    let sendAsGif = Math.random() < 0.5  // 50% chance

    try {
        if (fs.existsSync(videoPath)) {
            let videoBuffer = fs.readFileSync(videoPath)
            
            await conn.sendMessage(m.chat, {
                video: videoBuffer,
                caption: menu,
                gifPlayback: sendAsGif
            }, { quoted: m })

            console.log('Video sent successfully')
        } else {
            throw new Error('Video file not found')
        }
    } catch (e) {
        console.error(e)
        conn.reply(m.chat, '❌ Failed to send video', m)
    }
}

handler.help = ['main']
handler.tags = ['group']
handler.command = /^(قسم-المشرفين)$/i 

export default handler
