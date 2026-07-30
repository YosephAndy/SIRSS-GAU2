import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sgau.app',
  appName: 'SGAU Wanchaq',
  webDir: 'public',
  server: {
    url: 'http://10.168.110.80:3000',
    cleartext: true
  }
};

export default config;
