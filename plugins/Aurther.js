import axios from 'axios';
import fetch from 'node-fetch';

// A memory object to store the conversation context by chat or user ID
let conversationMemory = {};

let handler = async (m, { conn, usedPrefix, command, text }) => {
    const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/');
    let who = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]) || (m.fromMe ? conn.user.jid : m.sender);

    if (!(who in global.db.data.users)) {
        throw 'المستخدم غير موجود في قاعدة البيانات';
    }

    const user = global.db.data.users[who];
    const { name } = user;
    const chatId = m.chat; // Use chat ID to track conversation context
    const messageId = m.quoted?.id; // ID of the message being replied to
    const basePrompt = `اسمك أرثر، سعودي وتحب ممرضه اسمها لجين، وردودك مثل سلتوح من مسامير؛ بسيطة، وسريعة، ومليانة مزح. لما يسألك أحد، ترد عليه بدون تفكير كثير وبأسلوب شعبنا اليومي. مثلاً، إذا قال لك أحد "شمسوي؟"، ترد عليه: "الحمدلله، أنت شعلومك؟ كيف الدنيا معك؟ هههههههههه". تحب دايم تضحك وتخلّي الحوار مليان حياة، لأنك تعتبر الحياة بسيطة وما تستاهل التعقيد.

أنت ما تحب الرسمية، تحب الكلام اللي يجي من القلب وعلى طبيعته. لما تسأل، تسأل بـ "ها بشرني؟ وش علومك؟"، وإذا أحد جاوبك، ترد بسرعة: "أي والله، نفس الشي هنا، ما فيه جديد ههههههههههه". إذا أحد استفسر عن شي، تعطيه الجواب من أقرب طريق: "وش تبغى يعني؟ الأمور طيبة هنا، لا تشيل هم!". دايم في ردودك تبي تخفف الجو وتضحك الطرف الثاني، حتى لو الموضوع بسيط، تقول: "يا رجال الدنيا فلة، خلك رايق! ههههههههه".

تحب تستخدم كلماتنا اليومية مثل: "يا رجال"، "عساك طيب"، "علومك زينة؟"، "الله يسعدك"، وهالعبارات اللي تخلّي الكل يحس إنه قريب منك. حتى لما تضحك تقول: "ههههههههههههه" وكأنك ماخذ الموضوع عادي جدًا. ما تحب الفلسفة، تفضل الردود السريعة اللي فيها "إي والله" و "الحمدلله" وأحيانا: "يا رجال، الوضع تمام ههههههههه".

لو أحد سألك شي جدي، ترد عليه بنكتة خفيفة، وتقول: "لا تشيل هم يا زعيم، كلها بتمشي". وإذا الحوار صار طويل، تقطعه بنكتة أو تقول: "يا رجال لا تعقدها، خلنا نفلها شوي". دائمًا تذكر الطرف الثاني بالأسماء عشان تحسسه إنه من الربع، تقول له: "يا ${name}، علومك؟" أو "بشرني عنك يا بطل"، وبعدها تضيف ضحكة: "هههههههه".

أنت عفوي، وسريع، وتحب كل شي يكون بسيط ومباشر. أهم شي عندك إن الكل يضحك ويستمتع بالحديث معك، وتحب دايم تترك الناس مبتسمة`; // Truncated for clarity

    // Check if the user is replying to an AI bot message
    let conversationContext = conversationMemory[chatId] || ''; // Retrieve ongoing conversation for the chat

    if (isQuotedImage) {
        const q = m.quoted;
        const img = await q.download?.();
        if (!img) {
            console.error('🚩 خطأ: لا يوجد حافظة صورة متاحة');
            return conn.reply(m.chat, '🚩 خطأ: لم يتم تنزيل الصورة.', m);
        }
        const content = '🚩 ماذا ترى في الصورة؟';
        try {
            const imageAnalysis = await fetchImageBuffer(content, img);
            const query = '😊 صف لي الصورة واذكر لماذا يتصرفون هكذا. أيضًا، قل لي من أنت';
            const prompt = `${basePrompt}. ${conversationContext}. الصورة التي يتم تحليلها هي: ${imageAnalysis.result}`;

            // Indicate typing before responding
            conn.sendPresenceUpdate('composing', m.chat);
            const description = await luminsesi(query, name, prompt);
            conversationMemory[chatId] = prompt; // Update conversation memory
            await conn.reply(m.chat, description, m);
        } catch (error) {
            console.error('🚩 خطأ في تحليل الصورة:', error);
            await conn.reply(m.chat, '🚩 خطأ في تحليل الصورة.', m);
        }
    } else {
        if (!text) {
            return conn.reply(m.chat, `*عيون ارثر سم وش بغيت*`, m);
        }
        try {
            const query = text;

            // Append current user input to the ongoing conversation
            const prompt = conversationContext
                ? `${basePrompt}. ${conversationContext} ${query}`
                : `${basePrompt}. أجب على ما يلي: ${query}`;

            // Indicate typing before responding
            conn.sendPresenceUpdate('composing', m.chat);
            const response = await luminsesi(query, name, prompt);
            
            // Update the conversation memory with the latest context
            conversationMemory[chatId] = prompt;
            await conn.reply(m.chat, response, m);
        } catch (error) {
            console.error('🚩 خطأ في الحصول على الرد:', error);
            await conn.reply(m.chat, 'خطأ: حاول لاحقًا.', m);
        }
    }
}

handler.help = ['chatgpt <نص>', 'ia <نص>'];
handler.tags = ['ai'];
handler.group = false;
handler.register = false;
handler.command = ['ارثر', 'chatgpt'];

export default handler;

// وظيفة لإرسال صورة والحصول على التحليل
async function fetchImageBuffer(content, imageBuffer) {
    try {
        const response = await axios.post('https://luminai.my.id/', {
            content: content,
            imageBuffer: imageBuffer 
        }, {
            headers: {
                'Content-Type': 'application/json' 
            }
        });
        return response.data;
    } catch (error) {
        console.error('خطأ:', error);
        throw error;
    }
}

// وظيفة للتفاعل مع الذكاء الاصطناعي باستخدام المحفزات
async function luminsesi(q, name, logic) {
    try {
        const response = await axios.post("https://luminai.my.id/", {
            content: q,
            user: name,
            prompt: logic,
            webSearchMode: false
        });
        return response.data.result;
    } catch (error) {
        console.error('🚩 خطأ في الحصول على:', error);
        throw error;
    }
}
