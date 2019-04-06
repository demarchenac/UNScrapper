const fs = require('fs');
const path = require('path');
const rp = require('request-promise');
const $ = require('cheerio');
const _DOMAIN = '';
const _SCHEDULE = '';
const filePath = path.join(__dirname, '');

var lessons = [];

const rng = (min, max) => {
	return 1000 * Math.ceil(Math.random() * (max - min) + min);
};

const querySemesterInfo = () => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			rp(_DOMAIN + _SCHEDULE)
				.then((html) => {
					let departamentos = [];
					$('#departamento option', html).each((i, el) => {
						if (i > 0) {
							departamentos.push(el.attribs.value);
						}
					});
					let start = 1;
					let p_regex = new RegExp(/\d{4}(10|30)/g);
					while (!p_regex.test($('#periodo option', html)[start].attribs.value)) {
						start++;
					}
					let periodo = $('#periodo option', html)[start].attribs.value;
					let niveles = [];
					$('#nivel option', html).each((i, el) => {
						if (i > 0) {
							niveles.push(el.attribs.value);
						}
					});
					let response = {
						_periodo       : periodo,
						_niveles       : niveles,
						_departamentos : departamentos
					};
					resolve(response);
				})
				.catch((err) => {
					reject(err);
				});
		}, 500);
	});
};

const queryNRCInfo = (options) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			rp(options)
				.then((html) => {
					let res;
					if ($('div div div', html).children().length > 0) {
						let days = [];
						let multiple_lessons = false;
						let weekdays = [];
						let nombre = $('p.msg1 b', html).text().toString().slice(1);
						let materia = '';
						let grupo = '';
						let arr = $($('p', html)[1]).text().toString().trim().split(':');
						materia = arr[1].match(/[A-Z]{3} \d{4}/g)[0];
						grupo = arr[2].match(/\d{2}/g) == null ? '00' : arr[2].match(/\d{2}/g)[0];
						$('tr', html).each((i, el) => {
							if (i > 0) {
								let day = {
									start   : '',
									end     : '',
									weekday : '',
									hours   : '',
									room    : ''
								};
								weekdays = [];
								$('td', el).each((j, obj) => {
									switch (j) {
										case 0:
											day.start = obj.children[0].data.slice(0, -1);
											break;
										case 1:
											day.end = obj.children[0].data.slice(0, -1);
											break;
										case 3:
											if (obj.children[0] != undefined) {
												if (obj.children[0].data.length == 1) {
													switch (obj.children[0].data) {
														case 'M':
															day.weekday = 'Lunes';
															break;
														case 'T':
															day.weekday = 'Martes';
															break;
														case 'W':
															day.weekday = 'Miercoles';
															break;
														case 'R':
															day.weekday = 'Jueves';
															break;
														case 'F':
															day.weekday = 'Viernes';
															break;
														case 'S':
															day.weekday = 'Sabado';
															break;
													}
												} else {
													multiple_lessons = true;
													let letters = obj.children[0].data.toString().split('');
													for (letter of letters) {
														switch (letter) {
															case 'M':
																weekdays.push('Lunes');
																break;
															case 'T':
																weekdays.push('Martes');
																break;
															case 'W':
																weekdays.push('Miercoles');
																break;
															case 'R':
																weekdays.push('Jueves');
																break;
															case 'F':
																weekdays.push('Viernes');
																break;
															case 'S':
																weekdays.push('Sabado');
																break;
														}
													}
												}
											} else {
												day.weekday = '';
											}
											break;
										case 4:
											day.hours = obj.children[0].data;
											break;
										case 5:
											day.room = obj.children[0].data;
											break;
									}
								});
								let temp_day;
								if (weekdays.length == 0) {
									days.push(day);
								} else {
									for (let weekday of weekdays) {
										temp_day = day;
										temp_day.weekday = weekday;
										days.push(temp_day);
									}
								}
							}
						});
						res = {
							materia : materia,
							nombre  : nombre,
							grupo   : grupo,
							dias    : days
						};
					} else {
						res = undefined;
					}
					resolve(res);
				})
				.catch((err) => {
					reject(err);
				});
		}, rng(1, 2));
	});
};

const queryDepartmentInfo = (options) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			rp(options)
				.then((html) => {
					let nrcs = [];
					let nrc_number = '';
					let n_options, res;
					$('#programa option', html).each(async (i, el) => {
						if (i > 0) {
							nrc_number = el.attribs.value.toString().split('-')[0].trim();
							nrcs.push(nrc_number);
						}
					});
					resolve(nrcs);
				})
				.catch((err) => {
					reject(err);
				});
		}, rng(1, 2));
	});
};

querySemesterInfo()
	.then(async (response) => {
		let nombre_periodo = '';
		let coincidencia = response._periodo.match(/\d{4}/g);
		let semestre = response._periodo.slice(4);
		semestre == '10' ? (nombre_periodo = 'Primer Semestre ' + coincidencia) : '';
		semestre == '30' ? (nombre_periodo = 'Segundo Semestre ' + coincidencia) : '';
		let nombre_nivel = '';
		for (let nivel of response._niveles) {
			nivel === 'PR' ? (nombre_nivel = 'Pregrado') : '';
			nivel === 'PG' ? (nombre_nivel = 'Postgrado') : '';
			nivel === 'EC' ? (nombre_nivel = 'Educación Continua') : '';
			nivel === 'EX' ? (nombre_nivel = 'Extracurricular') : '';
			for (let departamento of response._departamentos) {
				let d_options = {
					method   : 'POST',
					uri      : _DOMAIN + 'resultado_departamento1.php',
					formData : {
						departamento  : departamento,
						valida        : 'OK',
						datos_periodo : response._periodo,
						nom_periodo   : nombre_periodo,
						datos_nivel   : nivel,
						nom_nivel     : nombre_nivel,
						BtnNRC        : 'NRC'
					}
				};
				let numbers = await queryDepartmentInfo(d_options);
				for (number of numbers) {
					let n_options = {
						method   : 'POST',
						uri      : _DOMAIN + 'acreditaciones_resultado.php',
						formData : {
							elegido : number,
							periodo : response._periodo
						}
					};
					let res = await queryNRCInfo(n_options);
					if (res != undefined) {
						for (let dia of res.dias) {
							let lesson = {
								periodo      : response._periodo,
								nivel        : nombre_nivel,
								departamento : departamento,
								nrc          : number,
								materia      : res.materia,
								grupo        : res.grupo,
								fecha_inicio : dia.start,
								fecha_fin    : dia.end,
								dia_semana   : dia.weekday,
								horas        : dia.hours,
								salon        : dia.room
							};
							lessons.push(lesson);
						}
					}
				}
			}
		}
		let lessons_JSON = JSON.stringify(lessons);
		fs.writeFile(filePath, lessons_JSON, 'utf8', (err) => {
			if (err) {
				console.log('An error occured while writing JSON Object to File.');
				return console.log(err);
			}
		});
	})
	.catch((err) => {
		console.log(err);
	});
