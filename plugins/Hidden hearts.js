import axios from 'axios';

let handler = async (m, { conn, args, command }) => {
    let chat = global.db.data.chats[m.chat];
    let gameActive = chat.activeGame || false;

    // Command to start the game
    if (command === 'مخفيه') {
        if (!gameActive) {
            chat.activeGame = true;
            chat.players = {};
            chat.roundActive = false;
            chat.sentClues = []; // Array to track sent clues
            chat.lastCorrectPlayer = null; // Track the last correct player

            await conn.reply(m.chat, "*تست اكتب ( انضمام ) للمشاركة واكتب ( بدء ) لتبدأ*", m);
        } else {
            await conn.reply(m.chat, "*اللعبة بدأت اصلا*", m);
        }
    }

    // Command to manually stop joining
    else if (command === 'بدء_م') {
        if (gameActive && !chat.roundActive) {
            await conn.reply(m.chat, "*تم ايقاف الانضمام ستبدأ اللعبة الان*", m);
            chat.roundActive = true; // Mark the round as active
            
            // Shuffle player order before sending the player list
            let shuffledPlayers = shuffleObject(chat.players);

            // Send player list after joining stops
            await sendPlayerList(m, shuffledPlayers);

            await sendNextClue(m); // Send the first clue immediately
        } else {
            await conn.reply(m.chat, "*لا توجد لعبة نشطة حاليا او انها بدأت ب الفعل*", m);
        }
    }

    // Command to end the game
    else if (command === 'انهاء_م') {
        if (gameActive) {
            chat.activeGame = false;
            chat.roundActive = false;
            chat.players = {};  // Clear players list
            chat.sentClues = []; // Clear sent clues list
            chat.lastCorrectPlayer = null; // Reset last correct player
            await conn.reply(m.chat, "تم انهاء اللعبة", m);
        } else {
            await conn.reply(m.chat, "لا توجد لعبة نشطة حاليا أبدأ لعبة", m);
        }
    }

    // Function to handle user joining the game
    handler.all = async function (m) {
        if (m.text.trim().toLowerCase() === 'انضمامم' && !chat.roundActive && chat.activeGame) {
            let userId = m.sender;

            if (Object.keys(chat.players).length >= 10) {
                await conn.reply(m.chat, "تم الوصول الى الحد الأقصى لعدد اللاعبين (10)", m);
                return;
            }

            if (!chat.players[userId]) {
                // Assign a unique heart color for each player
                let heartColors = ['💚', '❤️', '🧡', '💙', '💜', '💛', '💖', '🖤', '💗', '💟'];
                let playerHeart = heartColors[Object.keys(chat.players).length % heartColors.length];

                chat.players[userId] = { hearts: 5, color: playerHeart, eliminated: false }; // Initialize user with 5 hearts
                await conn.reply(m.chat, `*تست لقد دخلت في اللعبة عدد اللاعبين المشاركين حاليا : ${Object.keys(chat.players).length}*`, m);
            } else {
                await conn.reply(m.chat, "أنت بالفعل في لعبة", m);
            }
        }
    };

    // Function to send the player list with formatted output
    async function sendPlayerList(m, shuffledPlayers) {
        // Convert the players object to an array of entries [key, value]
        let playerEntries = Object.entries(shuffledPlayers);
        
        // Shuffle the array of player entries
        playerEntries = shuffleArray(playerEntries);
        
        let playerList = "*❃ ────────⊰ ❀ ⊱──────── ❃*\n\n";
        playerList += "*المشاركين:*\n\n";

        // Iterate over the shuffled array of players
        for (let [playerId, playerData] of playerEntries) {
            let user = global.db.data.users[playerId];
            let hearts = playerData.color.repeat(playerData.hearts);
            let skull = playerData.eliminated ? " 💀" : ""; // Add skull emoji for eliminated players
            let name = playerData.eliminated ? `*${user.name}*` : ""; // Reveal the name only after elimination
            playerList += `${hearts}${name}${skull}\n\n`; // Show hearts and optionally name
        }

        playerList += "*❃ ────────⊰ ❀ ⊱──────── ❃*";
        await conn.reply(m.chat, playerList, m);
    }

    // Function to shuffle an object
    function shuffleObject(obj) {
        const shuffled = {};
        const keys = Object.keys(obj);
        for (let i = keys.length - 1; i >= 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            const key = keys[randomIndex];
            shuffled[key] = obj[key];
            keys[randomIndex] = keys[i]; // Swap
        }
        return shuffled;
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
                                // If correct, set last correct player
                                chat.lastCorrectPlayer = user; 
                                await conn.reply(m.chat, `*تست اكتب قلب اللاعب الي تبي تاخذ منه قلب*`, m);
                                
                                // Wait for the last correct player to respond with the target heart color
                                handler.all = async function (m) {
                                    if (m.sender !== chat.lastCorrectPlayer) {
                                        return; // Ignore responses from other players
                                    }

                                    let targetColor = m.text.trim();
                                    let targetUserId = Object.keys(chat.players).find(id => chat.players[id].color === targetColor);

                                    if (targetUserId && chat.players[targetUserId].hearts > 0) {
                                        // Transfer hearts
                                        chat.players[targetUserId].hearts -= 1; // Remove one heart from target
                                        await conn.reply(m.chat, `*${chat.players[targetUserId].color} خسر قلب*`, m);

                                        // Check for player elimination
                                        if (chat.players[targetUserId].hearts === 0) {
                                            chat.players[targetUserId].eliminated = true; // Mark player as eliminated
                                            let targetName = global.db.data.users[targetUserId].name;
                                            await conn.reply(m.chat, `*${targetName} مات*`, m);
                                        }

                                        // Check if only one player is left
                                        let remainingPlayers = Object.values(chat.players).filter(player => player.hearts > 0);
                                        if (remainingPlayers.length === 1) {
                                            let winnerId = Object.keys(chat.players).find(id => chat.players[id].hearts > 0);
                                            let winnerName = global.db.data.users[winnerId].name;
                                            await conn.reply(m.chat, `*${winnerName} فااااز 🎉*`, m);
                                            endGame(); // End the game
                                        } else {
                                            // Move to the next clue only after heart is taken
                                            currentItemIndex++;
                                            await sendNextName(); // Send the next clue
                                        }
                                    } else {
                                        await conn.reply(m.chat, `*الاسم غلط او اللاعب مات*`, m);
                                    }
                                };
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
        chat.lastCorrectPlayer = null; // Reset last correct player
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
handler.command = /^(مخفيه|بدء_م|انهاء_م)$/i;

export default handler;
handler.admin = true;
handler.group = true;