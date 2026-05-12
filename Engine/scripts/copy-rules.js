import fs from 'fs';
import path from 'path';

const sourceFile = 'ai-vision-scraper-rules.md';
const sourcePath = path.join(process.cwd(), sourceFile);

// npm install çalıştırıldığında kuran kişinin proje dizini INIT_CWD üzerinden alınır
// Fallback olarak node_modules klasörüne göre iki dizin yukarı çıkılır (eğer local yüklenmişse)
const targetDir = process.env.INIT_CWD || path.resolve(process.cwd(), '..', '..');
const targetPath = path.join(targetDir, sourceFile);

try {
    if (fs.existsSync(sourcePath)) {
        // Eğer kurulum projenin kendi kökünde olmuyorsa kopyala
        if (sourcePath !== targetPath) {
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`[ai-vision-scraper] Rules successfully copied to ${targetPath}`);
        }
    } else {
        console.warn(`[ai-vision-scraper] Could not find ${sourceFile} in ${sourcePath}`);
    }
} catch (error) {
    console.error(`[ai-vision-scraper] Error copying rules: ${error.message}`);
}
