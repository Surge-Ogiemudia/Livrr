// Run: node scripts/generate-icons.js
// Generates simple SVG-based PNG icons for the PWA manifest
// For production, replace with proper designed icons

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#6366f1';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.22);
  ctx.fill();

  // Letter L
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.55}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('L', size / 2, size / 2 + size * 0.03);

  return canvas.toBuffer('image/png');
}

try {
  const publicDir = path.join(__dirname, '..', 'public');
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), generateIcon(192));
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), generateIcon(512));
  console.log('Icons generated.');
} catch (e) {
  console.log('canvas package not available — use a design tool to create icon-192.png and icon-512.png in /public');
}
