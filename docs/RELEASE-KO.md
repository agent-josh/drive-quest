# Drive Quest 릴리스 준비 가이드

로컬(데모) → **온라인 공유(Google 로그인 + Supabase DB)** → 앱 스토어 배포까지 필요한 단계를 정리했습니다.

---

## 전체 로드맵

| 단계 | 작업 | 예상 시간 |
|------|------|-----------|
| 1 | Supabase 프로젝트 + DB 마이그레이션 | 30분 |
| 2 | Google Cloud OAuth 설정 | 20분 |
| 3 | `.env` 프로덕션 설정 + 데모 모드 끄기 | 5분 |
| 4 | 실기기/Expo Go에서 Google 로그인 테스트 | 15분 |
| 5 | EAS Build로 APK/AAB (Android) 또는 TestFlight (iOS) | 1~2시간 |
| 6 | 스토어 등록 (선택) | 수일 |

---

## 1. Supabase (데이터베이스 + 인증)

### 1-1. 프로젝트 생성

1. [https://supabase.com](https://supabase.com) 가입 → **New project**
2. 리전: `Northeast Asia (Seoul)` 권장
3. **Project URL**, **anon public key** 복사

### 1-2. SQL 실행 (순서대로)

Supabase 대시보드 → **SQL Editor** → New query

1. `supabase/migrations/001_initial_schema.sql` 전체 붙여넣기 → Run  
2. `supabase/migrations/002_user_learning_progress.sql` 실행  
3. (선택) `supabase/seed.sql` — 샘플 문제 15개

### 1-3. 테이블 요약

| 테이블 | 용도 |
|--------|------|
| `profiles` | 닉네임, 포인트, 레벨 (Google 가입 시 자동 생성) |
| `user_learning_progress` | 학습 진행 JSON (오답·코스·이어하기) |
| `questions` | 문제 은행 (향후 서버 문제 DB용) |
| `wrong_answers` | DB 트리거 기반 오답 (향후 확장) |

현재 앱은 **학습 진행을 `user_learning_progress`에 JSON으로 동기화**합니다.

---

## 2. Google 로그인 설정

### 2-1. Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com/) → 프로젝트 생성  
2. **APIs & Services** → **OAuth consent screen** → External → 앱 이름·이메일 입력  
3. **Credentials** → **Create Credentials** → **OAuth client ID**
   - 유형: **Web application** (Supabase용)
   - Authorized redirect URIs에 Supabase가 안내하는 URL 추가  
     예: `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
4. (선택) Android/iOS용 OAuth 클라이언트는 나중에 스토어 배포 시 추가

### 2-2. Supabase에 Google 연결

1. Supabase → **Authentication** → **Providers** → **Google** → Enable  
2. Google Client ID / Client Secret 입력  
3. **Authentication** → **URL Configuration**  
   - **Redirect URLs**에 추가:
     - `drivequest://auth/callback`
     - `exp://127.0.0.1:8081` (Expo Go 개발용, 필요 시)
     - 배포 웹 URL이 있으면 해당 origin

---

## 3. 앱 환경 변수

`.env.example`을 복사해 `.env` 생성:

```env
# 온라인 모드 (false = Google 로그인 + DB 동기화)
EXPO_PUBLIC_DEMO_MODE=false

EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

EXPO_PUBLIC_DATA_GO_KR_SERVICE_KEY=공공데이터_디코딩키
```

변경 후 Metro 재시작:

```bash
npx expo start -c
```

---

## 4. 로컬 vs 온라인 모드

| | `DEMO_MODE=true` | `DEMO_MODE=false` |
|--|------------------|-------------------|
| 로그인 | 없음 | Google만 |
| 진행 저장 | 기기 AsyncStorage | Supabase `user_learning_progress` |
| 프로필 | 로컬 데모 | `profiles` 테이블 |

---

## 5. 온라인 공유 방법 (빠른 테스트)

### A. Expo Go (가장 빠름)

1. `npx expo start` → QR 스캔  
2. 같은 Wi‑Fi, `.env`에 Supabase·Google 설정 완료  
3. 친구도 Expo Go 설치 후 **같은 프로젝트를 clone + .env** 필요 (보안상 팀원만)

### B. EAS Build (실제 앱 파일)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

빌드 완료 후 링크로 APK 설치 가능.

### C. 웹 (Expo web)

```bash
npx expo start --web
```

Google OAuth Redirect에 웹 URL도 Supabase에 등록해야 합니다.

---

## 6. 앱 스토어 릴리스 (요약)

### Android (Google Play)

1. [Google Play Console](https://play.google.com/console) 개발자 등록 ($25 일회)  
2. `eas build --platform android --profile production`  
3. AAB 업로드, 스크린샷·개인정보처리방침·앱 설명 작성  
4. 심사 제출

### iOS (App Store)

1. Apple Developer Program ($99/년)  
2. `eas build --platform ios`  
3. App Store Connect 업로드 (TestFlight → 심사)

### 공통 준비물

- [ ] 앱 아이콘·스플래시 (`assets/`)  
- [ ] 개인정보처리방침 URL (Google 로그인 시 **필수**)  
- [ ] 앱 설명·스크린샷 4~8장  
- [ ] `app.json`의 `bundleIdentifier` / `package` 최종 확정  

---

## 7. 체크리스트 (출시 전)

- [ ] Supabase 001 + 002 마이그레이션 완료  
- [ ] Google Provider 활성화 + Redirect URL  
- [ ] `EXPO_PUBLIC_DEMO_MODE=false`  
- [ ] Google 로그인 → 학습 → 오답 → 재로그인 시 진행 유지  
- [ ] 다른 기기에서 같은 계정으로 이어하기 확인  

---

## 8. 문제 해결

| 증상 | 확인 |
|------|------|
| Google 로그인 후 토큰 오류 | Supabase Redirect URLs에 `drivequest://auth/callback` 있는지 |
| 진행이 안 저장됨 | `002_user_learning_progress.sql` 실행 여부, RLS 정책 |
| 데모 모드로만 동작 | `.env`에서 `DEMO_MODE=false` 후 `expo start -c` |

---

## 다음 개선 (선택)

- [ ] `questions` 테이블에 공단 API 문항 일괄 적재 (Edge Function)  
- [ ] 랭킹 탭 ↔ `leaderboard` 뷰 연동  
- [ ] 프로필 닉네임 변경 UI (`updateNickname` 이미 구현됨)  
- [ ] Apple 로그인 (iOS 심사 시 권장)
