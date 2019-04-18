let fs = require('fs');
let string_version = fs.readFileSync('./lessons-prod.json');
let clases = JSON.parse(string_version);
const firebase = require('firebase');
// Required for side-effects
require('firebase/firestore');

// Initialize Cloud Firestore through Firebase
firebase.initializeApp({
	apiKey     : '',
	authDomain : '',
	projectId  : ''
});

var db = firebase.firestore();
for (let i = 20000; i < clases.length; i++) {
	setTimeout(() => {
		const clase = clases[i];
		const h_i = clase.horas.split('-')[0].trim();
		const h_f = clase.horas.split('-')[1].trim();
		const dur = Math.ceil((parseInt(h_f) - parseInt(h_i)) / 100);
		//console.log('( ' + h_f + ' - ' + h_i + ' ) / 100 = ' + dur);
		db
			.collection('clases')
			.add({
				periodo        : clase.periodo,
				nivel          : clase.nivel,
				departamento   : clase.departamento,
				nrc            : clase.nrc,
				codigo_materia : clase.materia,
				grupo          : clase.grupo,
				fecha_inicio   : clase.fecha_inicio,
				fecha_fin      : clase.fecha_fin,
				dia            : clase.dia_semana,
				hora_inicio    : h_i,
				hora_fin       : h_f,
				duracion       : dur,
				salon          : clase.salon
			})
			.then(function (docRef) {
				console.log(i + ' of ' + clases.length + ' has ID: ', docRef.id);
			});
	}, i * 1);
}
/*
{
	
}
*/
