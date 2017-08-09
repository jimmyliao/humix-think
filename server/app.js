/**
* © Copyright IBM Corp. 2016
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**/

var express = require('express'),
    log = require('logule').init(module, 'APP'),
    path = require('path'),
    bodyParser = require('body-parser'),
    RED = require('node-red'),
    http = require('http'),
    api = require('./api');
    sense = require('./sense');

var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();
var humixSettings = require('../humix-settings.js');

// Adjust Configuration
if (humixSettings.storage === 'couch'){
  humixSettings.storageModule = require('./lib/storage/couch');

  if (humixSettings.location === 'bluemix' && !humixSettings.couchUrl){

    var storageServiceName = 'Humix-Cloudant-Service'
    var couchService = appEnv.getService(storageServiceName);

    if (!couchService) {
      console.log("Failed to find Cloudant service");
      throw new Error("No cloudant service found");
    } else {
      humixSettings.couchUrl = couchService.credentials.url;
    }
  }

} else if (humixSettings.storage === 'redis') {
  humixSettings.storageModule = require('./lib/storage/redis');
}

function appInit(settings) {
  var app = module.exports = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  var port = process.env.PORT  || settings.port;
  var httpServer = http.createServer(app);

  console.log('Using humix setting:'+JSON.stringify(settings));

  RED.init(httpServer, settings);
  app.use(settings.httpAdminRoot, RED.httpAdmin);
  app.use(settings.httpNodeRoot, RED.httpNode);

  app.RED = RED;

  // api init
  api.init(app, settings);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
      error: err.message
    });
  });

  //var sense = humixSettings.storageModule;

  sense.start(httpServer, RED, settings);
  RED.start();

  httpServer.listen(port);
  log.info('Server listening on port: ' + port);


  process.on('SIGINT', function() {
    RED.stop();
    sense.stop();
    log.info('Server shutting down');
    process.exit();
  });
}

//main entry
humixSettings.storageModule.init(humixSettings)
.then(appInit(humixSettings))
.catch(function(err) {
  console.error(`backend initialization failed: ${err}, existed`);
});


