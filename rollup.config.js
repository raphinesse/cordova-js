import { join, resolve } from 'path';
import commonjs from 'rollup-plugin-commonjs';
import alias from 'rollup-plugin-alias';

export default {
    input: 'src/scripts/bootstrap.js',
    output: {
        file: 'bundle.js',
        format: 'amd'
    },
    plugins: [
        alias({
            entries: [
                {
                    find: /^cordova\/(.*)/,
                    replacement: join(resolve('src/common'), '$1.js')
                },
                {
                    find: 'cordova',
                    replacement: resolve('src/cordova.js')
                }
            ]
        }),
        commonjs()
    ],
    external: ['cordova/plugin_list']
};
