/**
 * 앱인토스 WebView — 설정 예시
 * 1) npm install @apps-in-toss/web-framework --save-dev
 * 2) npx ait init  → 프로젝트 루트에 granite.config.ts 생성
 * 3) 아래 값을 콘솔 등록 정보와 동일하게 수정
 */
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'drive-quest',
  brand: {
    displayName: '운전면허 퀘스트',
    primaryColor: '#4F46E5',
    icon: 'https://drive-quest-two.vercel.app/favicon.ico',
  },
  web: {
    host: 'localhost',
    port: 19006,
    commands: {
      dev: 'npx expo start --web --port 19006',
      build: 'npm run build:web',
    },
  },
  permissions: [],
  outdir: 'dist',
});
