import axios from 'axios';

let handler = async (m, { conn, args, command }) => {
    let chat = global.db.data.chats[m.chat];
    let gameActive = chat.activeGame || false;

    // Command handler for different commands
    switch (command) {
        case 'مافيا': {
            // Start the game (mafia)
            if (!gameActive) {
                chat.activeGame = true;
                chat.players = Array(10).fill(null);
                chat.roles = {};
                chat.started = false;
                chat.round = 1;
                chat.phase = 'none'; // Current phase: 'none', 'night', 'day'
                chat.nightActions = {}; // Track night actions (mafia, doctor)
                chat.deadPlayers = []; // Track dead players

                await conn.reply(
                    m.chat,
                    `*❃ أهلاً بكم في لعبة مافيا ❃*\n
🔪 *مافيا:*\n
لعبة مافيا هي لعبة تحتاج إلى ذكاء ومهارة في الإقناع. يتم توزيع الأدوار بشكل سري على اللاعبين. انضم عبر كتابة:\n
لقبي: [اسمك]\n
❃ القائمة الحالية:\n\n${formatPlayers(chat.players)}`,
                    m
                );
            } else {
                await conn.reply(m.chat, "*❃ اللعبة بدأت بالفعل ❃*", m);
            }
            break;
        }

        case 'لقبي': {
            // Join the game by specifying a name
            if (!gameActive) return conn.reply(m.chat, "*❃ اللعبة غير مفعلة حالياً ❃*", m);

            let nickname = args.join(" ");
            if (!nickname) return conn.reply(m.chat, "❃ يجب عليك كتابة اسمك للانضمام: لقبي: [اسمك]", m);

            let playerIndex = chat.players.findIndex(player => player === null);
            if (playerIndex === -1) return conn.reply(m.chat, "❃ اللعبة ممتلئة، لا يمكن الانضمام الآن ❃", m);

            chat.players[playerIndex] = { id: m.sender, name: nickname };
            await conn.reply(m.chat, `*❃ تم إضافة ${nickname} إلى اللعبة!*\n❃ القائمة الحالية:\n\n${formatPlayers(chat.players)}`, m);
            break;
        }

        case 'بدء_مافيا': {
            // Start the game manually when the command 'بدء_مافيا' is used
            if (!gameActive) return conn.reply(m.chat, "*❃ اللعبة غير مفعلة حالياً ❃*", m);

            // Check if there are enough players
            if (chat.players.filter(player => player !== null).length < 5) {
                chat.started = true;
                assignRoles(chat); // Assign roles to the players

                // Notify mafia privately about each other
                chat.roles.mafia.forEach(mafiaId => {
                    let mafiaPlayers = chat.roles.mafia.filter(id => id !== mafiaId).map(id => getPlayerName(chat, id));
                    conn.sendMessage(mafiaId, `*أنت جزء من المافيا. أعضاء المافيا هم: ${mafiaPlayers.join(', ')}.*`);
                });

                // Notify doctor about their role
                conn.sendMessage(chat.roles.doctor, `*أنت الطبيب. اختر أحد اللاعبين لحمايته.*`);

                // Start the first night phase after assigning roles
                chat.phase = 'night';
                await conn.reply(m.chat, "🌙 *بدأت الجولة الليلية!*\n- المافيا، اختروا هدفكم.\n- الطبيب، احمِ أحد اللاعبين.", m);

                // Lock group after 1 minute of discussion
                setTimeout(async () => {
                    await conn.groupSettingUpdate(m.chat, { restrict: true }); // Lock the group
                    await conn.reply(m.chat, "*❃ تم قفل الجروب، المافيا اختاروا ضحيّتهم ❃*", m);

                    // Let mafia select a victim
                    let mafiaChoice = await getMafiaChoice(m.chat, chat);
                    chat.nightActions.mafia = mafiaChoice;

                    // Notify mafia privately to discuss and choose
                    for (let mafiaId of chat.roles.mafia) {
                        await conn.sendMessage(mafiaId, `*ناقش مع زملائك واختر الضحية.*`);
                    }

                    // Let doctor select a protection target
                    let doctorChoice = await getDoctorChoice(m.chat, chat);
                    chat.nightActions.doctor = doctorChoice;

                    // Process the results after night actions
                    setTimeout(async () => {
                        await processNightActions(m.chat, chat);
                        await conn.groupSettingUpdate(m.chat, { restrict: false }); // Unlock the group
                        await conn.reply(m.chat, "☀️ *الجولة النهارية بدأت!*\nنقاش مفتوح الآن، حدد من تعتقد أنه المافيا.", m);

                        // Allow players to discuss for 2 minutes before voting
                        setTimeout(async () => {
                            await conn.reply(m.chat, "📢 *التصويت الآن!* اكتب: تصويت [الرقم] لإقصاء لاعب.", m);
                            setTimeout(async () => {
                                await handleVoting(m.chat, chat);
                            }, 60000); // Voting phase for 1 minute
                        }, 120000); // Discussion phase for 2 minutes
                    }, 60000); // Wait for 1 minute for mafia and doctor actions
                }, 60000); // Wait 1 minute for discussion
            } else {
                return conn.reply(m.chat, "❃ يجب أن يكون هناك على الأقل 5 لاعبين لبدء اللعبة.", m);
            }
            break;
        }

        case 'انهاء_مافيا': {
            // End the game
            if (!gameActive) return conn.reply(m.chat, "*❃ اللعبة غير مفعلة حالياً ❃*", m);

            chat.activeGame = false;
            chat.players = [];
            chat.roles = {};
            chat.round = 0;
            chat.deadPlayers = [];
            await conn.reply(m.chat, "*❃ تم إنهاء اللعبة بنجاح ❃*", m);
            break;
        }

        default:
            await conn.reply(m.chat, "❃ أمر غير معترف به ❃", m);
    }

    // Assign roles to players
    function assignRoles(chat) {
        let playerIds = chat.players.filter(player => player !== null).map(player => player.id);
        
        let mafiaCount = 1; // Default mafia count
        let doctorCount = 1; // Default doctor count

        if (playerIds.length >= 5) {
            mafiaCount = Math.floor(playerIds.length / 3); // Mafia count for more than 5 players
        }

        shuffleArray(playerIds);

        chat.roles.mafia = playerIds.splice(0, mafiaCount);
        chat.roles.doctor = playerIds.splice(0, doctorCount)[0];
        chat.roles.civilians = playerIds;
    }

    // Get mafia choice
    async function getMafiaChoice(chatId, chat) {
        let mafiaChoice = [];
        // mafia members send their choice of victim
        for (let mafiaId of chat.roles.mafia) {
            await conn.sendMessage(mafiaId, "*اختار الضحية من بين اللاعبين.*");
            let victim = await getResponseFromMafia(mafiaId);
            mafiaChoice.push(victim);
        }
        return mafiaChoice;
    }

    // Get doctor choice
    async function getDoctorChoice(chatId, chat) {
        await conn.sendMessage(chatId, "*اختار الشخص الذي تود حمايته.*");
        let doctorChoice = await getResponseFromDoctor(chatId);
        return doctorChoice;
    }

    // Get response from a mafia player
    async function getResponseFromMafia(playerId) {
        // Wait for mafia player to select a victim
        return "الضحية"; // Replace with actual logic
    }

    // Get response from doctor
    async function getResponseFromDoctor(chatId) {
        // Wait for doctor player to select a target to protect
        return "الضحية"; // Replace with actual logic
    }

    // Shuffle array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Format players list
    function formatPlayers(players) {
        let list = players.map((player, index) => {
            if (player) {
                return `${index + 1}. ${player.name}`;
            }
            return `${index + 1}. [فارغ]`;
        });
        return list.join("\n");
    }

    // Process night actions (mafia and doctor)
    async function processNightActions(chatId, chat) {
        let victim = chat.nightActions.mafia;
        let doctorProtected = chat.nightActions.doctor;

        // If the mafia's victim was protected by the doctor, announce protection
        if (victim === doctorProtected) {
            await conn.reply(chatId, `*❃ المافيا اختارت ضحية: ${victim} والطبيب قام بحمايته.*`, chatId);
        } else {
            // If not protected, eliminate victim
            await conn.reply(chatId, `*❃ المافيا اختارت ضحية: ${victim}.*`, chatId);
            removePlayer(chat, victim); // Remove player from the game
        }
    }

    // Remove player from the game
    function removePlayer(chat, playerId) {
        chat.players = chat.players.filter(player => player.id !== playerId);
        chat.roles.mafia = chat.roles.mafia.filter(id => id !== playerId);
        chat.roles.civilians = chat.roles.civilians.filter(id => id !== playerId);
        chat.roles.doctor = chat.roles.doctor.filter(id => id !== playerId);
    }

    // Handle voting phase
    async function handleVoting(chatId, chat) {
        // Collect votes and eliminate the most voted player
        let votes = {}; // Collect votes and tally
        await conn.reply(chatId, "*❃ التصويت انتهى. جاري حساب الأصوات...*");

        let mostVotedPlayer = Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0]; // Player with highest votes
        removePlayer(chat, mostVotedPlayer);

        // Notify about the player being eliminated
        await conn.reply(chatId, `*❃ تم إقصاء ${getPlayerName(chat, mostVotedPlayer)}. دور اللاعب: ${getRole(mostVotedPlayer)}.*`, chatId);
    }

    // Get player name
    function getPlayerName(chat, playerId) {
        return chat.players.find(player => player.id === playerId).name;
    }

    // Get player role
    function getRole(playerId) {
        if (chat.roles.mafia.includes(playerId)) {
            return "مافيا";
        } else if (chat.roles.doctor === playerId) {
            return "طبيب";
        } else {
            return "مدني";
        }
    }
};

handler.command = /^(مافيا|لقبي|بدء_مافيا|انهاء_مافيا)$/i;
export default handler;
