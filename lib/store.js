import { readFileSync, writeFileSync, existsSync } from 'fs'

/**
 * @type {import('@whiskeysockets/baileys')}
 */
const { initAuthCreds, BufferJSON, proto } = (await import('@whiskeysockets/baileys')).default

/**
 * Bind events and enhance the connection object with state management
 * @param {import('@whiskeysockets/baileys').WASocket | import('@whiskeysockets/baileys').WALegacySocket} conn
 */
function bind(conn) {
  if (!conn.chats) conn.chats = {}

  /**
   * Update contacts or group metadata to `conn.chats`
   * @param {import('@whiskeysockets/baileys').Contact[]|{contacts:import('@whiskeysockets/baileys').Contact[]}} contacts
   */
  function updateNameToDb(contacts) {
    if (!contacts) return
    try {
      contacts = contacts.contacts || contacts
      for (const contact of contacts) {
        const id = conn.decodeJid(contact.id)
        if (!id || id === 'status@broadcast') continue
        let chats = conn.chats[id]
        if (!chats) chats = conn.chats[id] = { ...contact, id }
        conn.chats[id] = {
          ...chats,
          ...({
            ...contact,
            id,
            ...(id.endsWith('@g.us')
              ? { subject: contact.subject || contact.name || chats.subject || '' }
              : { name: contact.notify || contact.name || chats.name || chats.notify || '' }),
          }),
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  conn.ev.on('contacts.upsert', updateNameToDb)
  conn.ev.on('groups.update', updateNameToDb)
  conn.ev.on('contacts.set', updateNameToDb)

  conn.ev.on('chats.set', async ({ chats }) => {
    try {
      for (let { id, name, readOnly } of chats) {
        id = conn.decodeJid(id)
        if (!id || id === 'status@broadcast') continue
        const isGroup = id.endsWith('@g.us')
        let chat = conn.chats[id]
        if (!chat) chat = conn.chats[id] = { id }
        chat.isChats = !readOnly
        if (name) chat[isGroup ? 'subject' : 'name'] = name
        if (isGroup) {
          const metadata = await conn.groupMetadata(id).catch(() => null)
          if (name || metadata?.subject) chat.subject = name || metadata.subject
          if (!metadata) continue
          chat.metadata = metadata
        }
      }
    } catch (e) {
      console.error(e)
    }
  })

  conn.ev.on('group-participants.update', async ({ id, participants, action }) => {
    try {
      id = conn.decodeJid(id)
      if (!id || id === 'status@broadcast') return
      if (!(id in conn.chats)) conn.chats[id] = { id }
      let chat = conn.chats[id]
      chat.isChats = true
      const groupMetadata = await conn.groupMetadata(id).catch(() => null)
      if (!groupMetadata) return
      chat.subject = groupMetadata.subject
      chat.metadata = groupMetadata
    } catch (e) {
      console.error(e)
    }
  })

  conn.ev.on('chats.upsert', ({ id, name }) => {
    try {
      if (!id || id === 'status@broadcast') return
      conn.chats[id] = { ...(conn.chats[id] || {}), id, name, isChats: true }
    } catch (e) {
      console.error(e)
    }
  })

  conn.ev.on('presence.update', async ({ id, presences }) => {
    try {
      const sender = Object.keys(presences)[0] || id
      const decodedSender = conn.decodeJid(sender)
      const presence = presences[sender]?.lastKnownPresence || 'composing'
      let chat = conn.chats[decodedSender]
      if (!chat) chat = conn.chats[decodedSender] = { id: sender }
      chat.presences = presence
      if (id.endsWith('@g.us')) {
        let groupChat = conn.chats[id]
        if (!groupChat) groupChat = conn.chats[id] = { id }
      }
    } catch (e) {
      console.error(e)
    }
  })

  // Cleanup inactive or unused chats
  setInterval(() => {
    const now = Date.now()
    for (const id in conn.chats) {
      const chat = conn.chats[id]
      if (!chat.isChats && now - (chat.lastActive || 0) > 86400000) {
        delete conn.chats[id] // Remove chats inactive for more than 24 hours
      }
    }
  }, 3600000) // Run every hour
}

const KEY_MAP = {
  'pre-key': 'preKeys',
  session: 'sessions',
  'sender-key': 'senderKeys',
  'app-state-sync-key': 'appStateSyncKeys',
  'app-state-sync-version': 'appStateVersions',
  'sender-key-memory': 'senderKeyMemory',
}

/**
 * Manage authentication state in a single file
 * @param {String} filename
 * @param {import('pino').Logger} logger
 */
function useSingleFileAuthState(filename, logger) {
  let creds, keys = {}, saveCount = 0

  // Save state to file
  const saveState = (forceSave = false) => {
    if (forceSave || saveCount >= 10) {
      writeFileSync(filename, JSON.stringify({ creds, keys }, BufferJSON.replacer, 2))
      saveCount = 0
    }
  }

  // Load state from file if it exists
  if (existsSync(filename)) {
    const data = JSON.parse(readFileSync(filename, { encoding: 'utf-8' }), BufferJSON.reviver)
    creds = data.creds
    keys = data.keys
  } else {
    creds = initAuthCreds()
    keys = {}
  }

  return {
    state: {
      creds,
      keys: {
        get: (type, ids) => {
          const key = KEY_MAP[type]
          return ids.reduce((result, id) => {
            const value = keys[key]?.[id]
            if (value) result[id] = value
            return result
          }, {})
        },
        set: (data) => {
          for (const type in data) {
            const key = KEY_MAP[type]
            keys[key] = { ...keys[key], ...data[type] }
          }
          saveCount++
          saveState()
        },
      },
    },
    saveState: () => saveState(true),
  }
}

export default {
  bind,
  useSingleFileAuthState,
}