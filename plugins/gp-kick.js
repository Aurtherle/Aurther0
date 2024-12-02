let handler = async (m, { conn, participants, usedPrefix, command }) => {
    let botOwnerJid = '966560801636@s.whatsapp.net'; // Bot owner's JID (replace with the actual one)
    let kickte = `*مــنشـن الـشـخص !*`;

    if (!m.mentionedJid[0] && !m.quoted) 
        return m.reply(kickte, m.chat, { mentions: conn.parseMention(kickte) });

    let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender;

    if (user === botOwnerJid) {
        return m.reply(`*تبيني اطرد ابوي!*`);
    }

    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
    m.reply(`*تـــم الــطرد !*`);
};

handler.help = ['kick @user'];
handler.tags = ['group'];
handler.command = ['اتوكل', 'كلبطه', 'اخرس', 'طرد', 'دزمها', 'احبك', 'اكرهك', 'مغربي', 'تصرف خاطئ', 'يمني'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;