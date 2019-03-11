const fs = require('fs');
const rp = require('request-promise');
const $ = require('cheerio');
const _horario = 'https://guayacan.uninorte.edu.co/registro_pruebas/consulta_horarios.asp';



let NRCS = [];
rp(_horario)
  .then(function(html){
        var dptos = [];
        $('#departamento option', html).each((i, el) => {
            if(i > 1){
                dptos.push($('#departamento option', html)[i].attribs.value);
                //departamento.push($(el).attribs.value);
            }
        });
        let el_periodo = $('#periodo option', html);
        let periodo = el_periodo[1].attribs.value;
        var niveles = [];
        $('#nivel option', html).each((i, el) => {
            if(i > 0){
                niveles.push($('#nivel option', html)[i].attribs.value);
            }
        });
        for(let nivel of niveles){
            let nombre = "";
            nivel === "PR"? nombre = "Pregrado" : ""; 
            nivel === "PG"? nombre = "Postgrado" : ""; 
            nivel === "EC"? nombre = "Educación Continua" : ""; 
            nivel === "EX"? nombre = "Extracurricular" : ""; 
            for(let dpto of dptos){
                let options_dpto = {
                    method: 'POST',
                    uri: 'https://guayacan.uninorte.edu.co/registro_pruebas/resultado_departamento1.php',
                    formData: {
                        departamento: dpto,
                        valida: 'OK',
                        datos_periodo: periodo,
                        nom_periodo: 'Primer Semestre 2019',
                        datos_nivel: nivel,
                        nom_nivel: nombre,
                        BtnNRC: 'NRC'
                    }
                }
                rp(options_dpto)
                    .then((data) => {
                        $('#programa option', data).each((i, el)=>{
                            if(i > 0){
                                //console.log($(el).text().split("-")[0]);
                                let nrc = $(el).text().split("-")[0].slice(0, -1);
                                let options_nrc = {
                                    method: 'POST',
                                    uri: 'https://guayacan.uninorte.edu.co/registro_pruebas/acreditaciones_resultado.php',
                                    formData: {
                                        elegido: nrc,
                                        periodo: periodo
                                    } 
                                }
                                rp(options_nrc)
                                 .then((data) => {
                                     if($("div p strong",data)[3].next.data){
                                        if($("div p strong",data)[3].next.data.split("\\")[0] === "0"){
                                            console.log("empty");
                                        }else{
                                            $("tbody tr", data).each((i, el) => {
                                                if(i > 0){
                                                    NRCS.push(periodo +";" 
                                                            +nivel +";" 
                                                            +dpto +";"
                                                            +$(el).text().split("-")[0].slice(0, -1) +";"
                                                            +$($("tbody tr td", data)[3], data).text() +";"
                                                            +$($("tbody tr td", data)[4], data).text() +";"
                                                            +$($("tbody tr td", data)[5], data).text());
                                                }
                                            });  
                                        }
                                    }else{
                                        console.log("undefined");
                                    }
                                 })
                                 .catch((err) => {console.log("!!"); console.log(err);});
                            }
                        });
                    })
                    .catch((err) => {
                        console.log("!!!");
                        console.log(err);
                    });
            }
        }
        setTimeout( 
            () =>{
                let uniqueNRC = unique(NRCS);
                var file = fs.createWriteStream('NRCs.txt');
                file.on('error', function(err) { console.log("!!!!"); console.log(err)});
                uniqueNRC.forEach(element => {
                    file.write(element +"\n");
                });
                file.end();
            }, 60000);
    })
    .catch(function(err){
        console.log("!");
        console.log(err);
    });

function unique(arr) {
    var seen = {};
    return arr.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}