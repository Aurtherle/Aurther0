import { createHash } from 'crypto'
import PhoneNumber from 'awesome-phonenumber'
import { canLevelUp, xpRange } from '../lib/levelling.js'
import fs from 'fs'
import moment from 'moment-timezone'
import { promises } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)

const { levelling } = '../lib/levelling.js'
let handler = async (m, { conn, usedPrefix, command }) => {
    let d = new Date(new Date() + 3600000)
    let locale = 'en'
    let week = d.toLocaleDateString(locale, { weekday: 'long' })
    let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    if (!(who in global.db.data.users)) throw `✳️ The user is not found in my database`

    let videoPath = './Assets/aurther.mp4'  // Path to your local video
    let gifPath = './Assets/aurther_temporary.gif'  // Temporary GIF path
    let user = global.db.data.users[who]
    let { name, exp, diamond, lastclaim, registered, regTime, age, level, role, warn } = global.db.data.users[who]
    let { min, xp, max } = xpRange(user.level, global.multiplier)
    let username = conn.getName(who)
    let math = max - xp
    let prem = global.prems.includes(who.split`@`[0])
    let sn = createHash('md5').update(who).digest('hex')
    let totaluser = Object.values(global.db.data.users).length
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length
    let more = String.fromCharCode(8206)
    let readMore = more.repeat(850)
    let greeting = ucapan()

let taguser = '@' + m.sender.split("@s.whatsapp.net")[0]
let str = `
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

*❃ ────────⊰ ❀ ⊱──────── ❃*
                      *الحياة الافتراضية*
*❃ ────────⊰ ❀ ⊱──────── ❃* 

> *◍ محفظة*
> *◍ بنك*
> *◍ إيداع*
> *◍ سحب*
> *◍ تسوق*
> *◍ يومي*
> *◍ رانك*
> *◍ بروفايل*
> *◍ سرقة*
> *◍ تحويل*
> *◍ منح*
> *◍ دجاج*
> *◍ قتال*
> *◍ شراء* 

*❃ ────────⊰ ❀ ⊱──────── ❃*
                         *الـتـحـمـيـل*
*❃ ────────⊰ ❀ ⊱──────── ❃* 

> *◍ انستغرام*
> *◍ انستا*
> *◍ خلفيات*
> *◍ تيكتوك*
> *◍ تيك*
> *◍ شغل*
> *◍ تيكتوك*
> *◍ تويتر*
> *◍ مانهو*
> *◍ انمي*
> *◍ اغنيه*
> *◍ بحث*
> *◍ فيديو*
> *◍ تطبيق*
> *◍ صوره*

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

*❃ ────────⊰ ❀ ⊱──────── ❃*
                         *الـتـحـويـل*
*❃ ────────⊰ ❀ ⊱──────── ❃* 

> *◍ ملصق*
> *◍ تخيل*
> *◍ اتتب*
> *◍ التعرف*
> *◍ صورهai*
> *◍ مطلوب*
> *◍ رابطي*
> *◍ كلمات-اغنيه*
> *◍ جوده*
> *◍ سرقة*
> *◍ تصميم*
> *◍ لوجو-ناروتو*
> *◍ لفيديو*
> *◍ لصورة*
> *◍ لانمي*
> *◍ تخيل*
> *◍ مكس*
> *◍ لجواهر*
> *◍ ستك*
> *◍ تليجراف*
> *◍ لكرتون*
> *◍ باركود*

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

*❃ ────────⊰ ❀ ⊱──────── ❃*
                          *الألــقــاب*
*❃ ────────⊰ ❀ ⊱──────── ❃* 

> *◍ القاب*
*❃ ⌘¦ قائمة بجميع الألقاب ❃* 
> *◍ تسجيل*
*❃ ⌘¦ منشن عضو لتسجيله ❃*
> *◍ تصفيه*
*❃ ⌘¦ حذف جميع الألقاب ❃*
> *◍ لقبي*
*❃ ⌘¦ لمعرفة لقبك ❃* 
> *◍ لقبه*
*❃ ⌘¦ معرفة لقب العضو الذي تم منشنته ❃* 
> *◍ لقب*
*❃ ⌘¦ بحث عن اللقب وتوفره ❃*
> *◍ حذف*
*❃ ⌘¦ حذف اللقب المسجل ❃*  

*❃ ────────⊰ ❀ ⊱──────── ❃*`


  // Randomly choose between sending as GIF or video
    const sendAsGif = Math.random() < 0.5  // 50% chance

    try {
        if (fs.existsSync(videoPath)) {
            let videoBuffer = fs.readFileSync(videoPath)
            
            // Send the video with or without GIF playback
            await conn.sendMessage(m.chat, {
                video: videoBuffer,
                caption: str,
                gifPlayback: sendAsGif  // Set to true or false randomly
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
handler.command = /^(كل-الاوامر)$/i 

export default handler
function clockString(ms) {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')}

    function ucapan() {
      const time = moment.tz('Asia/Kolkata').format('HH')
      let res = "happy early in the day☀️"
      if (time >= 4) {
        res = "صباح الخير 🌄"
      }
      if (time >= 10) {
        res = "قرب الظهر ☀️"
      }
      if (time >= 15) {
        res = "Good Afternoon 🌇"
      }
      if (time >= 18) {
        res = "Good Night 🌙"
      }
      return res
    }
  