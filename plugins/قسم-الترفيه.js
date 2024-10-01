import fs from 'fs'

let handler = async (m, { conn }) => {
    let menu = `
*❃ ────────⊰ ❀ ⊱──────── ❃*
                          *الـتـرفـيـه*
*❃ ────────⊰ ❀ ⊱──────── ❃* 

> *◍ اكس او*
> *◍ تحدي*
> *◍ لعبة*
> *◍ صراحه*
> *◍ بوت*
> *◍ باتشيرا*
> *◍ دحيح*
> *◍ قتل*
> *◍ فزوره*
> *◍ تطقيم*
> *◍ ايدت*
> *◍ عمري*
> *◍ موت*
> *◍ وفاتي*
> *◍ الغموض*
> *◍ ألغام*
> *◍ تف*
> *◍ لاعب*
> *◍ علم*
> *◍ اسئلني*
> *◍ رياضه*
> *◍ سيلفي*
> *◍ خمن*
> *◍ كت*
> *◍ شخصيه*
> *◍ فيك*
> *◍ ميمز*
> *◍ اختبرني*
> *◍ خروف*
> *◍ شش*
> *◍ صوت_ش*
> *◍ حرب*
> *◍ اتحداك*
> *◍ عين*
> *◍ قلب*
> *◍ تهكير*
> *◍ لو*
> *◍ ايموجي*
> *◍ صداقه*
> *◍ بيحبني*
> *◍ بيكرهني*
> *◍ حب*
> *◍ حساب*
> *◍ هل*
> *◍ ترت*
> *◍ ترجم*
> *◍ اقتباس*
> *◍ زواج*
> *◍ انطق*
> *◍ رونالدو*
> *◍ ميسي*
> *◍ تاج*
> *◍ حكمه*
> *◍ سؤال*
> *◍ متفجرات*
> *◍ غزة*

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
handler.command = /^(قسم-الترفيه)$/i 

export default handler
