import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || q.mediaType || '';
  if (!mime) throw 'Please send an image!';
  if (!/image\/(jpe?g|png)/.test(mime)) throw `Unsupported file type: ${mime}`;

  m.reply('جار التحقق من البيانات...');

  let img = await q.download?.();
  if (!img) throw 'فشل في تحميل الصورة!';

  try {
    let textFromImage = await extractTextFromImage(img);
    if (!textFromImage.trim()) throw ' الصورة غيرو واضحة لم يتم العثور على نص !';

    // If user entered search text (after .ocr command), check for it in the extracted text
    if (text && text.trim()) {
      if (textFromImage.includes(text.trim())) {
        m.reply(`الاسم متطابق: تم التحقق من ان الاسم  "${text.trim()}" متطابق ايضا في الصورة .`);
      } else {
        m.reply(`الاسم "${text.trim()}" لا يتطابق.`);
      }
    } else {
      // If no text was provided for searching, just show the extracted text
      if (isIDImage(textFromImage)) {
        m.reply(`النص المستخرج من الهوية:\n${textFromImage}`);
      } else {
        m.reply('هذه ليست بطاقة شخصية.');
      }
    }
  } catch (error) {
    console.error(error);
    m.reply('فشل في استخراج النص من الصورة.');
  }
};

handler.help = ['ocr'];
handler.tags = ['tools'];
handler.command = ['مطابقة','تطابق','تحقق'];

export default handler;

async function extractTextFromImage(imageBuffer) {
  const apiKey = 'K88250673188957'; // Your OCR.Space API key
  
  // Convert the imageBuffer into a Blob (using Node.js Buffer as the data type)
  const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' }); // Assuming JPEG, adjust type if needed

  const formData = new FormData();
  formData.append('apikey', apiKey);
  formData.append('file', imageBlob, 'image.jpg');
  formData.append('language', 'ara'); // Set language to Arabic

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  const result = await response.json();
  if (result.IsErroredOnProcessing) {
    throw new Error(`OCR Error: ${result.ErrorMessage.join(', ')}`);
  }

  return result.ParsedResults?.[0]?.ParsedText || 'لم يتم الكشف عن أي نص.';
}

// Function to check if the extracted text contains ID-related keywords
function isIDImage(text) {
  const idKeywords = [
    'مصلحة', 'المدنية', 'الرقم', 'الوطني', 'مكان', 'تاريخ', 'الميلاد'
  ];

  // Check if any of the keywords appear in the text
  return idKeywords.some(keyword => text.includes(keyword));
}
