const fs = require('fs');
const lines = fs.readFileSync('d:/programacion/bici/app/admin/docsia/DataBaseElPedalazo.csv', 'utf8').split('\n');
const delimiter = ';';
const splitRegex = new RegExp(delimiter + '(?=(?:(?:[^"]*"){2})*[^"]*$)');
console.log('Headers:', lines[0].split(splitRegex).length);
console.log('Line 1 match:', lines[1].split(splitRegex).length);
console.log('Line 1 data:', lines[1].split(splitRegex).map((v, i) => i + ': ' + v.substring(0, 50)));
