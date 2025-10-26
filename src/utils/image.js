const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function generateSummaryImage({ total, top5, timestamp }, outPath) {
  const width = 1000;
  const height = 700;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#111';
  ctx.font = 'bold 36px Sans';
  ctx.fillText('Country GDP Summary', 30, 60);

  ctx.font = '20px Sans';
  ctx.fillText(`Total countries: ${total}`, 30, 110);
  ctx.fillText(`Last refreshed: ${new Date(timestamp).toISOString()}`, 30, 140);

  ctx.font = '22px Sans';
  ctx.fillText('Top 5 countries by estimated GDP', 30, 190);

  ctx.font = '18px Sans';
  top5.forEach((c, idx) => {
    const y = 230 + idx * 40;
    const line = `${idx + 1}. ${c.name} — ${Number(
      c.estimated_gdp
    ).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    ctx.fillText(line, 40, y);
  });

  // write to disk
  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buffer);
}

module.exports = { generateSummaryImage };
