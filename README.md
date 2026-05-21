# Drive Quest 🛣️

운전면허 필기 시험을 게임처럼 공부하는 Expo + React Native + Supabase MVP.

**Expo SDK 54** · React Native 0.81 · React 19

## 프로젝트 구조

```
drive-quest/
├── app/                          # Expo Router 화면
│   ├── _layout.tsx               # 루트 네비게이션 + AuthProvider
│   ├── index.tsx                 # 인증/온보딩 라우팅
│   ├── (onboarding)/             # 온보딩
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── (auth)/                   # 로그인 · 회원가입
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/                   # 메인 탭
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # 홈
│   │   ├── learning.tsx          # 학습 (10문제/세션)
│   │   ├── ranking.tsx           # 랭킹
│   │   └── profile.tsx           # 프로필
│   ├── mock-exam/
│   │   └── index.tsx             # 모의고사
│   └── wrong-answers/
│       └── index.tsx             # 오답노트
├── src/
│   ├── components/               # UI 컴포넌트
│   │   ├── ui/                   # Button, Card, Input, Badge, ProgressBar
│   │   ├── ScreenHeader.tsx
│   │   └── StatCard.tsx
│   ├── constants/                # 앱 설정, 레벨 계산
│   ├── context/                  # AuthContext
│   ├── lib/                      # Supabase 클라이언트
│   ├── theme/                    # colors, spacing, typography
│   └── types/                    # Database + 앱 타입
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql                  # 샘플 문제 15개
├── assets/                       # 앱 아이콘 (Expo 기본 에셋 추가 필요)
├── .env.example
├── app.json
└── package.json
```

## Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase/migrations/001_initial_schema.sql` 실행
3. `supabase/seed.sql` 실행 (샘플 문제 삽입)
4. Authentication → Email 활성화
5. `.env.example`을 `.env`로 복사 후 URL·anon key 입력:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## 웹으로 공개 배포 (링크 공유 · 자동 업데이트)

친구에게 보여 주려면 **Vercel + GitHub** 가 가장 쉽습니다.  
`git push` 할 때마다 같은 URL에 최신 버전이 반영됩니다.

→ 자세한 단계: **[docs/DEPLOY-WEB-KO.md](docs/DEPLOY-WEB-KO.md)**

- 로그인 없음 · 닉네임·진행은 **브라우저에만** 저장 (개인 플래시카드)
- 로컬 웹 빌드: `npm run build:web` → `npm run preview:web`

## 로컬 실행 (데모 모드 — 로그인 없음)

```powershell
cd "drive-quest"   # 반드시 이 폴더 (상위 drivers app 아님)
.\start.ps1        # 연결 안 되면: .\start.ps1 -Tunnel
```

또는 `npm run start:tunnel` (Wi‑Fi가 달라도 됨) / `npm run start:lan` (같은 Wi‑Fi)

1. 터미널 **QR 코드** → 스마트폰 **Expo Go** (LAN이면 같은 Wi‑Fi)
2. 앱이 바로 **홈**으로 열립니다 (`EXPO_PUBLIC_DEMO_MODE=true` 기본값)
3. **학습** 탭에서 10문제 풀기 · **문제 목록 보기**에서 공단 API/샘플 문항 확인

### 도로교통공단 문제 API (공공데이터포털)

1. [data.go.kr](https://www.data.go.kr/data/15100163/fileData.do)에서 **활용신청** 후 **디코딩된 서비스키** 발급
2. `.env`에 추가:

```
EXPO_PUBLIC_DATA_GO_KR_SERVICE_KEY=발급받은_키
```

3. 앱 **프로필** → 「문제 다시 불러오기」 또는 **문제 목록** 화면에서 당겨서 새로고침

키가 없으면 **샘플 15문항**(도로교통공단 형식)으로 동작합니다.

> 로그인·Supabase는 `EXPO_PUBLIC_DEMO_MODE=false`일 때만 사용합니다.

### QR 스캔했는데 앱이 안 보일 때

| 증상 | 해결 |
|------|------|
| `npx`를 찾을 수 없음 | `drive-quest` 폴더에서 `.\start.ps1` 실행 (Node PATH 자동 설정) |
| Expo Go만 열리고 로딩만 됨 | PC에서 서버가 켜져 있는지 확인. `Waiting on http://localhost:8081` 나온 뒤 QR 스캔 |
| 연결 실패 / 빈 화면 | `.\start.ps1 -Tunnel` 또는 `npm run start:tunnel` |
| 방화벽 | Windows에서 **Node.js** / **Metro(8081)** 허용 |
| Expo Go 버전 | Play 스토어에서 **Expo Go 최신** (SDK 54 필요) |

## 데이터베이스 테이블

| 테이블 | 설명 |
|--------|------|
| `profiles` | 닉네임, 학습/모의고사/총 포인트, 레벨, 최고 모의고사 점수 (이메일 없음) |
| `questions` | 공식 문제 은행 |
| `learning_sessions` | 일일 10문제 학습 세션 |
| `mock_exams` | 모의고사 기록 |
| `user_question_attempts` | 문제별 시도 기록 |
| `wrong_answers` | 오답 자동 저장 (트리거) |
| `leaderboard` (view) | 총 포인트 랭킹 |

## 포인트 · 레벨 규칙

- **학습 포인트**: 정답당 +10P (`LEARNING_POINTS_PER_CORRECT`)
- **모의고사 포인트**: 별도 적립 (다음 단계에서 구현)
- **총 포인트** = 학습 + 모의고사 (DB 트리거로 동기화)
- **레벨** = `floor(총포인트 / 100) + 1`

## 다음 구현 단계

- [ ] 학습 세션: 10문제 로드, 즉시 정오답, 포인트·오답 DB 연동
- [ ] 모의고사: 랜덤 N문제, 점수·best_mock_exam_score 갱신
- [ ] 랭킹: `leaderboard` 뷰 실시간 조회
- [ ] 오답노트: `wrong_answers` + `questions` 조인

## 화면 목록

| 화면 | 경로 |
|------|------|
| 온보딩 | `/(onboarding)` |
| 로그인 | `/(auth)/login` |
| 회원가입 | `/(auth)/signup` |
| 홈 | `/(tabs)` |
| 학습 | `/(tabs)/learning` |
| 랭킹 | `/(tabs)/ranking` |
| 프로필 | `/(tabs)/profile` |
| 모의고사 | `/mock-exam` |
| 오답노트 | `/wrong-answers` |
