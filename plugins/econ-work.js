import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command }) => {
  // Random earning amount for credit and exp
  let earn = Math.floor(Math.random() * 2000)
  let expGain = Math.floor(Math.random() * 100) // Example exp range
  let cooldown = 600000 // 10 minutes cooldown

  // Fetch user data
  let user = global.db.data.users[m.sender]
  let remainingTime = user.lastwork + cooldown - new Date().getTime()

  // Cooldown check
  if (remainingTime > 0) {
    throw `⏱️ لا يمكنك العمل لمدة ${msToTime(remainingTime)}`
  }

  try {
    // Fetch random work data
    let anu = (await axios.get('https://raw.githubusercontent.com/Aurtherle/Games/refs/heads/main/.github/Games/Gg')).data
    let res = pickRandom(anu)

    // Default fallback if work description is undefined
    if (!res || !res.wrk) {
      res = { wrk: "لقد قمت بعمل عشوائي" }
    }

    // Update user credit and experience
    user.credit = (user.credit || 0) + earn
    user.exp = (user.exp || 0) + expGain
    user.lastwork = new Date().getTime()

    // Reply to user
    m.reply(`
‣ ${res.wrk} ${earn} خبرة
‣ لقد اكتسبت ${expGain} نقطة خبرة.
    `)
  } catch (error) {
    console.error(error)
    throw "حدث خطأ أثناء جلب البيانات. حاول مرة أخرى لاحقًا."
  }
}

handler.help = ['work']
handler.tags = ['economy']
handler.command = ['عمل', 'w']
handler.group = true

// Function to format remaining time
function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60)
  let minutes = Math.floor((duration / (1000 * 60)) % 60)
  return `${minutes} دقيقة ${seconds} ثانية`
}

// Function to pick random item
function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}

export default handler
