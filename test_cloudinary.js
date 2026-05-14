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

async function testUpload() {
  const formData = new FormData();
  formData.append('file', base64Str);
  formData.append('upload_preset', 'El Pedalazo');
  
  try {
    const response = await fetch('https://api.cloudinary.com/v1_1/duwosb0hu/image/upload', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

testUpload();
