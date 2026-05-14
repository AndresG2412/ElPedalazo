const fs = require('fs');
const lines = fs.readFileSync('d:/programacion/bici/app/admin/docsia/DataBaseElPedalazo.csv', 'utf8').split('\n');
const delimiter = ';';
const splitRegex = new RegExp(delimiter + '(?=(?:(?:[^"]*"){2})*[^"]*$)');
const headers = lines[0].split(splitRegex).map(h => h.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

let truncatedCount = 0;
for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;
  const values = lines[i].split(splitRegex);
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = values[index] ? values[index].trim().replace(/^"|"$/g, '').replace(/""/g, '"') : '';
  });
  
  if (obj.imagen && obj.imagen.startsWith('data:image/')) {
    if (obj.imagen.length >= 32700) {
      console.log(`Row ${i} image length: ${obj.imagen.length}`);
      truncatedCount++;
    }
  }
}
console.log('Total truncated:', truncatedCount);
