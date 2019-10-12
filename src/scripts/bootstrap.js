/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

var cdvModules = require('cordova/modules');

function makeRuntimeModule (id, exports) {
    cdvModules.define(id, function (r, e, m) { m.exports = exports; });
}

// Make all modules accessible during run time
makeRuntimeModule('cordova', require('cordova'));
makeRuntimeModule('cordova/argscheck', require('cordova/argscheck'));
makeRuntimeModule('cordova/base64', require('cordova/base64'));
makeRuntimeModule('cordova/builder', require('cordova/builder'));
makeRuntimeModule('cordova/channel', require('cordova/channel'));
makeRuntimeModule('cordova/exec/proxy', require('cordova/exec/proxy'));
makeRuntimeModule('cordova/init', require('cordova/init'));
makeRuntimeModule('cordova/modulemapper', require('cordova/modulemapper'));
makeRuntimeModule('cordova/pluginloader', require('cordova/pluginloader'));
makeRuntimeModule('cordova/urlutil', require('cordova/urlutil'));
makeRuntimeModule('cordova/utils', require('cordova/utils'));

// FIXME these have to be injected by platforms
makeRuntimeModule('cordova/platform', require('cordova/platform'));
makeRuntimeModule('cordova/exec', require('cordova/exec'));

// Initialize App
require('cordova/init')();

module.exports = require('cordova');
