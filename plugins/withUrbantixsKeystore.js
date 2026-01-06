const { withAppBuildGradle, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * @param {import('@expo/config-plugins').ExpoConfig} config
 * @returns {import('@expo/config-plugins').ExpoConfig}
 */
module.exports = (config) => {
    // First, copy the keystore file
    config = withDangerousMod(config, [
        'android',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            const keystoreSource = path.join(projectRoot, 'urbantixs.keystore');
            const keystoreDestination = path.join(projectRoot, 'android', 'app', 'urbantixs.keystore');

            // Check if source keystore exists
            if (fs.existsSync(keystoreSource)) {
                // Copy keystore to android/app directory
                fs.copyFileSync(keystoreSource, keystoreDestination);
                console.log('✓ Copied urbantixs.keystore to android/app/');
            } else {
                console.warn('⚠ Warning: urbantixs.keystore not found in project root');
            }

            return config;
        },
    ]);

    // Then, modify the build.gradle
    config = withAppBuildGradle(config, (config) => {
        let contents = config.modResults.contents;

        // Check if release config already exists within signingConfigs block
        const hasReleaseConfig = /signingConfigs\s*\{[^}]*release\s*\{/.test(contents);

        if (!hasReleaseConfig) {
            // Add release signing config to the existing signingConfigs block
            const releaseSigningConfig = `        release {
            storeFile file('urbantixs.keystore')
            storePassword 'Shashank@123'
            keyAlias 'key01'
            keyPassword 'Shashank@123'
        }`;

            // Find the closing brace of the signingConfigs block
            // We look for the pattern: signingConfigs { ... }
            // and insert the release config before the closing brace
            const lines = contents.split('\n');
            let inSigningConfigs = false;
            let signingConfigsDepth = 0;
            let insertIndex = -1;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                if (line.includes('signingConfigs') && line.includes('{')) {
                    inSigningConfigs = true;
                    signingConfigsDepth = 1;
                    continue;
                }

                if (inSigningConfigs) {
                    // Count braces to track depth
                    const openBraces = (line.match(/\{/g) || []).length;
                    const closeBraces = (line.match(/\}/g) || []).length;
                    signingConfigsDepth += openBraces - closeBraces;

                    // If we're back to depth 0, we found the closing brace
                    if (signingConfigsDepth === 0) {
                        insertIndex = i;
                        break;
                    }
                }
            }

            if (insertIndex !== -1) {
                lines.splice(insertIndex, 0, releaseSigningConfig);
                contents = lines.join('\n');
            }
        }

        // Update the release buildType to use the release signing config instead of debug
        const releaseBuildTypeRegex = /(release\s*\{[^}]*signingConfig\s+signingConfigs\.)debug/;
        if (releaseBuildTypeRegex.test(contents)) {
            contents = contents.replace(releaseBuildTypeRegex, '$1release');
        }

        config.modResults.contents = contents;
        return config;
    });

    return config;
};
