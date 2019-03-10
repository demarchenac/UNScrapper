const rp = require('request-promise');
const $ = require('cheerio');
const url = 'https://guayacan.uninorte.edu.co/registro_pruebas/consulta_horarios.asp';

rp(url)
  .then(function(html){
    //success!
    //console.log($('#periodo option', html).length);
    //console.log($('#periodo option', html));
    let period = $('#periodo option', html);
    console.log("WELCOME TO: UNinorte Scrapper");
    console.log("    periodo: " +period[1].attribs.value);
})
  .catch(function(err){
    //handle error
    console.log("!");
    console.log(err);
  });