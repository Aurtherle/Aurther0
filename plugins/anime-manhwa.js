let handler = async (m, { conn, text }) => {
  if (!text) throw 'أكتب أسم المانهوا الي تبي تبحث عليها';
  let query = encodeURIComponent(text)

  const url = `https://asura.guruapi.tech/asura/search?name=${query}`;

  const response = await fetch(url);
  const json = await response.json();

  // Log the API response to check its structure
  console.log('API Search Response:', json);

  if (!response.ok || !json.data || json.data.length === 0) {
      throw `No results found for the query: ${text}`;
  }
 
  let link = json.data[0].link;

  const url2 = `https://asura.guruapi.tech/asura/details?url=${link}`;

  let response2 = await fetch(url2);
  let json2 = await response2.json();

  // Log the details API response to check its structure
  console.log('API Details Response:', json2);

  if (!response2.ok || !json2.data) {
      throw `An error occurred: ${json2.error || 'No details available'}`;
  }

  let lastEpisodeUrl = 'N/A';

  if (json2.data.urls && json2.data.urls.length > 0) {
      lastEpisodeUrl = json2.data.urls[json2.data.urls.length - 1];
  }

  // Translate fetched data to Arabic
  const translatedDescription = await translate(json2.data.description, { to: 'ar' });
  const translatedGenre = await translate(json2.data.genre, { to: 'ar' });
  const translatedStatus = await translate(json2.data.status, { to: 'ar' });

  let message = `
*❃ ──────⊰ ❀ ⊱────── ❃*\n 
  ◍ *المانهوا :* ${json2.data.title}\n
  ◍ *الوصف :* ${translatedDescription.text}\n
  ◍ *التصنيف :* ${translatedGenre.text}\n
  ◍ *الحالة :* ${translatedStatus.text}\n
  ◍ *أخر فصل :* ${lastEpisodeUrl}\n
*❃ ──────⊰ ❀ ⊱────── ❃*
  `
  
  let thumb = json.data[0].image;

  await conn.sendMessage(m.chat, {
      image: { url: thumb },
      caption: message
  });
}

handler.help = ['manhwa'];
handler.tags = ['anime'];
handler.command = /^مانهوا/i;

export default handler;