let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  let fa = `🟥 *يرجى تحديد كمية الذهب التي تريد القتال بها*

*مثال:*
${usedPrefix + command} 1000`.trim()
  if (!args[0]) throw fa
  if (isNaN(args[0])) throw fa

  let users = global.db.data.users[m.sender]
  let credit = users.credit
  let amount =
    (args[0] && number(parseInt(args[0]))
      ? Math.max(parseInt(args[0]), 1)
      : /all/i.test(args[0])
        ? Math.floor(parseInt(users.credit))
        : 1) * 1

  let time = users.lastcf + 90000
  if (new Date() - users.lastcf < 90000)
    throw `يمكنك لعب قتال الدجاج مرة أخرى بعد ${msToTime(time - new Date())}`
  if (amount < 100) throw `🟥 *لا يمكنك القتال بأقل من 100 بيلي*`
  if (users.credit < amount)
    throw `🟥 *ليس لديك ما يكفي من البيلي لهذه للقتال.*\n*لديك حاليًا فقط ${credit} بيلي.*`
  if (users.chicken < 1) {
    throw `🟥 *ليس لديك أي دجاجة للقتال* \nاستخدم الأمر ${usedPrefix}buy-chicken`
  }

  let botScore = Math.ceil(Math.random() * 35) * 1 // Random score for the bot (1 to 35)
  let playerScore = Math.floor(Math.random() * 101) * 1 // Random score for the player (1 to 100)
  let status = `دجاجتك ماتت 🪦`

  if (botScore < playerScore) {
    users.credit += amount * 1
    status = `دجاجتك الصغيرة فازت بالقتال، وربحت لك 🪙 ${amount * 2} بيلي! 🐥`
  } else {
    users.credit -= amount * 1
    users.chicken -= 1
    users.lastcf = new Date() * 1
  }

  let result = `${status}
      `.trim()

  m.reply(result)
}

handler.help = ['cock-fight <amount>']
handler.tags = ['economy']
handler.command = ['قتال']

handler.group = true

export default handler

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

  hours = hours < 10 ? '' + hours : hours
  minutes = minutes < 10 ? '' + minutes : minutes
  seconds = seconds < 10 ? '' + seconds : seconds

  return minutes + ' دقيقة ' + seconds + ' ثانية'
}

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}

/**
 * Detect if that's a number
 * @param {Number} x
 * @returns Boolean
 */
function number(x = 0) {
  x = parseInt(x)
  return !isNaN(x) && typeof x == 'number'
}
