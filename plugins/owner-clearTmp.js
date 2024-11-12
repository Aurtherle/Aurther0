import { tmpdir } from 'os';
import path, { join } from 'path';
import { readdirSync, unlinkSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';

let handler = async (m, { conn, args }) => {
  // Send a confirmation reply
  m.reply(`✅ *تمت*`);
  m.react(done);

  // Define the temp directories
  const tmp = [tmpdir(), join(__dirname, '../tmp')];
  const filename = [];

  // Collect all files from the temp directories
  tmp.forEach((dirname) => {
    readdirSync(dirname).forEach((file) => filename.push(join(dirname, file)));
  });

  // Session bot directory cleaning
  readdirSync("./session").forEach((file) => {
    if (file !== 'creds.json') {
      // Use rmSync for recursive deletion if needed
      rmSync(join("./session", file), { force: true });
    }
  });

  // Delete each file in the temp directories
  filename.forEach((file) => {
    try {
      unlinkSync(file);
    } catch (error) {
      console.error(`Failed to delete file ${file}:`, error);
    }
  });
};

// Required if using ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

handler.help = ['cleartmp'];
handler.tags = ['owner'];
handler.command = /^(اصلاح)$/i;
handler.rowner = true;

export default handler;
