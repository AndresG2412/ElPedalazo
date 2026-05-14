const fs = require('fs');
const lines = fs.readFileSync('d:/programacion/bici/app/admin/docsia/DataBaseElPedalazo.csv', 'utf8').split('\n');
const delimiter = ';';
const splitRegex = new RegExp(delimiter + '(?=(?:(?:[^"]*"){2})*[^"]*$)');
const headers = lines[0].split(splitRegex).map(h => h.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

const values = lines[1].split(splitRegex);
const obj = {};
headers.forEach((header, index) => {
  obj[header] = values[index] ? values[index].trim().replace(/^"|"$/g, '').replace(/""/g, '"') : '';
});

const base64Str = obj.imagen;
console.log('Length:', base64Str.length);
console.log('Ends with:', base64Str.slice(-20));
console.log('Contains spaces:', base64Str.includes(' '));
console.log('Contains semicolons inside data:', base64Str.substring(22).includes(';')); // base64 part
console.log('Contains newlines:', base64Str.includes('\n') || base64Str.includes('\r'));
