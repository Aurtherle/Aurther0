let handler = async (m, { conn }) => {
m.reply(global.terminos)}
handler.customPrefix = /términos y condiciones y privacidad|terminosycondicionesyprivacidad|terminosycondiciones|privacidad|الاستخدام|الخصوصيه|الخصوصية|الخصوصيه ولا الاستخدام|شروط الخصوصية|شروط الخصوصيه|شروط الاستخدام/i
handler.command = new RegExp
export default handler

global.terminos = `

*❀↲ عدم الإلمام بالمعلومات الواردة هنا لا يعفي مالك الروبوت أو الروبوت الفرعي أو المستخدم من المسؤولية عن أي عواقب قد تنجم عن ذلك❗*

*❃ ────────⊰ ❀ ⊱──────── ❃*

*⚠️ شروط الخصوصية*

❀↲ يتم الحفاظ على سرية المعلومات التي يتلقاها الروبوت وعدم مشاركتها مع أي طرف ثالث أو شخص آخر.
❀↲ لا يتم تبادل الصور أو مقاطع الفيديو أو الملصقات أو الصوتيات أو أي نوع آخر من الملفات مع أي شخص.
❀↲ رقم هاتفك لا يتم مشاركته مع أي جهة أو فرد.
❀↲ يتم حذف بيانات البطاقة والمواقع والعناوين فوراً، ولا يتم مشاركتها مع أي شخص.
❀↲ جميع المحادثات تُحذف بانتظام ولا يتم حفظ أي نسخة احتياطية (غير محفوظة) لأي نوع من المعلومات أو المحادثات.

*❃ ────────⊰ ❀ ⊱──────── ❃*

*⚠️ شروط الاستخدام*

❀↲ غير مسؤول عن أي سوء استخدام للروبوت.
❀↲ غير مسؤول عن الجهل أو استخدام الروبوت بطريقة غير ملائمة.
❀↲ الروبوت ليس متاحًا على مدار الساعة طوال أيام الأسبوع، إلا إذا قرر المالك خلاف ذلك.
❀↲ لست مسؤولاً عن الأرقام التي تُرسل إلى دعم الروبوت.
❀↲ أي ملفات وسائط متعددة مثل الصوتيات والملاحظات الصوتية والصور ومقاطع الفيديو التي يحتوي عليها الروبوت لا يتم مشاركتها مع أي شخص. إذا تم اكتشاف استخدام هذه الملفات من قبل بوت آخر، سيتم اتخاذ الإجراءات اللازمة.
❀↲ إذا تلقيت رسالة من رقم الروبوت في أي وقت ولم تكن قد طلبت ذلك، فقد تكون من مالك الروبوت أو صاحب الرقم. يُرجى احترام هذا الشخص، فهو شخص حقيقي.

*❃ ────────⊰ ❀ ⊱──────── ❃*`