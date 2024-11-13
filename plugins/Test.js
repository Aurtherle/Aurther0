let handler = async (m, { conn, command }) => {
    let chat = global.db.data.chats[m.chat];
    
    // Initialize the test command setting if not already defined
    if (chat.testCommand === undefined) {
        chat.testCommand = false; // Set to off by default
    }

    // Toggle the feature with each 'test' command
    if (command === 'تست') {
        chat.testCommand = !chat.testCommand; // Toggle between true and false
    }

    // Function to detect and respond to bold text
    handler.all = async function (m) {
        if (chat.testCommand && /\*[^*]+\*/.test(m.text)) { // Check for bold text
            let normalText = m.text.replace(/\*/g, ""); // Remove asterisks to make it normal text
            
            // Indicate typing status
            await conn.sendPresenceUpdate('composing', m.chat);

            // Add a 0.2-second delay before sending the message
            setTimeout(async () => {
                await conn.sendMessage(m.chat, { text: normalText });
            }, 400); // 200 milliseconds = 0.2 seconds
        }
    };
};

// Define the command trigger
handler.command = /^تست$/i;
handler.rowner = true;
handler.group = true;

export default handler;
