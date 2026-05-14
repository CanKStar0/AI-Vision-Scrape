import fs from 'fs';
import path from 'path';

const filesToCopy = [
    'ai-vision-scraper-rules.md',
    '.env-vision-example'
];

// npm install çalıştırıldığında kuran kişinin proje dizini INIT_CWD üzerinden alınır
// Fallback olarak node_modules klasörüne göre iki dizin yukarı çıkılır (eğer local yüklenmişse)
const targetDir = process.env.INIT_CWD || path.resolve(process.cwd(), '..', '..');

filesToCopy.forEach(file => {
    const sourcePath = path.join(process.cwd(), file);
    const targetPath = path.join(targetDir, file);

    try {
        if (fs.existsSync(sourcePath)) {
            // Eğer kurulum projenin kendi kökünde olmuyorsa kopyala
            if (sourcePath !== targetPath) {
                fs.copyFileSync(sourcePath, targetPath);
                console.log(`[ai-vision-scraper] ${file} successfully copied to ${targetPath}`);
            }
        } else {
            console.warn(`[ai-vision-scraper] Could not find ${file} in ${sourcePath}`);
        }
    } catch (error) {
        console.error(`[ai-vision-scraper] Error copying ${file}: ${error.message}`);
    }
});
