import { ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext) => ({
  ...config,
  name: 'BiteBook',
  slug: 'bite-book',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.bitebook.app',
    deploymentTarget: '17.0',
  },
  android: {
    package: 'com.bitebook.app'
  },
  plugins: [
    'expo-sqlite',
    [
      'llama.rn',
      {
        enableEntitlements: true,
        entitlementsProfile: 'production',
        forceCxx20: true,
      },
    ],
  ],
});
