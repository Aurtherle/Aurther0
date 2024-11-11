import axios from 'axios';

let handler = async (m, { conn, args, command }) => {
    let chat = global.db.data.chats[m.chat];
    
    // Initialize game properties if not already done
    if (!chat.gameType) {
        chat.gameType = null; // No game is active by default
    }

    // Command to start the Hearts game
    if (command === 'قلوب') {
        if (chat.gameType === null) {
            chat.gameType = 'hearts'; // Set game type to Hearts
            chat.activeGame = true;
            chat.players = {};
            chat.roundActive = false;
            chat.sentClues = [];

            await conn.reply(m.chat, "*تست اكتب ( انضمام ) للمشاركة واكتب ( بدء ) لتبدأ*", m);
        } else {
            await conn.reply(m.chat, "*اللعبة بدأت اصلا*", m);
        }
    }

    // Command to manually stop joining
    else if (command === 'بدء') {
        if (chat.gameType === 'hearts' && chat.activeGame && !chat.roundActive) {
            await conn.reply(m.chat, "*تم ايقاف الانضمام ستبدأ اللعبة الان*", m);
            await sendPlayerList(m); // Send the player list
            chat.roundActive = true; // Mark the round as active
            await sendNextClue(m); // Send the first clue immediately
        } else {
            await conn.reply(m.chat, "*لا توجد لعبة نشطة حاليا او انها بدأت ب الفعل*", m);
        }
    }

    // Command to end the game
    else if (command === 'انهاء') {
        if (chat.gameType === 'hearts' && chat.activeGame) {
            chat.activeGame = false;
            chat.roundActive = false;
            chat.players = {};  // Clear players list
            chat.sentClues = []; // Clear sent clues list
            chat.gameType = null; // Reset game type
            await conn.reply(m.chat, "تم انهاء اللعبة", m);
        } else {
            await conn.reply(m.chat, "لا توجد لعبة نشطة حاليا أبدأ لعبة", m);
        }
    }

    // Function to handle user joining the game
    handler.all = async function (m) {
        if (m.text.trim().toLowerCase() === 'انضمام' && !chat.roundActive && chat.activeGame && chat.gameType === 'hearts') {
            let userId = m.sender;

            if (!chat.players[userId]) {
                chat.players[userId] = { hearts: 5, eliminated: false }; // Initialize user with 5 hearts
                await conn.reply(m.chat, `*تست لقد دخلت في اللعبة عدد اللاعبين المشاركين حاليا : ${Object.keys(chat.players).length}*`, m);
            } else {
                await conn.reply(m.chat, "أنت بالفعل في لعبة", m);
            }

            // Send the player list after each join
            await sendPlayerList(m);
        }
    };

    // Function to send the player list with formatted output
    async function sendPlayerList(m) {
        let playerList = "*❃ ────────⊰ ❀ ⊱──────── ❃*\n\n";
        playerList += "*المشاركين:*\n\n";
        
        for (let playerId in chat.players) {
            let user = global.db.data.users[playerId];
            let hearts = '❤️'.repeat(chat.players[playerId].hearts);
            let skull = chat.players[playerId].eliminated ? " 💀" : ""; // Add skull emoji for eliminated players
            playerList += `*◍ ${user.name}*: ${hearts}${skull}\n\n`; // Only show heart emojis
        }

        playerList += "*❃ ────────⊰ ❀ ⊱──────── ❃*";
        await conn.reply(m.chat, playerList, m);
    }

    // Function to send the next clue
    async function sendNextClue(m) {
        let data = await fetchData(); // Fetch data from GitHub or other sources
        let shuffledData = shuffleArray(data);
        let currentItemIndex = 0; // Start with the first clue

        // Function to send the next name
        async function sendNextName() {
            while (currentItemIndex < shuffledData.length) {
                let currentItem = shuffledData[currentItemIndex];
                // Check if the clue has already been sent
                if (!chat.sentClues.includes(currentItem.response)) {
                    chat.sentClues.push(currentItem.response); // Mark this clue as sent
                    let clue = currentItem.name; // Use the name as the clue (answer)
                    currentItem.response = currentItem.response.replace(/\s/g, ''); // Remove white spaces from response
                    
                    // Send "Ready for the clue?" message
                    await conn.reply(m.chat, `*تست*`, m);
                    // Delay for 1 second before sending the clue
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Construct caption with the game clue
                    let caption = `*${currentItem.response}*`;
                    await conn.reply(m.chat, caption, m); // Send the game clue

                    // Wait for answers from players
                    handler.all = async function (m) {
                        let user = m.sender;
                        let message = m.text.trim().toLowerCase().replace(/\s/g, '');

                        // Only allow players who have joined the game to answer
                        if (chat.players[user]) {
                            // Check if user's message matches the name (question)
                            if (message === currentItem.response.toLowerCase()) {
                                if (chat.players[user]) {
                                    await conn.reply(m.chat, `*تست اكتب اسم الي تبي تاخذ منه قلب*`, m);
                                    chat.lastCorrectPlayer = user; // Track the last correct player

                                    // Wait for player to respond with the target name
                                    handler.all = async function (m) {
                                        // Only allow the last correct player to respond
                                        if (m.sender === chat.lastCorrectPlayer) {
                                            let targetName = m.text.trim();
                                            let targetUserId = Object.keys(chat.players).find(id => global.db.data.users[id].name.toLowerCase() === targetName.toLowerCase());

                                            if (targetUserId && chat.players[targetUserId].hearts > 0) {
                                                // Transfer hearts
                                                chat.players[targetUserId].hearts -= 1; // Remove one heart from target
                                                await conn.reply(m.chat, `*${global.db.data.users[targetUserId].name} خسر قلب*`, m);
                                                await sendPlayerList(m); // Send updated player list after each point

                                                // Check for player elimination
                                                if (chat.players[targetUserId].hearts === 0) {
                                                    chat.players[targetUserId].eliminated = true; // Mark player as eliminated
                                                    await conn.reply(m.chat, `*${global.db.data.users[targetUserId].name} مات*`, m);
                                                    await sendPlayerList(m); // Send updated player list after elimination
                                                    delete chat.players[targetUserId]; // Remove eliminated player
                                                }

                                                // Check if only one player is left
                                                if (Object.keys(chat.players).length === 1) {
                                                    let winnerId = Object.keys(chat.players)[0];
                                                    await conn.reply(m.chat, `*${global.db.data.users[winnerId].name} فااااز 🎉*`, m);
                                                    endGame(); // End the game
                                                } else {
                                                    // Move to the next clue only after heart is taken
                                                    currentItemIndex++;
                                                    await sendNextName(); // Send the next clue
                                                }
                                            } else {
                                                await conn.reply(m.chat, `*الاسم غلط او اللاعب مات*`, m);
                                            }
                                        } else {
                                            // Ignore messages from players who are not the last correct player
                                            return; 
                                        }
                                    };
                                }
                            }
                        } else {
                            // Ignore messages from users who are not part of the game
                            return; 
                        }
                    };

                    currentItemIndex++; // Increment the clue index after sending the clue
                    return; // Exit to avoid sending the clue again
                } else {
                    currentItemIndex++; // Increment if the clue has already been sent
                }
            }

            await conn.reply(m.chat, "خلصت الأسماء", m);
            endGame();
        }

        sendNextName(); // Start sending the first clue
    }

    // Function to end the game
    function endGame() {
        chat.activeGame = false; // End the game
        chat.roundActive = false;
        chat.players = {}; // Clear players list
        chat.sentClues = []; // Clear sent clues list
        chat.gameType = null; // Reset game type
    }

    // Function to shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Function to fetch data (for clues and answers)
    async function fetchData() {
        try {
            let response = await axios.get('https://raw.githubusercontent.com/Aurtherle/Games/main/.github/workflows/hina.json');
            return response.data;
        } catch (error) {
            console.error("Failed to fetch data:", error);
            return [];
        }
    }
};

// Define the command triggers
handler.command = /^(قلوب|بدء|انهاء)$/i;

export default handler;
handler.admin = true;
handler.group = true;