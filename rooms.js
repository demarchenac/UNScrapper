let fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'rooms-prod.json');
let string_version = fs.readFileSync('./lessons-prod.json');
let lessons = JSON.parse(string_version);
let data = [];
for (const lesson of lessons) {
	data.push(lesson.salon);
}
let unrepeatedRooms = Array.from(new Set(data)).sort();
let rooms = [];
let week = [];
let weekday = {
	nombre         : '',
	disponibilidad : []
};

const isValid = (text) => {
	if (
		text == 'BKCP - L5-5' ||
		text == 'BLOI1 - SACOI' ||
		text == 'BLOI2 -' ||
		text == 'BLOI2 - ' ||
		text == 'BLOQM - 1M' ||
		text == 'BLOQM - 2M' ||
		text == 'BLOQM - 3M' ||
		text == 'BLOQM - 4M' ||
		text == 'CANCH - CDA-3L' ||
		text == 'COLIS - CAB1' ||
		text == 'COLIS - CAB2' ||
		text == 'COLIS - CAB3' ||
		text == 'COLIS - SAL1' ||
		text == 'CSJ - CJ11' ||
		text == 'CSJ - CJ12' ||
		text == 'CSJ - CJ13' ||
		text == 'CSJ - SDR 1' ||
		text == 'CSJ - SDR 2' ||
		text == 'CSJ - SDR 3' ||
		text == 'L1 - L1-1' ||
		text == 'L1 - L1-3' ||
		text == 'L1 - L1-4' ||
		text == 'L1 - L1-5' ||
		text == 'L2 - L2-2' ||
		text == 'L2 - L2-3' ||
		text == 'L2 - L2-4' ||
		text == 'L3 - L3-2' ||
		text == 'L4 - 2-1 L4' ||
		text == 'L4 - 2-2 L4' ||
		text == 'L4 - 2-3 L4' ||
		text == 'L4 - 2-4 L4' ||
		text == 'L5 - LJ-1' ||
		text == 'SPACE - EMP' ||
		text == 'SPACE - NNS' ||
		text == 'SPACE - VIRT'
	) {
		return false;
	} else {
		return true;
	}
};

const getIndexOfHour = (text) => {
	if (text == '0630') {
		return 0;
	} else if (text == '0730') {
		return 1;
	} else if (text == '0830') {
		return 2;
	} else if (text == '0930') {
		return 3;
	} else if (text == '1030') {
		return 4;
	} else if (text == '1130') {
		return 5;
	} else if (text == '1230') {
		return 6;
	} else if (text == '1330') {
		return 7;
	} else if (text == '1430') {
		return 8;
	} else if (text == '1530') {
		return 9;
	} else if (text == '1630') {
		return 10;
	} else if (text == '1730') {
		return 11;
	} else if (text == '1830') {
		return 12;
	} else if (text == '1930') {
		return 13;
	} else if (text == '2030') {
		return 14;
	}
};

let lunes = [
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false
];
let martes = [
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false
];
let miercoles = [
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false
];
let jueves = [
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false
];
let viernes = [
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false
];
let sabado = [
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false
];
let inicial, final, duracion, room;
for (const iteration of unrepeatedRooms) {
	if (isValid(iteration)) {
		week = [];
		lunes = [
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false
		];
		martes = [
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false
		];
		miercoles = [
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false
		];
		jueves = [
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false
		];
		viernes = [
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false
		];
		sabado = [
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false
		];
		for (const lesson of lessons) {
			if (lesson.salon == iteration) {
				inicial = lesson.horas.split('-')[0].trim();
				final = lesson.horas.split('-')[1].trim();
				duracion = Math.ceil((parseInt(final) - parseInt(inicial)) / 100);
				if (lesson.dia_semana == 'Lunes') {
					for (let i = getIndexOfHour(inicial); i <= getIndexOfHour(inicial) + duracion; i++) {
						lunes[i] = true;
					}
				} else if (lesson.dia_semana == 'Martes') {
					for (let i = getIndexOfHour(inicial); i <= getIndexOfHour(inicial) + duracion; i++) {
						martes[i] = true;
					}
				} else if (lesson.dia_semana == 'Miercoles') {
					for (let i = getIndexOfHour(inicial); i <= getIndexOfHour(inicial) + duracion; i++) {
						miercoles[i] = true;
					}
				} else if (lesson.dia_semana == 'Jueves') {
					for (let i = getIndexOfHour(inicial); i <= getIndexOfHour(inicial) + duracion; i++) {
						jueves[i] = true;
					}
				} else if (lesson.dia_semana == 'Viernes') {
					for (let i = getIndexOfHour(inicial); i <= getIndexOfHour(inicial) + duracion; i++) {
						viernes[i] = true;
					}
				} else if (lesson.dia_semana == 'Sabado') {
					for (let i = getIndexOfHour(inicial); i <= getIndexOfHour(inicial) + duracion; i++) {
						sabado[i] = true;
					}
				}
			}
		}
		weekday = {
			nombre         : 'Lunes',
			disponibilidad : lunes
		};
		week.push(weekday);
		weekday = {
			nombre         : 'Martes',
			disponibilidad : martes
		};
		week.push(weekday);
		weekday = {
			nombre         : 'Miercoles',
			disponibilidad : miercoles
		};
		week.push(weekday);
		weekday = {
			nombre         : 'Jueves',
			disponibilidad : jueves
		};
		week.push(weekday);
		weekday = {
			nombre         : 'Viernes',
			disponibilidad : viernes
		};
		week.push(weekday);
		weekday = {
			nombre         : 'Sabado',
			disponibilidad : sabado
		};
		week.push(weekday);
		room = {
			nombre : iteration,
			semana : week
		};
		rooms.push(room);
	}
}
console.log(data.length + ' -> ' + unrepeatedRooms.length + ' -> ' + rooms.length);
let rooms_JSON = JSON.stringify(rooms);
fs.writeFile(filePath, rooms_JSON, 'utf8', (err) => {
	if (err) {
		console.log('An error occured while writing JSON Object to File.');
		return console.log(err);
	}
});
