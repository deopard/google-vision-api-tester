/*jshint esnext: true */
/*jshint node: true */
'use strict';
const pkg = require('./package.json');
const path = require('path');
const fs = require('fs');
const vision = require('google-vision-api-client');
const requtil = vision.requtil;
const ocrPath = 'images/ocr/';
const logoPath = 'images/logo/';
const authKey = pkg.authKey;

//Initialize the api
vision.init(authKey);

[
  { type: 'OCR', path: ocrPath, feature: 'TEXT_DETECTION' },
  { type: 'LOGO', path: logoPath, feature: 'LOGO_DETECTION' }
].forEach((item) => {
  if (!fs.existsSync(item.path))
    return;

  let promises = fs.readdirSync(ocrPath)
                   .map((p) => {
                     return inspect(
                       path.join(item.path, p),
                       item.type,
                       item.feature
                     );
                   });
  Promise.all(promises)
         .then((results) => {
           fs.writeFile(
             `result_${item.type}.json`,
             JSON.stringify({ results: results }),
             (err) => { err && console.error('ERROR:', err); }
           );
         });
});

function inspect (path, type, feature) {
  return new Promise((resolve, reject) => {
    console.log(`${type}`, path);
    //Build the request payloads
    var d = requtil.createRequests()
      .addRequest(
        requtil.createRequest(path)
          .withFeature(feature, 3)
          .build()
      );

    //Do query to the api server
    vision.query(d, function (err, r, data) {
      if (err) console.log('ERROR:', err);
      data.name = path;
      console.log(`${type}`, JSON.stringify(data) + '\n');
      resolve(data);
    });
  });
}
