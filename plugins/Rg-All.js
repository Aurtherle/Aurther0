import { createHash } from 'crypto';

// Utility function to delay processing
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let handler = async (m, { text }) => {
    if (!m.quoted || !m.quoted.text) {
        throw '*يرجى الرد على رسالة تحتوي على قائمة المستخدمين بالتنسيق المطلوب.*';
    }

    let listText = m.quoted.text.trim();

    if (!listText) {
        throw '*الرسالة المقتبسة لا تحتوي على قائمة المستخدمين.*';
    }

    // Extract lines that start with ◍
    let userEntries = listText
        .split('\n')
        .map(entry => entry.trim())
        .filter(entry => entry.startsWith('◍'));

    if (userEntries.length === 0) {
        throw '*لم يتم العثور على أي بيانات صالحة في الرسالة المقتبسة.*';
    }

    for (let entry of userEntries) {
        let match = entry.match(/^◍\s+(.+?)\s+@(\d+)/); // Match "◍ Name @1234567890"

        if (!match) {
            console.log(`Invalid format: ${entry}`);
            m.reply(`*خطأ في الصيغة: ${entry}*`);
            continue;
        }

        let name = match[1].trim();
        let who = match[2] + '@s.whatsapp.net';

        // Skip users with "⚠️" in their name
        if (name.includes('⚠️')) {
            console.log(`Skipping user with warning: ${name}`);
            continue;
        }

        if (!(who in global.db.data.users)) {
            global.db.data.users[who] = {
                exp: 0,
                credit: 0,
                bank: 0,
                chicken: 0,
                lastclaim: 0,
                registered: false,
                name: '',
                age: -1,
                regTime: 0,
                afk: -1,
                afkReason: '',
                banned: false,
                warn: 0,
                level: 0,
                role: '',
                autolevelup: true,
                messages: 0,
                kickTime: 0,
                scheduledKick: false,
                remainingKickTime: 0,
                consentGiven: false,
                consentTimestamp: 0,
            };
        }

        let user = global.db.data.users[who];

        if (user.registered === true) {
            console.log(`User already registered: ${who}`);
            m.reply(`*لقد تم تسجيله بالفعل: @${match[2]}*`, null, { mentions: [who] });
            continue;
        }

        if (name.length >= 30) {
            console.log(`Name too long for user: ${who}`);
            m.reply(`*الاسم طويل جدًا لـ @${match[2]}*`, null, { mentions: [who] });
            continue;
        }

        const isNameTaken = Object.values(global.db.data.users).some(existingUser => {
            return typeof existingUser.name === 'string' && existingUser.name.toLowerCase() === name.toLowerCase();
        });

        if (isNameTaken) {
            console.log(`Name already taken: ${name}`);
            m.reply(`*الاسم مستخدم بالفعل: ${name}*`);
            continue;
        }

        // Register the user
        user.name = name;
        user.regTime = +new Date();
        user.registered = true;

        let sn = createHash('md5').update(who).digest('hex').slice(0, 21);

        m.reply(`*❃ ──────⊰ ❀ ⊱────── ❃*
◍ *تم تسجيل @${match[2]} في قاعدة البيانات*
*❃ ──────⊰ ❀ ⊱────── ❃*
◍ *الاسم:* *${name}*
◍ *الايدي:* *${sn}*
*❃ ──────⊰ ❀ ⊱────── ❃*
`.trim(), null, { mentions: [who] });

        console.log(`User registered: ${who}, Name: ${name}, ID: ${sn}`);

        // Add a delay to avoid spamming
        await sleep(400);
    }
};

// Handler properties
handler.help = ['reg'].map(v => v + ' (رد على الرسالة)');
handler.tags = ['rg'];
handler.command = ['تسجيل-الكل']; 
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;