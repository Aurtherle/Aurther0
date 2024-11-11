import fs from 'fs'
import path from 'path'

const _fs = fs.promises

let handler = async (m, { text, usedPrefix, command, __dirname }) => {
  if (!text) {
    throw `
✳️ user  : ${usedPrefix + command} <name file> <new code>

📌 Example:
        ${usedPrefix}paste main.js
        // New code content here...
    `.trim()
  }

  const args = text.split('\n')
  const filename = args[0]
  const newCode = args.slice(1).join('\n')

  if (!filename || !newCode) {
    throw 'Please provide both a file name and new code content.'
  }

  // Make sure the file is in the 'plugins' directory
  const pathFile = path.join(__dirname, 'plugins', filename)
  
  try {
    // Write the new code into the file inside the 'plugins' folder
    await _fs.writeFile(pathFile, newCode, 'utf8')
    await m.reply(`✅ The plugin file *${filename}* has been updated with the new code.`)
  } catch (err) {
    await m.reply(`❎ Failed to update the plugin file *${filename}*.\nError: ${err.message}`)
  }
}

handler.help = ['paste <name file> <new code>']
handler.tags = ['owner']
handler.command = /^p(aste)?$/i

handler.rowner = true

export default handler
