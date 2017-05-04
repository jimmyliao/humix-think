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


var apiRoutes = require('express').Router(),
    modules = require('./modules'),
    status = require('./status');


function init(adminApp, settings) {

    //modules.init(settings);
    //var modules = settings.storageModule;
    //console.log('modules:'+JSON.stringify(modules));
    //status.init(modules);
    // Devices
    apiRoutes.post('/registerDevice', modules.register);
    //apiRoutes.delete('/devices/', modules.unregisterall);
    apiRoutes.delete('/devices/:senseId', modules.unregister);
    apiRoutes.get('/devices', modules.getAllDevices);
    apiRoutes.get('/devices/:senseId', modules.getDevice);
    apiRoutes.get('/devices/:senseId/modules', modules.getDeviceModules);
    apiRoutes.delete('/devices/:senseId/modules/:moduleId', modules.unregisterModule);
    apiRoutes.get('/devices/:senseId/modules/:moduleName/events', modules.getDeviceModuleEvents);
    apiRoutes.get('/devices/:senseId/modules/:moduleName/commands', modules.getDeviceModuleCommands);

    // Status
    apiRoutes.get('/status/:senseId', status.getSenseStatus);
    apiRoutes.get('/status/:senseId/modules', status.getAllModuleStatus);
    apiRoutes.get('/status/:senseId/modules/:moduleId', status.getModuleStatus);

    adminApp.use('/api', apiRoutes);
}

module.exports = {
    init: init
};