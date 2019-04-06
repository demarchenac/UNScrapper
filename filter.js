let fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '');
let string_version = fs.readFileSync('');
let lessons = JSON.parse(string_version);
for (let i = lessons.length - 1; i >= 0; i--) {
	if (lessons[i].dia_semana == '' || lessons[i].horas == ' - ' || lessons[i].salon == ' - ') {
		lessons.splice(i, 1);
	}
}
let lessons_JSON = JSON.stringify(lessons);
fs.writeFile(filePath, lessons_JSON, 'utf8', (err) => {
	if (err) {
		console.log('An error occured while writing JSON Object to File.');
		return console.log(err);
	}
});
