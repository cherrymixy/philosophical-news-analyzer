# Clarity Coach - 목표 기반 학습 전략 생성 앱

사용자가 목표를 입력하면 GPT를 통해 개인화된 학습 전략을 생성하는 웹 애플리케이션입니다.

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 OpenAI API 키를 설정하세요:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

### 3. 서버 실행
```bash
# 개발 모드 (nodemon 사용)
npm run dev

# 프로덕션 모드
npm start
```

### 4. 브라우저에서 접속
```
http://localhost:3000
```

## 주요 기능

- **목표 입력**: 사용자가 학습 목표를 입력
- **전략 생성**: GPT API를 통해 개인화된 3가지 학습 전략 생성
- **안전한 API 호출**: 백엔드 프록시를 통한 API 키 보호

## 파일 구조

```
├── index.html          # 목표 입력 페이지
├── process.html        # 전략 결과 페이지
├── style.css           # 스타일시트
├── script.js           # 목표 입력 페이지 스크립트
├── server.js           # Express 백엔드 서버
├── package.json        # 프로젝트 설정
└── .env               # 환경 변수 (API 키 등)
```

## 보안

- OpenAI API 키는 서버의 `.env` 파일에서 관리
- 프론트엔드에서는 API 키가 노출되지 않음
- 백엔드 프록시를 통한 안전한 API 호출

## 기술 스택

- **프론트엔드**: HTML, CSS, JavaScript
- **백엔드**: Node.js, Express
- **API**: OpenAI GPT-3.5-turbo
- **스타일**: Pretendard 폰트, Apple 스타일 디자인 