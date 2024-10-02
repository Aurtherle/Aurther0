import fs from 'fs'

let handler = async (m, { conn }) => {
    let menu = `
*❃ ────────⊰ ❀ ⊱──────── ❃*
                               *آرثر*
*❃ ────────⊰ ❀ ⊱──────── ❃* 

> *◍ ضيف_بريميام*
> *◍ حذف_بريميام*
> *◍ بان*
> *◍ بان_فك*
> *◍ بان_شات*
> *◍ بان_شات_فك*
> *◍ حطها*
> *◍ ايقاف*
> *◍ اشغيل*
> *◍ المبندين*
> *◍ إعادة*
> *◍ اعادةتشغيل*
> *◍ ادخل*
> *◍ اخرج*
> *◍ ضيف_اكس_بي*
> *◍ ضيف_جواهر*
> *◍ ارثر-عرض*
> *◍ ارثر-تعديل*
> *◍ ارثر-اضافه*
> *◍ ارثر-حذف*
> *◍ ارثر-الكل* 

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
handler.command = /^(قسم-المطور)$/i 

export default handler
