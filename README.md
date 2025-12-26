# 🎨 Philosophical News Analyzer

**철학적 다중 렌즈를 통한 뉴스 재해석 서비스**

AI와 핀치 제스처를 활용한 혁신적인 뉴스 분석 도구입니다. 뉴스를 5가지 철학적 관점으로 분석하고, 사용자의 핀치 제스처로 키워드를 재조합하여 나만의 독창적인 철학적 관점을 창조할 수 있습니다.

## 🏗️ 프로젝트 구조

이 프로젝트는 **pnpm workspace 기반 모노레포**로 구성되어 있습니다:

```
philosophical-news-analyzer/
├── apps/
│   ├── web/              # 프론트엔드 (Vite)
│   │   ├── index.html
│   │   ├── script.js
│   │   ├── style.css
│   │   ├── vite.config.js
│   │   └── package.json
│   └── api/              # 백엔드 (Express)
│       ├── server.js
│       ├── .env.example
│       └── package.json
├── packages/
│   └── shared/           # 공통 타입/유틸 (선택)
├── pnpm-workspace.yaml   # pnpm workspace 설정
├── package.json          # 루트 package.json
└── README.md
```

### 프론트엔드/백엔드 분리

- **apps/web**: 프론트엔드 애플리케이션 (Vite 기반)
  - API 호출은 환경변수 `VITE_API_BASE_URL`로 설정
  - 기본값: `http://localhost:3000`
  
- **apps/api**: Express API 서버
  - OpenAI 키는 `.env` 파일에서만 읽음
  - CORS는 `FRONTEND_URL` 환경변수로 설정

## ✨ 주요 기능

### 🧠 5가지 철학적 관점 분석
- **플라톤주의**: 이데아, 진리, 이상, 정의
- **칸트주의**: 의무, 도덕법칙, 자율성, 존엄성
- **니체주의**: 권력의지, 초인, 가치전도, 창조
- **실존주의**: 자유, 선택, 책임, 의미창조
- **마르크스주의**: 계급, 자본, 착취, 혁명

### 🎯 다중 관점 비교
- 여러 철학적 관점을 동시에 비교 분석
- 각 관점별 색상 구분으로 시각적 표현
- 키워드 하이라이팅과 문장별 중요도 표시

### 🤏 핀치 제스처 재조합 모드
- **MediaPipe Hands**를 활용한 실시간 손 인식
- 핀치 제스처로 키워드 드래그 앤 드롭
- **강하게 반영** / **약하게 반영** 박스로 키워드 분류
- 파티클 애니메이션과 시각적 피드백

### 🎨 AI 기반 나만의 철학적 관점 생성
- **OpenAI GPT**를 활용한 창의적 철학적 관점 창조
- 독창적인 철학적 관점 이름 생성
- 시적이고 깊이 있는 철학적 정의
- 유사한 현대 철학적 관점 추천
- 영감을 주는 창의적 뉴스 해석

## 🚀 기술 스택

### Frontend
- **Vite**: 빠른 개발 서버 및 빌드 도구
- **HTML5, CSS3, JavaScript (ES6+)**
- **MediaPipe Hands**: 실시간 손 인식 및 제스처 감지
- **Canvas API**: 손 랜드마크 시각화
- **WebRTC**: 카메라 접근

### Backend
- **Node.js + Express**: 서버 프레임워크
- **OpenAI GPT-3.5-turbo / GPT-4**: AI 기반 철학적 분석
- **CORS**: 크로스 오리진 요청 처리

### AI & ML
- **MediaPipe**: Google의 실시간 손 인식 라이브러리
- **OpenAI API**: 자연어 처리 및 철학적 분석

### 모노레포
- **pnpm workspace**: 패키지 관리 및 모노레포 구조

## 🛠️ 설치 및 실행

### 사전 요구사항
- Node.js >= 18
- pnpm >= 8

### 1. 저장소 클론
```bash
git clone https://github.com/[your-username]/philosophical-news-analyzer.git
cd philosophical-news-analyzer
```

### 2. 의존성 설치
```bash
pnpm install
```

### 3. 환경 변수 설정

#### API 서버 환경 변수
`apps/api/.env` 파일을 생성하고 OpenAI API 키를 설정하세요:

```bash
cp apps/api/.env.example apps/api/.env
```

`.env` 파일 내용:
```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
FRONTEND_URL=http://localhost:5173
```

#### 프론트엔드 환경 변수 (선택)
`apps/web/.env` 파일을 생성하여 API 서버 URL을 설정할 수 있습니다:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 4. 개발 서버 실행

**프론트엔드와 백엔드를 동시에 실행:**
```bash
pnpm dev
```

또는 각각 따로 실행:

```bash
# 터미널 1: API 서버
pnpm --filter api dev

# 터미널 2: 프론트엔드
pnpm --filter web dev
```

### 5. 브라우저에서 접속
- 프론트엔드: http://localhost:5173
- API 서버: http://localhost:3000

## 📱 사용 방법

### 1. 뉴스 분석
1. 뉴스 기사를 입력란에 붙여넣기
2. "기사 등록하기" 버튼 클릭
3. 5가지 철학적 관점별 분석 결과 확인

### 2. 다중 관점 비교
1. "다중 관점 비교 모드" 토글 활성화
2. 비교하고 싶은 철학적 관점들 선택
3. 색상별로 구분된 하이라이팅 확인

### 3. 재조합 모드 (핀치 제스처)
1. 2개 이상의 철학적 관점 선택
2. "🎨 재조합하기" 버튼 클릭
3. 카메라 권한 허용
4. 핀치 제스처로 키워드 드래그:
   - **강하게 반영 박스**: 중요하게 생각하는 키워드
   - **약하게 반영 박스**: 보조적으로 생각하는 키워드
5. "내 관점 만들기" 버튼으로 AI가 창조한 철학적 관점 확인

## 🎯 핀치 제스처 사용법

### 손 인식
- 카메라 앞에 손을 보여주면 초록색 선으로 손 랜드마크가 표시됩니다
- 엄지와 검지를 핀치하면 빨간색 원이 표시됩니다

### 키워드 조작
- 핀치한 상태로 키워드를 드래그하여 박스에 드롭
- 박스 근처에 가면 시각적 피드백 제공
- 드롭 시 파티클 애니메이션과 함께 처리

## 🎨 AI 철학적 관점 생성

AI가 생성하는 독창적인 철학적 관점 예시:
- **"포스트-기술적 혁명주의"**
- **"디지털 신비주의"**
- **"사이버 실존주의"**
- **"알고리즘 윤리학"**
- **"메타버스 윤리학"**

## 🔧 개발 정보

### 프로젝트 구조
```
philosophical-news-analyzer/
├── apps/
│   ├── web/              # 프론트엔드
│   │   ├── index.html
│   │   ├── script.js
│   │   ├── style.css
│   │   ├── vite.config.js
│   │   └── package.json
│   └── api/              # 백엔드
│       ├── server.js
│       ├── .env.example
│       └── package.json
├── packages/
│   └── shared/           # 공통 타입/유틸 (선택)
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

### API 엔드포인트
- `POST /api/analyze-news`: 뉴스 철학적 분석
- `POST /api/create-custom-philosophy`: 나만의 철학적 관점 생성
- `POST /api/gpt`: 일반 GPT API 호출

### 스크립트 명령어

#### 루트 레벨
- `pnpm dev`: 프론트엔드와 백엔드를 동시에 실행
- `pnpm lint`: 모든 패키지 린트 실행
- `pnpm format`: 모든 패키지 포맷 실행

#### 개별 패키지
- `pnpm --filter web dev`: 프론트엔드만 실행
- `pnpm --filter api dev`: 백엔드만 실행

## ⚠️ 주요 리스크 및 주의사항

### 1. MediaPipe 번들 크기
- MediaPipe Hands 라이브러리는 CDN에서 로드되므로 초기 로딩 시간이 걸릴 수 있습니다.
- 프로덕션 환경에서는 번들 최적화를 고려하세요.

### 2. 카메라 권한
- 브라우저에서 카메라 접근 권한이 필요합니다.
- HTTPS 환경에서만 카메라 접근이 가능합니다 (localhost 제외).

### 3. CORS 설정
- 프론트엔드와 백엔드가 다른 포트에서 실행되므로 CORS 설정이 필요합니다.
- `apps/api/.env`의 `FRONTEND_URL`을 올바르게 설정하세요.

### 4. OpenAI API 키
- `.env` 파일은 절대 Git에 커밋하지 마세요.
- `.env.example` 파일을 참고하여 `.env` 파일을 생성하세요.

### 5. 환경변수
- 프론트엔드 환경변수는 `VITE_` 접두사가 필요합니다.
- 환경변수 변경 후 개발 서버를 재시작하세요.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🙏 감사의 말

- **Google MediaPipe**: 실시간 손 인식 기술
- **OpenAI**: AI 기반 자연어 처리
- **Express.js**: 웹 서버 프레임워크
- **Vite**: 빠른 프론트엔드 빌드 도구

---

**🎨 철학적 다중 렌즈를 통한 뉴스 재해석 - AI와 핀치 제스처의 만남**
