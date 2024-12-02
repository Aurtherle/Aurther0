import { readFileSync, writeFileSync, existsSync } from 'fs'

/**
 * @type {import('@whiskeysockets/baileys')}
 */
const { initAuthCreds, BufferJSON, proto } = (await import('@whiskeysockets/baileys')).default

/**
 * @param {import('@whiskeysockets/baileys').WASocket | import('@whiskeysockets/baileys').WALegacySocket}
 */
function bind(conn) {
  if (!conn.chats) conn.chats = {}

  /**
   * @param {import('@whiskeysockets/baileys').Contact[]|{contacts:import('@whiskeysockets/baileys').Contact[]}} contacts
   * @returns
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
          } || {}),
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const throttledUpdateName = debounce(updateNameToDb, 1000);  // Debounce to limit how often it runs

  conn.ev.on('contacts.upsert', throttledUpdateName)
  conn.ev.on('groups.update', throttledUpdateName)
  conn.ev.on('contacts.set', throttledUpdateName)
  
  // Debounce for chats update as well
  const throttledChatsUpdate = debounce(async ({ chats }) => {
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
          const metadata = await conn.groupMetadata(id).catch(_ => null)
          if (name || metadata?.subject) chat.subject = name || metadata.subject
          if (!metadata) continue
          chat.metadata = metadata
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, 1000); // Added debounce to chat updates

  conn.ev.on('chats.set', throttledChatsUpdate)
  
  conn.ev.on('group-participants.update', async function updateParticipantsToDb({ id, participants, action }) {
    if (!id) return
    id = conn.decodeJid(id)
    if (id === 'status@broadcast') return
    if (!(id in conn.chats)) conn.chats[id] = { id }
    let chat = conn.chats[id]
    chat.isChats = true
    const groupMetadata = await conn.groupMetadata(id).catch(_ => null)
    if (!groupMetadata) return
    chat.subject = groupMetadata.subject
    chat.metadata = groupMetadata
  })

  conn.ev.on('groups.update', async function groupUpdatePushToDb(groupsUpdates) {
    try {
      for (const update of groupsUpdates) {
        const id = conn.decodeJid(update.id)
        if (!id || id === 'status@broadcast') continue
        const isGroup = id.endsWith('@g.us')
        if (!isGroup) continue
        let chat = conn.chats[id]
        if (!chat) chat = conn.chats[id] = { id }
        chat.isChats = true
        const metadata = await conn.groupMetadata(id).catch(_ => null)
        if (metadata) chat.metadata = metadata
        if (update.subject || metadata?.subject) chat.subject = update.subject || metadata.subject
      }
    } catch (e) {
      console.error(e)
    }
  })

  conn.ev.on('chats.upsert', function chatsUpsertPushToDb(chatsUpsert) {
    try {
      const { id, name } = chatsUpsert
      if (!id || id === 'status@broadcast') return
      conn.chats[id] = { ...(conn.chats[id] || {}), ...chatsUpsert, isChats: true }
      const isGroup = id.endsWith('@g.us')
      if (isGroup) conn.insertAllGroup().catch(_ => null)
    } catch (e) {
      console.error(e)
    }
  })

  conn.ev.on('presence.update', async function presenceUpdatePushToDb({ id, presences }) {
    try {
      const sender = Object.keys(presences)[0] || id
      const _sender = conn.decodeJid(sender)
      const presence = presences[sender]['lastKnownPresence'] || 'composing'
      let chat = conn.chats[_sender]
      if (!chat) chat = conn.chats[_sender] = { id: sender }
      chat.presences = presence
      if (id.endsWith('@g.us')) {
        let groupChat = conn.chats[id]
        if (!groupChat) groupChat = conn.chats[id] = { id }
      }
    } catch (e) {
      console.error(e)
    }
  })
}

// Debounce function to limit the rate of event handling
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  }
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
 * @param {String} filename
 * @param {import('pino').Logger} logger
 * @returns
 */
function useSingleFileAuthState(filename, logger) {
  let creds,
    keys = {},
    saveCount = 0
  // save the authentication state to a file
  const saveState = forceSave => {
    logger?.trace('saving auth state')
    saveCount++
    if (forceSave || saveCount > 5) {
      writeFileSync(
        filename,
        // BufferJSON replacer utility saves buffers nicely
        JSON.stringify({ creds, keys }, BufferJSON.replacer, 2)
      )
      saveCount = 0
    }
  }

  if (existsSync(filename)) {
    const result = JSON.parse(readFileSync(filename, { encoding: 'utf-8' }), BufferJSON.reviver)
    creds = result.creds
    keys = result.keys
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
          return ids.reduce((dict, id) => {
            let value = keys[key]?.[id]
            if (value) {
              if (type === 'app-state-sync-key') {
                value = proto.AppStateSyncKeyData.fromObject(value)
              }

              dict[id] = value
            }

            return dict
          }, {})
        },
        set: data => {
          for (const _key in data) {
            const key = KEY_MAP[_key]
            keys[key] = keys[key] || {}
            Object.assign(keys[key], data[_key])
          }

          saveState()
        },
      },
    },
    saveState,
  }
}

export default {
  bind,
  useSingleFileAuthState,
}