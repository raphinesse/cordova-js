const path = require('path');
const makeRollupConfig = require('./build-tools/rollup-config');
const { collectModules } = require('./build-tools/common');

module.exports = makeRollupConfig({
    platformName: 'test',
    platformVersion: 'N/A',
    extraModules: collectTestBuildModules()
});

function collectTestBuildModules () {
    // Add platform-specific modules that have tests to the test bundle.
    const platformModules = ['android', 'ios'].map(platform => {
        const platformPath = path.dirname(require.resolve(`cordova-${platform}/package`));
        const modulePath = path.join(platformPath, 'cordova-js-src');
        const modules = collectModules(modulePath);

        // Prevent overwriting this platform's exec module with the next one
        const moduleId = path.posix.join(platform, 'exec');
        modules[moduleId] = Object.assign({}, modules.exec, { moduleId });

        return modules;
    });

    // Finally, add modules provided by test platform
    const testModulesPath = path.join(__dirname, 'test/test-platform-modules');
    return Object.assign(...platformModules, collectModules(testModulesPath));
}
