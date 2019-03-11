const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'NRCs.txt');



function copyData(savPath, srcPath) {
    fs.readFile(srcPath, 'utf8', function (err, data) {
        if (err) throw err;
        //Do your processing, MD5, send a satellite to the moon, etc.
        fs.writeFile (savPath, data, function(err) {
            if (err) throw err;
            console.log('complete');
        });
    });
}