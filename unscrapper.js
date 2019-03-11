const fs = require('fs');
const rp = require('request-promise');
const $ = require('cheerio');
const _horario = 'https://guayacan.uninorte.edu.co/registro_pruebas/consulta_horarios.asp';

var d_i = 0;
var n_i = 0;

let NRCS = [];
rp(_horario)
  .then(function(html){
        var dptos = [];
        $('#departamento option', html).each((i) => {
            if(i > 1){
                dptos.push($('#departamento option', html)[i].attribs.value);
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
                        d_i++;
                        console.log("+d_i: " +d_i);
                        $('#programa option', data).each((i, el)=>{
                            if(i > 0){
                                
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
                                     n_i++;
                                     console.log("-n_i: " +n_i)
                                     if($("div p strong",data)[3].next.data){
                                        if($("div p strong",data)[3].next.data.split("\\")[0] === "0"){
                                            console.log("empty");
                                        }else{
                                            $("tbody tr", data).each((i) => {
                                                if(i > 0){
                                                    let info = periodo +";" 
                                                               +nivel +";" 
                                                               +dpto +";"
                                                               +nrc +";"
                                                               +$($("tbody tr td", data)[3], data).text() +";"
                                                               +$($("tbody tr td", data)[4], data).text() +";"
                                                               +$($("tbody tr td", data)[5], data).text()
                                                    NRCS.push(info);
                                                }
                                            });  
                                        }
                                    }else{
                                        console.log("undefined");
                                    }
                                 })
                                 .catch((err) => { console.log("ERR 003 AT LOADING NRC INFO!"
                                                              +"\nRequests made " +n_i); });
                            }
                        });
                    })
                    .catch((err) => { console.log("ERR 002 AT LOADING DEPARTMENTS!" 
                                                 +"\nRequests made " +d_i); });
            }
        }
        setTimeout( 
            () =>{
                console.log("removing repeated data!");
                let uniqueNRC = unique(NRCS);
                console.log("writing in file!")
                var file = fs.createWriteStream('NRCs.txt');
                file.on('error', function(err) { console.log("ERR 004 AT FILE WRITING!"); });
                uniqueNRC.forEach((element, i) => {
                    console.log("writing line #" +i);
                    file.write(element +"\n");
                });
                file.end();
            }, 300000);
    })
    .catch(function(err){ console.log("ERR 001 AT MAIN HTML READING!"); });

function unique(arr) {
    var seen = {};
    return arr.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}