// Optimization script — convert heavy images to WebP and clean up unused files
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

async function optimize() {
    console.log('=== GoRodadero Image Optimization ===\n');

    // 1. Convert rodadero-fullscreen.jpg to WebP (REFERENCED in code)
    console.log('1. Converting rodadero-fullscreen.jpg → WebP...');
    const bgInput = path.join(IMAGES_DIR, 'rodadero-fullscreen.jpg');
    const bgOutput = path.join(IMAGES_DIR, 'rodadero-fullscreen.webp');
    await sharp(bgInput)
        .resize(1080, null, { withoutEnlargement: true }) // max 1080px wide (mobile)
        .webp({ quality: 75 })
        .toFile(bgOutput);
    const bgSize = fs.statSync(bgOutput).size;
    console.log(`   ✓ rodadero-fullscreen.webp: ${(bgSize / 1024).toFixed(1)} KB (was 1053 KB)\n`);

    // 2. Convert category images to WebP (REFERENCED in code)
    console.log('2. Compressing category images...');
    const catFiles = fs.readdirSync(IMAGES_DIR).filter(f => f.startsWith('cat-') && f.endsWith('.jpg'));
    for (const file of catFiles) {
        const input = path.join(IMAGES_DIR, file);
        const output = path.join(IMAGES_DIR, file.replace('.jpg', '.webp'));
        await sharp(input)
            .resize(400, null, { withoutEnlargement: true })
            .webp({ quality: 75 })
            .toFile(output);
        const newSize = fs.statSync(output).size;
        const oldSize = fs.statSync(input).size;
        console.log(`   ✓ ${file} → .webp: ${(newSize / 1024).toFixed(1)} KB (was ${(oldSize / 1024).toFixed(1)} KB)`);
    }

    // 3. List files to delete (NOT referenced anywhere in the project)
    console.log('\n3. Files safe to delete (not referenced):');
    const toDelete = [
        path.join(IMAGES_DIR, 'logo-full.png'),           // 1267 KB - not referenced
        path.join(IMAGES_DIR, 'go-rodadero-logo.png'),     // 1267 KB - not referenced
        path.join(IMAGES_DIR, 'hero-rodadero-v2.jpg'),     // 733 KB - not referenced
        path.join(PUBLIC_DIR, 'hero-rodadero.png'),        // 527 KB - not referenced (root)
        path.join(IMAGES_DIR, 'logo-icon.png'),            // 475 KB - not referenced
        path.join(IMAGES_DIR, 'hero-caribbean.jpg'),       // 271 KB - not referenced
        path.join(IMAGES_DIR, 'hero-playa-rodadero.jpg'),  // 239 KB - not referenced
        path.join(IMAGES_DIR, 'rodadero-bg.jpg'),          // 65 KB - not referenced (old bg)
    ];

    let deletedBytes = 0;
    for (const file of toDelete) {
        if (fs.existsSync(file)) {
            const size = fs.statSync(file).size;
            deletedBytes += size;
            fs.unlinkSync(file);
            console.log(`   ✗ Deleted: ${path.basename(file)} (${(size / 1024).toFixed(1)} KB)`);
        }
    }
    console.log(`   Total deleted: ${(deletedBytes / 1024).toFixed(1)} KB\n`);

    // 4. Delete original JPGs that were converted to WebP
    console.log('4. Replacing originals with WebP versions...');
    // rodadero-fullscreen.jpg → keep .webp, delete .jpg
    if (fs.existsSync(bgOutput)) {
        fs.unlinkSync(bgInput);
        console.log('   ✗ Deleted original: rodadero-fullscreen.jpg');
    }
    for (const file of catFiles) {
        const jpgPath = path.join(IMAGES_DIR, file);
        const webpPath = path.join(IMAGES_DIR, file.replace('.jpg', '.webp'));
        if (fs.existsSync(webpPath)) {
            fs.unlinkSync(jpgPath);
            console.log(`   ✗ Deleted original: ${file}`);
        }
    }

    // 5. Final summary
    console.log('\n=== Final Summary ===');
    const remaining = fs.readdirSync(IMAGES_DIR).filter(f => !f.startsWith('.'));
    let totalSize = 0;
    for (const file of remaining) {
        const size = fs.statSync(path.join(IMAGES_DIR, file)).size;
        totalSize += size;
        console.log(`   ${(size / 1024).toFixed(1)} KB\t${file}`);
    }
    console.log(`\n   TOTAL images/: ${(totalSize / 1024).toFixed(1)} KB`);
    console.log('   ✅ Optimization complete!');
}

optimize().catch(console.error);
