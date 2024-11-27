import fs from 'fs';

let handler = m => m;
handler.all = async function (m) {
    let chat = global.db.data.chats[m.chat];

    if (/^كريس$/i.test(m.text)) { // Match the text "كريس"
        let filePath = './Assets/mp3/Guru1.mp3'; // Adjust the path to your MP3 file
        if (fs.existsSync(filePath)) { // Check if the file exists
            let buffer = fs.readFileSync(filePath); // Read the file as a buffer
            conn.sendFile(m.chat, buffer, 'krys.mp3', null, m);
        } else {
            conn.reply(m.chat, 'The requested file does not exist.', m);
        }
    }

    // Your other commands go here...

    return !0;
};
export default handler;
