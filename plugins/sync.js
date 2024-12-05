let handler = async (m, { conn }) => {
  // Group IDs
  const group1 = '120363041026065606@g.us'; // اجارس group ID
  const group2 = '120363044293452711@g.us'; // اعلانات group ID
  const group2Link = 'https://chat.whatsapp.com/LLucZEBpwec2n6PvwcRgHD'; // Correct اعلانات group link

  // Fetch participants of both groups
  const participantsGroup1 = await conn.groupMetadata(group1).then(v => v.participants).catch(() => []);
  const participantsGroup2 = await conn.groupMetadata(group2).then(v => v.participants).catch(() => []);

  // Extract user IDs
  const group1Ids = participantsGroup1.map(p => p.id);
  const group2Ids = participantsGroup2.map(p => p.id);

  // Find members in group1 but not in group2
  const onlyInGroup1 = participantsGroup1.filter(p => !group2Ids.includes(p.id));
  // Find members in group2 but not in group1
  const onlyInGroup2 = participantsGroup2.filter(p => !group1Ids.includes(p.id));

  // Prepare messages
  let text1 = "*❃ ──────⊰ ❀ ⊱────── ❃*\n\n";
  text1 += "*أعضاء موجودين ف الأساسي وما دخلوا الاعلانات:*\n\n";
  text1 += onlyInGroup1.map(p => `◍ @${p.id.split('@')[0]}`).join('\n') || "كل الأعضاء ف الاعلانات الوضع ف السمبتيك";
  text1 += `\n\nيرجى دخول الإعلانات الدخول اجباري او سيتم طرده من الأساسي:\n${group2Link}`;
  text1 += "\n\n*❃ ──────⊰ ❀ ⊱────── ❃*";

  let text2 = "*❃ ──────⊰ ❀ ⊱────── ❃*\n\n";
  text2 += "*أعضاء موجودين ف الاعلانات ومب ف الأساسي:*\n\n";
  text2 += onlyInGroup2.map(p => `◍ @${p.id.split('@')[0]}`).join('\n') || "شوكولولو كل الأعضاء في الأساسي";
  text2 += "\n\n*❃ ──────⊰ ❀ ⊱────── ❃*";

  // Send messages
  if (onlyInGroup1.length > 0) {
    await conn.sendMessage(group1, { text: text1, mentions: onlyInGroup1.map(p => p.id) });
  }

  if (onlyInGroup2.length > 0) {
    await conn.sendMessage(group2, { text: text2, mentions: onlyInGroup2.map(p => p.id) });
  }
};

// Command properties
handler.help = ['syncgroups'];
handler.tags = ['group'];
handler.command = /^(مزامنه)$/i;
handler.group = true;
handler.admin = true;

export default handler;