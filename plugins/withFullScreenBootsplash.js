const { withDangerousMod, withAndroidStyles } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Custom plugin to configure react-native-bootsplash with a full-screen image
 */
const withFullScreenBootsplash = (config) => {
  // Configure Android
  config = withAndroidFullScreenSplash(config);

  return config;
};

/**
 * Configure Android to use full-screen splash image
 */
const withAndroidFullScreenSplash = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const splashPath = path.join(projectRoot, 'assets', 'splash_screen_large.png');
      const androidResPath = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'res'
      );

      // Create drawable folder
      const drawablePath = path.join(androidResPath, 'drawable');
      if (!fs.existsSync(drawablePath)) {
        fs.mkdirSync(drawablePath, { recursive: true });
      }

      // Create bootsplash.xml drawable with full-screen image
      const bootsplashXml = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android" android:opacity="opaque">
    <item>
        <bitmap
            android:gravity="fill"
            android:src="@drawable/bootsplash_image"/>
    </item>
</layer-list>`;

      fs.writeFileSync(
        path.join(drawablePath, 'bootsplash.xml'),
        bootsplashXml
      );

      // Copy splash image to all density folders
      if (fs.existsSync(splashPath)) {
        const densities = ['drawable-mdpi', 'drawable-hdpi', 'drawable-xhdpi', 'drawable-xxhdpi', 'drawable-xxxhdpi', 'drawable'];

        for (const density of densities) {
          const densityPath = path.join(androidResPath, density);
          if (!fs.existsSync(densityPath)) {
            fs.mkdirSync(densityPath, { recursive: true });
          }

          const targetPath = path.join(densityPath, 'bootsplash_image.png');
          fs.copyFileSync(splashPath, targetPath);
        }
      }

      // Update AndroidManifest.xml to use BootTheme
      const manifestPath = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'AndroidManifest.xml'
      );

      if (fs.existsSync(manifestPath)) {
        let manifestContent = fs.readFileSync(manifestPath, 'utf-8');

        // Update the theme in the activity tag
        if (!manifestContent.includes('android:theme="@style/BootTheme"')) {
          manifestContent = manifestContent.replace(
            /<activity([^>]*android:name="\.MainActivity"[^>]*)>/,
            '<activity$1 android:theme="@style/BootTheme">'
          );
          fs.writeFileSync(manifestPath, manifestContent);
        }
      }

      return config;
    },
  ]);
};

/**
 * Add BootTheme to styles.xml
 */
const withBootThemeStyles = (config) => {
  return withAndroidStyles(config, async (config) => {
    const styles = config.modResults;

    if (!styles.resources.style) {
      styles.resources.style = [];
    }

    // Remove existing BootTheme if it exists
    styles.resources.style = styles.resources.style.filter(
      (style) => style.$.name !== 'BootTheme'
    );

    // Add BootTheme
    styles.resources.style.push({
      $: { name: 'BootTheme', parent: 'Theme.AppCompat.Light.NoActionBar' },
      item: [
        {
          _: '@drawable/bootsplash',
          $: { name: 'android:windowBackground' },
        },
        {
          _: 'false',
          $: { name: 'android:windowFullscreen' },
        },
      ],
    });

    return config;
  });
};

module.exports = (config) => {
  config = withFullScreenBootsplash(config);
  config = withBootThemeStyles(config);
  return config;
};
