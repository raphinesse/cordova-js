import { resolve } from 'path';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';

// FIXME this will destroy source maps
function stripLicenseHeader () {
    const LICENSE_REGEX = /^\s*\/\*[\s\S]+?\*\/\s*/;
    return {
        transform (code) {
            return code.replace(LICENSE_REGEX, '');
        }
    };
}

const LICENSE = `
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

export default {
    input: 'src/scripts/bootstrap.js',
    output: {
        file: 'pkg/cordova.test.js',
        format: 'iife',
        name: 'cordova',
        banner: LICENSE,
        // FIXME inject correct version
        intro: 'var PLATFORM_VERSION_BUILD_LABEL = "1.2.3";'
    },
    plugins: [
        stripLicenseHeader(),
        alias({
            entries: [
                // FIXME inject proper platform modules
                {
                    find: /^cordova\/(exec|platform)$/,
                    replacement: resolve('test/test-platform-modules/$1.js')
                },

                {
                    find: 'cordova/modules',
                    replacement: resolve('src/scripts/require.js')
                },
                {
                    find: /^cordova\/(.*)/,
                    replacement: resolve('src/common/$1.js')
                },
                {
                    find: 'cordova',
                    replacement: resolve('src/cordova.js')
                }
            ]
        }),
        commonjs()
    ]
};
