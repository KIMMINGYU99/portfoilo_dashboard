### 프로젝트 배포 가이드

본 프로젝트는 React + Vite + Tailwind + React Router 기반이며, Supabase(인증/DB/Storage)를 백엔드로 사용합니다. 정적 산출물(HTML/CSS/JS)을 Vercel/Netlify/GitHub Pages 등으로 배포할 수 있습니다.

---

### 1) 사전 준비

- Node.js LTS(권장 v18+)
- 패키지 매니저: npm 또는 yarn
- Supabase 프로젝트 URL과 anon key
  - anon key는 클라이언트 공개용이며, RLS 정책은 반드시 안전하게 설정되어야 합니다.

환경 변수 (.env):

```bash
# Vite 사용 시 반드시 VITE_ 접두사가 필요합니다
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

다크 모드:

- tailwind.config.js: `darkMode: 'class'` 설정 (이미 적용)
- 헤더 토글이 localStorage('theme')와 document.documentElement.classList로 동작

---

### 2) 로컬 빌드 & 프리뷰

```bash
# 의존성 설치
npm ci

# 빌드
npm run build

# 정적 미리보기 (Vite)
npm run preview
```

산출물 경로: `dist/`

---

### 3) Vercel 배포 (권장)

1. Vercel에서 New Project → GitHub Repo 연결
2. Framework Preset: Vite
3. Build & Output
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Environment Variables (Production/Preview 동일 추가)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy → 배포 URL 확인

체크리스트:

- 다크 모드 전환 동작
- Supabase 데이터(프로필/프로젝트/블로그/캘린더) 조회/저장 정상
  +- 스토리지 이미지(아바타/썸네일/스크린샷) 노출 정상 (public 권한)

---

### 4) Netlify 배포 (대안)

1. New site from Git → 저장소 선택
2. Build Command: `npm run build`
3. Publish Directory: `dist`
4. Env: `VITE_SUPABASE_*` 추가
5. Deploy

SPA 라우팅:

```
/*  /index.html  200
```

---

### 5) GitHub Pages 배포 (대안)

1. gh-pages 사용
2. package.json 예시:

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Pages에서 브랜치 gh-pages 지정
4. 환경 변수는 빌드 시점에 주입되어야 하므로 `.env`를 CI에 설정하고 키는 커밋하지 않기

SPA 리로드 404 주의:

- 404.html을 index.html로 리다이렉트하는 워크어라운드 필요

---

### 6) Supabase 체크리스트

- RLS 활성화 및 정책 검증(읽기/쓰기 범위 최소화)
- Storage Bucket 권한: public read, 업로드/삭제는 정책으로 제한
- CORS: 필요 도메인 허용 여부 확인

---

### 7) 성능/UX 팁

- 이미지 `loading="lazy"`, `decoding="async"` 적용(이미 반영)
- 정적 자산 캐시(호스팅 기본값)
- 전역 오류/로딩 화면 노출 확인
- 다크 모드 초기 상태(localStorage/시스템 선호) 확인

---

### 8) 롤백/전개 전략

- Vercel/Netlify: 이전 빌드로 손쉬운 롤백
- PR Preview → 승인 후 Production Promote
- 환경변수 변경은 Preview에서 검증 후 Production 반영

---

### 9) 트러블슈팅

- 406/401 등 API 실패: `VITE_SUPABASE_URL/ANON_KEY` 재확인, RLS 정책 확인
- 다크 모드 미반영: `darkMode: 'class'`, 루트 `.dark` 클래스 확인
- 라우팅 404: SPA 리다이렉트 설정 적용
- 이미지 미표시: 퍼블릭 권한, URL, CORS 확인

---

### 10) 요약

- 로컬: `npm ci && npm run build && npm run preview`
- Vercel: 빌드 `npm run build`, 출력 `dist`, `VITE_SUPABASE_*` 설정 후 배포
- Netlify/GitHub Pages: 동일, SPA 리다이렉트 유의
