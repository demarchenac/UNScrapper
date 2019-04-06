let fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '');
let string_version = fs.readFileSync('');
let lessons = JSON.parse(string_version);
const uniqueArray = lessons.filter((lesson, index) => {
	return (
		index ===
		lessons.findIndex((obj) => {
			return JSON.stringify(obj) === JSON.stringify(lesson);
		})
	);
});
let lessons_JSON = JSON.stringify(uniqueArray);
fs.writeFile(filePath, lessons_JSON, 'utf8', (err) => {
	if (err) {
		console.log('An error occured while writing JSON Object to File.');
		return console.log(err);
	}
});
