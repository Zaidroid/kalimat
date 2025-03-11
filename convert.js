// convert.js
const fs = require('fs');

const inputFile = './src/data/dict.txt';
const outputFile = './src/data/dict.ts';

fs.readFile(inputFile, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading dict.txt:', err);
    return;
  }
  // Split by newline, filter out empty lines
  const words = data.split('\n').filter((word) => word.trim() !== '');
  const tsContent = `export const DICT = ${JSON.stringify(words, null, 2)};`;
  fs.writeFile(outputFile, tsContent, (err) => {
    if (err) {
      console.error('Error writing dict.ts:', err);
      return;
    }
    console.log('dict.ts created successfully!');
  });
});
