import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';
import fs from 'fs';

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const taguser = '@' + m.sender.split("@s.whatsapp.net")[0];

    // Generate a random boolean value to switch between gifPlayback or not
    const useGifPlayback = Math.random() < 0.5;

    // Prepare the local video
    const videoPath = './Assets/aurther.mp4'; // Replace with the actual path to the local video
    let videoMessage;

    if (useGifPlayback) {
        // Prepare the media as GIF for gifPlayback
        videoMessage = await prepareWAMessageMedia(
            { 
                video: fs.readFileSync(videoPath), 
                gifPlayback: true 
            },
            { upload: conn.waUploadToServer }
        );
    } else {
        // Prepare the media as a normal video
        videoMessage = await prepareWAMessageMedia(
            { 
                video: fs.readFileSync(videoPath) 
            },
            { upload: conn.waUploadToServer }
        );
    }

    // Create interactive message content
    const interactiveMessage = {
        header: {
            title: `*❃ ───────⊰ ❀ ⊱─────── ❃*\n\n *اهلا* 👋🏻 『 ${m.pushName} 』 \n *• انا ارثر*\n *• سعيد بخدمتك 😁*`,
            hasMediaAttachment: true,
            videoMessage: videoMessage.videoMessage, // Use the video message
        },
        body: {
            text: '📜 *أختر من الأقسام ما يناسبك* \n\n*❃ ───────⊰ ❀ ⊱─────── ❃*\n',
        },
        nativeFlowMessage: {
            buttons: [
                {
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                        title: '❀ اخـتر القـسـم ❀',
                        sections: [
                            {
                                title: 'قسم الاوامر',
                                highlight_label: 'آرثر',
                                rows: [
                                    {
                                        header: '❀ قـسـم المشـرفـين ❀',
                                        title: '❃ أوامر المشرفين ❃',
                                        description: '',
                                        id: '.قسم-المشرفين',
                                    },
                                    {
                                        header: '❀ قسم التحميلات ❀',
                                        title: '❃ أوامر التحميل ❃',
                                        description: '',
                                        id: '.قسم-التحميل',
                                    },
                                    {
                                        header: '❀ قسم الـتـرفيـه ❀',
                                        title: '❃ أوامر الترفيه ❃',
                                        description: '',
                                        id: '.قسم-الترفيه',
                                    },
                                    {
                                        header: '❀ قسم الحياة الافتراضية ❀',
                                        title: '❃ أوامر الحياة الافتراضية ❃',
                                        description: '',
                                        id: '.قسم-الحياة-الافتراضية',
                                    },
                                    {
                                        header: '❀ قسم الـتحـويل ❀',
                                        title: '❃ أوامر التحويل ❃',
                                        description: '',
                                        id: '.قسم-التحويل',
                                    },
                                    {
                                        header: '❀ قسم اوامر الدين والأسلام ❀',
                                        title: '❃ أوامر الـديـني ❃',
                                        description: '',
                                        id: '.قسم-ديني',
                                    },
                                    {
                                        header: '❀ آرثر ❀',
                                        title: '❃ أوامر آرثر ❃',
                                        description: '',
                                        id: '.قسم-المطور',
                                    },
                                    {
                                        header: '❀ قسم الألقاب ❀',
                                        title: '❃ أوامر الألقاب ❃',
                                        description: '',
                                        id: '.القاب-الاعضاء',
                                    },
                                    {
                                        header: '❀ كل الاوامر ❀',
                                        title: '❃ جميع الأوامر ❃',
                                        description: '',
                                        id: '.كل-الاوامر',
                                    },
                                ],
                            },
                        ],
                    }),
                    messageParamsJson: '',
                },
                {
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                        title: '❀ معلومات البوت ❀',
                        sections: [
                            {
                                title: '📜معلومات عن البوت📜',
                                highlight_label: 'آرثر : ♡',
                                rows: [
                                    {
                                        header: '❀ صانع البوت ❀',
                                        title: '❃ الـمطور ❃',
                                        description: 'آرثر : ♡',
                                        id: '.المطور',
                                    },
                                    {
                                        header: '❀ خصوصية استخدام البوت ❀',
                                        title: '❃ الاسـتخدام ❃',
                                        description: '',
                                        id: '.الاستخدام',
                                    },
                                    {
                                        header: '❀ ابلاغ او ارسال رساله للمطور ❀',
                                        title: '❃ طـلـب ابـلاغ ❃',
                                        description: '',
                                        id: '.بلاغ',
                                    },
                                    {
                                        header: '❀ لتقييم البوت ❀',
                                        title: '❃ تقييم البوت ❃',
                                        description: '',
                                        id: '.تقيم',
                                    },
                                ],
                            },
                        ],
                    }),
                    messageParamsJson: '',
                },
                {
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                        display_text: "❀ قنـاة الـواتـساب ❀",
                        url: "https://whatsapp.com/channel/0029Vak3oVNISTkBhE5ypj43",
                        merchant_url: "https://whatsapp.com/channel/0029Vak3oVNISTkBhE5ypj43",
                    }),
                },
            ],
        },
    };

    // Generate the message
    let msg = generateWAMessageFromContent(
        m.chat,
        {
            viewOnceMessage: {
                message: {
                    interactiveMessage,
                },
            },
        },
        { userJid: conn.user.jid, quoted: m }
    );

    // Send the message
    conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
};

handler.help = ['info'];
handler.tags = ['main'];
handler.command = ['أوامر', 'اوامر'];

export default handler;