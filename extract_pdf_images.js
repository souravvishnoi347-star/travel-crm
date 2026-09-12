const fs = require('fs');
const path = require('path');

// Extract binary image objects from a raw PDF buffer
function extractImagesFromPdf(pdfPath, outputDir, prefix) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const data = fs.readFileSync(pdfPath);
  let count = 0;
  let pos = 0;

  // Search for JPEG markers FF D8 ... FF D9
  while (pos < data.length - 4) {
    if (data[pos] === 0xFF && data[pos + 1] === 0xD8 && data[pos + 2] === 0xFF) {
      const start = pos;
      let end = start + 3;
      let foundEnd = false;
      while (end < data.length - 1) {
        if (data[end] === 0xFF && data[end + 1] === 0xD9) {
          foundEnd = true;
          end += 2;
          break;
        }
        end++;
      }

      if (foundEnd) {
        const imgBuffer = data.slice(start, end);
        // Discard very small icons (< 5KB)
        if (imgBuffer.length > 5000) {
          count++;
          const outName = `${prefix}_img_${count}.jpg`;
          const outPath = path.join(outputDir, outName);
          fs.writeFileSync(outPath, imgBuffer);
          console.log(`Saved ${outName} (${Math.round(imgBuffer.length / 1024)} KB)`);
        }
        pos = end;
        continue;
      }
    }
    pos++;
  }
  console.log(`Total extracted from ${path.basename(pdfPath)}: ${count} images.`);
}

const publicGalleryDir = path.join(__dirname, 'public', 'gallery');
extractImagesFromPdf('CHARDHAM YATRA D PACKAGE 12P 2026.pdf', publicGalleryDir, 'chardham_10d');
extractImagesFromPdf('chardham yatra from mathura 2026 (1).pdf', publicGalleryDir, 'chardham_mathura');
