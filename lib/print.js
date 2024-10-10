import chalk from 'chalk'
import { watchFile } from 'fs'

const terminalImage = global.opts['img'] ? require('terminal-image') : ''
const urlRegex = (await import('url-regex-safe')).default({ strict: false })

const log = (text, error = false) =>
  console.log(
    chalk[error ? 'red' : 'blue']('[GURU BOT]'),
    chalk[error ? 'red' : 'green'](chalk.dim(text)) // Apply dim for a lighter effect
  )

export default async function (m, conn = { user: {} }) {
  let senderName = await conn.getName(m.sender)

  let chatName = ''
  if (m.chat && m.chat !== m.sender) {
    if (!m.chat.endsWith('@g.us')) {
      chatName = 'Private'
    } else {
      chatName = await conn.getName(m.chat)
      chatName = chatName ? `${chatName} ` : ''
    }
  } else {
    chatName = 'Private'
  }

  if (m.isCommand) {
    let commandText = m.text.split(' ')[0]
    const cmdtxt = chalk.dim.cyan('Command')
    const cmd = chalk.dim.yellow(`${commandText}`)
    const from = chalk.dim.green('from')
    const username = chalk.dim.yellow(`${senderName}`)
    const ins = chalk.dim.green('in')
    const grp = chalk.dim.blue(chatName)
    log(`${cmdtxt} ${cmd} ${from} ${username} ${ins} ${grp}`)
  } else {
    const msg = chalk.dim.cyan('Message')
    const from = chalk.dim.green('from')
    const username = chalk.dim.yellow(`${senderName}`)
    const ins = chalk.dim.green('in')
    const grp = chalk.dim.blue(chatName)
    log(`${msg} ${from} ${username} ${ins} ${grp}`)
  }
}

let file = global.__filename(import.meta.url)
watchFile(file, () => {
  log(chalk.red("Update 'lib/print.js'"), false)
})
