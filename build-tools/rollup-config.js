const path = require('path');
const escapeStringRegexp = require('escape-string-regexp');
const commonjs = require('@rollup/plugin-commonjs');
const alias = require('@rollup/plugin-alias');
const virtual = require('@rollup/plugin-virtual');
const getBuildId = require('./build-id');
const { collectModules, pkgRoot } = require('./common');

module.exports = async userConfig => {
    const config = await processUserConfig(userConfig);
    const modules = assembleModules(config);

    return {
        input: 'entry.cjs',
        output: {
            format: 'iife',
            name: 'cordova',
            banner: makeBanner(config),
            intro: makeIntro(config)
        },
        plugins: [
            virtual({
                // Needs .cjs extension to be processed by commonjs plugin
                'entry.cjs': makeEntryModule(modules)
            }),
            // stripLicenseHeader(),
            alias({
                entries: [
                    ...makeModuleAliases(modules),
                    {
                        find: 'cordova/modules',
                        replacement: path.join(pkgRoot, 'src/scripts/require.js')
                    }
                ]
            }),
            commonjs()
        ]
    };
};

async function processUserConfig (userConfig) {
    const defaults = { preprocess: x => x };

    // Infer some defaults from platform package root if present
    const { platformRoot } = userConfig;
    if (platformRoot) {
        const pkg = require(path.join(platformRoot, 'package'));
        Object.assign(defaults, {
            platformName: pkg.name,
            platformVersion: pkg.version,
            modulePath: path.join(platformRoot, 'cordova-js-src')
        });
    }

    const config = { ...defaults, ...userConfig };

    // Populate extraModules property if missing
    const { extraModules, modulePath } = config;
    config.extraModules = extraModules || collectModules(modulePath);

    // Throw error on misconfigured modulePath
    if (modulePath && Object.keys(config.extraModules).length === 0) {
        throw new Error(`Could not find any modules in ${modulePath}`);
    }

    // Populate buildId property if missing
    config.buildId = config.buildId || await getBuildId();

    // Delete convenience config keys that are not used after this point
    delete config.platformRoot;
    delete config.modulePath;

    return config;
}

function assembleModules ({ extraModules }) {
    const moduleMap = {
        '': {
            moduleId: '',
            path: path.join(pkgRoot, 'src/cordova.js')
        },
        ...collectModules(path.join(pkgRoot, 'src/common')),
        ...extraModules
    };

    return Object.values(moduleMap).map(m => {
        // Add cordova namespace to module IDs
        const moduleId = path.posix.join('cordova', m.moduleId);
        return Object.assign({}, m, { moduleId });
    });
}

// FIXME this will destroy source maps
function stripLicenseHeader () {
    const LICENSE_REGEX = /^\s*\/\*[\s\S]+?\*\/\s*/;
    return {
        transform (code) {
            return code.replace(LICENSE_REGEX, '');
        }
    };
}

const makeBanner = ({ buildId, platformName }) => `
// Platform: ${platformName}
// cordova-js ${buildId}
/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
*/
`.trim();

const makeIntro = ({ platformVersion }) => `
var PLATFORM_VERSION_BUILD_LABEL = '${platformVersion}';
`.trim();

const makeModuleAliases = modules => modules.map(m => ({
    find: new RegExp(`^${escapeStringRegexp(m.moduleId)}$`),
    replacement: m.path
}));

const makeEntryModule = modules => `
var cdvModules = require('cordova/modules');

function makeRuntimeModule (id, exports) {
    cdvModules.define(id, function (r, e, m) { m.exports = exports; });
}

// Make all modules accessible during run time
${
    modules.map(({ moduleId }) =>
        `makeRuntimeModule('${moduleId}', require('${moduleId}'))`
    ).join('\n')
}

// Initialize App
require('cordova/init')();

module.exports = require('cordova');
`.trim();
