import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7f6aa43f196e4c44b7e23ba3a1ee3cf9',
  appName: 'AutoBill Vault',
  webDir: 'dist',
  server: {
    url: 'https://7f6aa43f-196e-4c44-b7e2-3ba3a1ee3cf9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      presentationStyle: 'fullscreen'
    }
  }
};

export default config;
