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

                // Announce role distribution to the group
                await conn.reply(m.chat, "📢 *تم توزيع الأدوار على اللاعبين، وكل لاعب سيعرف دوره الآن!*", m);

                // Notify mafia and doctor about their roles
                for (let mafiaId of chat.roles.mafia) {
                    await conn.sendMessage(mafiaId, "*أنت جزء من المافيا!*");
                }

                await conn.sendMessage(chat.roles.doctor, "*أنت الطبيب، اختر أحد اللاعبين لحمايته.*");

                // Send private messages to each player with their role
                for (let player of chat.players) {
                    if (player !== null) {
                        let roleMessage = `*دورك في اللعبة:* `;
                        if (chat.roles.mafia.includes(player.id)) {
                            roleMessage += "مافيا";
                        } else if (chat.roles.doctor === player.id) {
                            roleMessage += "طبيب";
                        } else {
                            roleMessage += "مدني";
                        }
                        await conn.sendMessage(player.id, roleMessage);
                    }
                }

                // Announce the start of the first night phase
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
                        await conn.sendMessage(mafiaId, "*ناقش مع زملائك واختر الضحية.*");
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
        // Wait for doctor to select a player to protect
        return "الضحية"; // Replace with actual logic
    }

    // Format players for display
    function formatPlayers(players) {
        return players.map((player, i) => `${i + 1}. ${player ? player.name : "فارغ"}`).join("\n");
    }

    // Shuffle array
    function shuffleArray(array) {
        let currentIndex = array.length, randomIndex, temporaryValue;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

    // Process night actions (mafia, doctor)
    async function processNightActions(chatId, chat) {
        let victim = chat.nightActions.mafia[0];
        let protectedPlayer = chat.nightActions.doctor;

        if (victim === protectedPlayer) {
            await conn.reply(chatId, `*❃ المافيا اختارت ضحية: ${victim} والطبيب قام بحمايته.*`, chatId);
        } else {
            await conn.reply(chatId, `*❃ المافيا اختارت ضحية: ${victim}.*`, chatId);
            removePlayer(chat, victim);
        }
    }
};

handler.command = /^(مافيا|لقبي|بدء_مافيا|انهاء_مافيا)$/i;
export default handler;
