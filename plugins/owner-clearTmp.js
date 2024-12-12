import { tmpdir } from 'os';
import path, { join } from 'path';
import { readdirSync, unlinkSync, rmSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cleanTempAndSession = () => {
  try {
    console.log(`Starting cleanup process...`);

    // Define the temp directories
    const tmp = [tmpdir(), join(__dirname, '../tmp')];
    const filename = [];

    // Collect all files from the temp directories
    tmp.forEach((dirname) => {
      if (existsSync(dirname)) {
        readdirSync(dirname).forEach((file) => filename.push(join(dirname, file)));
      }
    });

    // Session bot directory cleaning
    const sessionDir = "./session";
    if (existsSync(sessionDir)) {
      readdirSync(sessionDir).forEach((file) => {
        if (file !== 'creds.json') {
          try {
            rmSync(join(sessionDir, file), { recursive: true, force: true });
            console.log(`Deleted session file: ${file}`);
          } catch (error) {
            console.error(`Failed to delete session file ${file}:`, error);
          }
        }
      });
    }

    // Delete each file in the temp directories
    filename.forEach((file) => {
      try {
        if (existsSync(file)) {
          unlinkSync(file);
          console.log(`Deleted temp file: ${file}`);
        }
      } catch (error) {
        console.error(`Failed to delete temp file ${file}:`, error);
      }
    });

    console.log(`Cleanup completed successfully.`);
  } catch (err) {
    console.error(`Error during cleanup:`, err);
  }
};

// Handler for manual command
let handler = async (m, { conn, args }) => {
  m.reply(`✅ *تمت عملية تنظيف الملفات المؤقتة*`);
  cleanTempAndSession();
};

handler.help = ['cleartmp'];
handler.tags = ['owner'];
handler.command = /^(اصلاح)$/i;
handler.rowner = true;

export default handler;

// Automatically clean temp and session every hour
setInterval(() => {
  console.log(`Running automatic hourly cleanup...`);
  cleanTempAndSession();
}, 60 * 60 * 1000); // Every 1 hour (60 minutes * 60 seconds * 1000 ms)