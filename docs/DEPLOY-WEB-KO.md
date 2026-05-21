# Drive Quest — 웹 공개 배포 (가장 쉬운 방법)

친구·지인에게 **링크 하나**로 보여 주고, 코드를 수정해 GitHub에 올리면 **자동으로 최신 버전**이 반영됩니다.

로그인 없이 **개인 플래시카드**처럼 쓰는 모드입니다.  
닉네임·학습 진행·오답은 **그 사람의 브라우저(localStorage)** 에만 저장됩니다.

---

## 1. GitHub에 올리기 (최초 1회)

1. [github.com](https://github.com) 가입 후 **New repository** → 이름 예: `drive-quest` (Public)
2. PC에 [Git](https://git-scm.com/download/win) 설치
3. PowerShell:

```powershell
cd "C:\Users\suah0\Desktop\drivers app\drive-quest"
git init
git add .
git commit -m "Drive Quest 첫 공개 버전"
git branch -M main
git remote add origin https://github.com/본인아이디/drive-quest.git
git push -u origin main
```

> `.env`는 올라가지 않습니다(.gitignore). API 키는 Vercel 화면에서만 넣으세요.

---

## 2. Vercel로 무료 배포 (추천 · 자동 업데이트)

1. [vercel.com](https://vercel.com) 가입 → **Add New → Project**
2. GitHub 저장소 `drive-quest` **Import**
3. 설정 확인 (자동 인식됨):
   - **Build Command:** `npm run build:web`
   - **Output Directory:** `dist`
4. **Environment Variables** 추가:

| 이름 | 값 |
|------|-----|
| `EXPO_PUBLIC_DEMO_MODE` | `true` |
| `EXPO_PUBLIC_DATA_GO_KR_SERVICE_KEY` | (선택) 공공데이터 API 키 |

5. **Deploy** 클릭 → 2~3분 후 URL 발급  
   예: `https://drive-quest-xxx.vercel.app`

### 이후 업데이트 반영

```powershell
git add .
git commit -m "학습 화면 개선"
git push
```

→ Vercel이 **자동으로 다시 빌드·배포**합니다. 같은 링크로 최신 앱이 열립니다.

---

## 3. 로컬에서 웹 빌드만 확인

```powershell
cd "C:\Users\suah0\Desktop\drivers app\drive-quest"
$env:Path = "C:\Program Files\nodejs;" + $env:Path
$env:EXPO_PUBLIC_DEMO_MODE = "true"
npm run build:web
npx serve dist
```

브라우저에서 `http://localhost:3000` (또는 serve가 알려준 주소)

---

## 4. 사용자(학습자) 안내 문구

배포 링크를 공유할 때 이렇게 적어 두면 좋습니다:

> **Drive Quest** — 운전면허 필기 플래시카드·퀴즈  
> 로그인 없이 바로 사용. 진행은 **이 브라우저에만** 저장됩니다.  
> 다른 폰/PC에서는 이어지지 않습니다.

---

## 5. Netlify (Vercel 대안)

1. [netlify.com](https://netlify.com) → **Add new site** → GitHub 연결  
2. `netlify.toml` 이 빌드 설정을 담고 있음  
3. 환경 변수는 Vercel과 동일하게 `EXPO_PUBLIC_DEMO_MODE=true`

---

## 6. 나중에 로그인·클라우드 저장

`EXPO_PUBLIC_DEMO_MODE=false` + Supabase 설정 시 Google 로그인·클라우드 동기화 가능.  
자세한 내용: `docs/RELEASE-KO.md`

---

## 요약

| 목표 | 방법 |
|------|------|
| 링크로 자랑하기 | Vercel + GitHub |
| 수정 시 자동 반영 | `git push` |
| 로그인 없이 개인 학습 | `EXPO_PUBLIC_DEMO_MODE=true` (기본) |
| 기기 기억 | 브라우저 localStorage + 닉네임 |
