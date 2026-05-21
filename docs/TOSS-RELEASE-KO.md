# 운전면허 퀘스트 — 토스 앱인토스 출시 가이드

공식 문서: [앱인토스 개발자센터](https://developers-apps-in-toss.toss.im/)

운전면허 퀘스트는 **비게임 교육/학습** 미니앱에 해당합니다.  
현재 코드베이스(Expo + 웹 배포) 기준으로 **가장 빠른 경로는 WebView 미니앱**입니다.

---

## 출시까지 로드맵 (요약)

| 단계 | 당신이 할 일 | 준비된 것 |
|------|-------------|-----------|
| 1 | [앱인토스 콘솔](https://developers-apps-in-toss.toss.im/) 가입·앱 등록 | — |
| 2 | WebView 래퍼 설정 (`npx ait init`) | `toss/granite.config.example.ts` |
| 3 | 샌드박스 앱으로 테스트 | `npm run build:web` |
| 4 | 개인정보처리방침 URL 공개 | `public/privacy.html` → Vercel `/privacy.html` |
| 5 | 비게임 출시 체크리스트 점검 | 아래 체크리스트 |
| 6 | `.ait` 번들 업로드 → 검토 → 출시 | [미니앱 출시](https://developers-apps-in-toss.toss.im/development/deploy.html) |

> **2026-03-23 이후** SDK 1.x 번들 업로드 불가 → **SDK 2.x** 사용 필수.

---

## 추천: WebView 방식 (지금 프로젝트와 동일 UI)

이미 Vercel에 올린 웹 앱을 토스 미니앱으로 감쌉니다.

### 1) SDK 설치 (한 번)

```powershell
cd "C:\Users\suah0\Desktop\drivers app\drive-quest"
npm install @apps-in-toss/web-framework --save-dev
npx ait init
```

- **web-framework** 선택
- **appName**: 콘솔에 등록한 영문 이름 (예: `drive-quest`)
- **dev**: `npx expo start --web --port 19006` 또는 `npm run preview:web`
- **build**: `npm run build:web`
- **port**: `19006` (또는 사용 포트)

생성된 `granite.config.ts`는 `toss/granite.config.example.ts` 참고.

### 2) 샌드박스 테스트

1. [샌드박스 앱](https://developers-apps-in-toss.toss.im/) 설치 (iOS/Android)
2. `npm run dev` (ait 스크립트) 또는 `granite.config.ts`의 dev 명령 실행
3. `intoss://{appName}` 으로 접속

### 3) 토스앱 최종 테스트 & 출시

```powershell
npm run build:web
npm run build:toss
```

- 콘솔에 `.ait` 업로드
- 검토 요청 (영업일 기준 최대 3일)
- 승인 후 **출시하기**

---

## 대안: React Native (Granite) — 장기

Expo 앱을 **Granite** 프로젝트로 이전하면 네이티브 미니앱으로 출시할 수 있습니다.  
작업량이 크므로 WebView 출시 후 검토를 권장합니다.

- [React Native 튜토리얼](https://developers-apps-in-toss.toss.im/tutorials/react-native.html)
- `npm create granite-app`

---

## 비게임 필수 체크리스트 (운전면허 퀘스트)

출시 전 [비게임 출시 가이드](https://developers-apps-in-toss.toss.im/checklist/app-nongame.html) 전체 확인.

### 기술·UX (코드에서 맞춰 둔 것 / 확인 필요)

| 항목 | 상태 |
|------|------|
| 라이트 모드 UI | ✅ (흰 배경) |
| CSR/정적 웹 (SSR 없음) | ✅ Expo export |
| 제스처 확대·축소 비활성 | ⚠️ WebView 설정에서 확인 |
| 2초 이상 멈춤 없음 | ⚠️ 1000문항 로딩 시 스플래시 표시 |
| 데이터 재접속 시 유지 | ✅ localStorage |
| 토스 내비 뒤로가기와 중복 뒤로가기 없음 | ⚠️ 앱 내 `← 코스 선택` 최소화 검토 |
| `intoss://` 공유 스킴 | 출시 후 공유 기능 추가 시 |
| 번들 100MB 이하 | ✅ 웹 번들 소형 |

### 당신이 준비할 서류·정보

| 항목 | 설명 |
|------|------|
| **사업자/개발자 정보** | 콘솔 등록 (개인도 가능 여부는 콘솔 안내 따름) |
| **앱 아이콘** | 1024×1024 등 콘솔 규격 |
| **미니앱 한글 이름** | `운전면허 퀘스트` |
| **앱 설명·스크린샷** | 학습/퀴즈/오답노트 화면 캡처 |
| **개인정보처리방침 URL** | `https://drive-quest-two.vercel.app/privacy.html` |
| **고객센터 연락처** | 이메일 등 |
| **토스 로그인** | 선택 — 미사용 시 로컬 저장만 (현재 데모) |

### 출시 불가에 가까운 것 (해당 없음 확인)

- 도박/사행성, 금융 중개, 불법 콘텐츠 없음 ✅
- 운전면허 **학습·연습** 목적 ✅

---

## API·CORS (토스 WebView)

토스 실서비스 도메인 `*.apps.tossmini.com` 에서 API 호출 가능하도록  
`api/koroad.js` 프록시 CORS를 허용해 두었습니다.

Vercel에 `DATA_GO_KR_SERVICE_KEY` 가 설정되어 있어야 1,000문항이 로드됩니다.

---

## 앱인토스 vs 기존 배포

| 채널 | 용도 |
|------|------|
| **Vercel** | 링크 공유, 빠른 업데이트 (`git push`) |
| **Expo Go (8083)** | 개발·QR 테스트 |
| **앱인토스** | 토스 앱 안에서 서비스 |

---

## 다음에 제가 도와드릴 수 있는 것

1. `npx ait init` 후 생성된 `granite.config.ts` 검토
2. 토스 **유저 식별키(`getUserKey`)** 연동 → 기기 간 진행 저장
3. **토스 로그인** 연동 (선택)
4. Granite RN 마이그레이션 (장기)

콘솔에 앱 등록하신 **appName**을 알려주시면 `granite.config.ts` 값을 맞춰 드리겠습니다.
