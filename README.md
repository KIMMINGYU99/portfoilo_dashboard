# 포트폴리오 대시보드 프로젝트

개발자를 위한 개인 포트폴리오 및 프로젝트 관리 대시보드 사이트입니다.

## 🚀 주요 기능

### 📋 프로젝트 관리

- 프로젝트 등록 및 상세 정보 관리
- 기술 스택별 프로젝트 분류
- 프로젝트 상태 추적 (계획중, 진행중, 완료, 보류)
- GitHub 저장소 연동

### 📅 일정 관리

- 캘린더 뷰로 프로젝트 일정 시각화
- 프로젝트 마일스톤 설정
- 주간/월간 뷰 지원

### 📊 대시보드

- 프로젝트 진행 현황 통계
- 기술 스택 사용 빈도 차트
- 최근 활동 타임라인

### 💻 추가 기능

- **기술 스택 관리**: 숙련도 레벨 및 학습 진도 트래커
- **개발 블로그**: 마크다운 지원 블로그 기능
- **경력 타임라인**: 교육, 경력, 프로젝트 통합 타임라인
- **코드 스니펫**: 자주 사용하는 코드 조각 저장소
- **GitHub 통계**: 커밋 활동 및 기여도 시각화

## 🛠️ 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Supabase
- **스타일링**: Tailwind CSS, Framer Motion
- **상태관리**: Zustand
- **UI 라이브러리**: Headless UI, Heroicons
- **캘린더**: React Big Calendar
- **차트**: Recharts
- **폼 관리**: React Hook Form + Zod
- **기타**: React Router, React Query, React Markdown

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── common/         # 공통 컴포넌트 (Button, Modal 등)
│   ├── layout/         # 레이아웃 컴포넌트 (Sidebar, Header)
│   ├── project/        # 프로젝트 관련 컴포넌트
│   ├── calendar/       # 캘린더 관련 컴포넌트
│   ├── charts/         # 차트 관련 컴포넌트
│   └── blog/           # 블로그 관련 컴포넌트
├── pages/              # 페이지 컴포넌트
├── hooks/              # 커스텀 훅
├── stores/             # Zustand 상태 관리
├── services/           # API 서비스
├── utils/              # 유틸리티 함수
└── types/              # TypeScript 타입 정의
```

## 🗄️ 데이터베이스 구조

주요 테이블:

- `users`: 사용자 정보
- `projects`: 프로젝트 정보
- `technologies`: 기술 스택 마스터
- `project_technologies`: 프로젝트-기술 연결
- `project_schedules`: 프로젝트 일정
- `blog_posts`: 블로그 포스트
- `career_timeline`: 경력 타임라인
- `learning_tracks`: 학습 진도
- `code_snippets`: 코드 스니펫

## 🚀 시작하기

### 필수 조건

- Node.js 18+
- Supabase 계정

### 설치

1. 프로젝트 클론

```bash
git clone https://github.com/KIMMINGYU99/portfoilo_dashboard.git
cd portfoilo_dashboard
```

2. 의존성 설치

```bash
npm install
```

### 사용 가능한 스크립트

```bash
# 개발 서버 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기 (http://localhost:4173)
npm run preview

# 린트 검사
npm run lint

# 스토리북 실행/빌드
npm run storybook
npm run build-storybook
```

3. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일에 Supabase 정보 입력:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. 데이터베이스 설정

- Supabase 대시보드에서 새 프로젝트 생성
- `ERD.md` 파일의 SQL 스크립트를 실행하여 테이블 생성

5. 개발 서버 실행

```bash
npm run dev
```

## 📱 주요 페이지

### 대시보드 (`/`)

- 프로젝트 현황 요약
- 진행중인 프로젝트 목록
- 기술 스택 통계 차트
- 최근 활동 타임라인

### 프로젝트 (`/projects`)

- 프로젝트 목록 및 필터링
- 프로젝트 상세 정보
- 새 프로젝트 등록

### 일정 관리 (`/calendar`)

- 캘린더 뷰 (월간/주간/일간)
- 프로젝트 일정 등록 및 관리
- 마일스톤 설정

### 기술 스택 (`/techstack`)

- 기술 목록 및 숙련도 관리
- 기술별 프로젝트 연결
- 학습 진도 트래커

### 개발 블로그 (`/blog`)

- 마크다운 기반 블로그 작성
- 태그 기반 분류
- 개발 과정 기록

## 🎨 디자인 시스템

### 컬러 팔레트

- Primary: Blue (#3b82f6)
- Secondary: Gray (#6b7280)
- Success: Green (#10b981)
- Warning: Yellow (#f59e0b)
- Danger: Red (#ef4444)

### 타이포그래피

- Font Family: Inter
- 제목: font-bold
- 본문: font-medium / font-normal

### 컴포넌트

- 일관된 spacing (4px 단위)
- 둥근 모서리 (rounded-lg)
- 그림자 효과 (shadow-sm, shadow-md)

## 🔧 개발 가이드

### 컴포넌트 작성 규칙

1. TypeScript 인터페이스를 활용한 props 정의
2. 단일 책임 원칙 준수
3. 재사용 가능하도록 설계
4. 적절한 props 기본값 설정

### 상태 관리

- 전역 상태: Zustand 사용
- 서버 상태: React Query 사용
- 로컬 상태: useState 사용

### 네이밍 컨벤션

- 컴포넌트: PascalCase
- 함수/변수: camelCase
- 상수: UPPER_SNAKE_CASE
- 파일명: PascalCase (컴포넌트), camelCase (기타)

## 📈 성능 최적화

- React.memo를 활용한 불필요한 리렌더링 방지
- React.lazy를 활용한 코드 스플리팅
- Supabase RLS를 활용한 효율적인 데이터 페칭
- 이미지 최적화 및 lazy loading

## 🔐 보안

- Supabase Row Level Security (RLS) 적용
- 환경변수를 통한 API 키 관리
- HTTPS 통신 강제
- XSS 방지를 위한 입력값 검증

## 🚀 배포

### Vercel 배포 가이드

1. 프로젝트 임포트: Vercel → Add New → New Project → GitHub에서 `portfoilo_dashboard` 선택
2. 빌드 설정:

- Framework Preset: Vite
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`

3. 환경변수(Production/Preview):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

4. 첫 배포 후 확인:

- 공개 URL 접속 확인
- Supabase Project → Auth/CORS 허용 도메인에 Vercel 도메인 추가

환경변수 예시:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 빌드 트러블슈팅

- 스토리/스토리북이 빌드에 포함되어 에러가 날 경우 `tsconfig.json`의 `exclude`에 `src/stories`, `**/*.stories.*`, `.storybook` 추가
- 사용되지 않는 import/변수 에러는 IDE의 Organize Imports로 일괄 정리
- `react-markdown` 코드블록 렌더링에서 타입 충돌 시, `SyntaxHighlighter`에 `...props`를 전달하지 않도록 수정하고 `inline`, `className`만 사용
- Supabase 쿼리는 `PostgrestFilterBuilder` 자체가 Promise가 아니므로, `select()` 까지 호출한 thenable을 `Promise.all`에 push

## 📚 문서

- 프로젝트 설계 문서는 로컬 `markdown/` 디렉터리에 존재하며, 버전관리에서 제외됩니다(`.gitignore`).
- 배포 리포지토리에는 포함되지 않으므로, 필요 시 별도 문서 저장소/노션 등과 연동을 권장합니다.

## 🔐 보안 및 버전관리 주의

- `.env.local`은 절대 커밋하지 않습니다. Vercel 환경변수를 사용하세요.
- 민감정보가 과거에 커밋되었다면 키 롤테이션(재발급) 후, 히스토리 재작성(`git-filter-repo`/BFG)으로 완전 제거하세요.
- 대용량 산출물(`node_modules/`, `dist/`, `storybook-static/`, `markdown/`)은 `.gitignore`로 제외되어 있습니다.

## 🤝 기여 방법

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

프로젝트에 대한 질문이나 제안사항이 있으시면 언제든 연락주세요!

---

⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!
