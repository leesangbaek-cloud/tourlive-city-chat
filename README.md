# 🌏 TourLive 실시간 환율 계산기

투어라이브(TourLive) 사용자를 위한 실시간 환율 및 원화(KRW) 계산기 서비스입니다.

## 주요 기능
- **실시간 환율 연동**: Supabase와 ExchangeRate-API를 연동하여 15종 이상의 세계 주요 통화에 대한 실시간 환율을 제공합니다.
- **자동 동기화**: 앱 실행 시 데이터가 1시간 이상 경과했다면 자동으로 최신 환율을 업데이트합니다.
- **다양한 통화 지원**: USD, EUR, JPY, CNY, TWD, THB, VND, PHP, GBP, CHF 등 지원.
- **반응형 디자인**: 모바일 및 PC 환경에 최적화된 직관적이고 미려한 UI.

## 기술 스택
- **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript
- **Backend/Database**: [Supabase](https://supabase.com/)
- **API**: [ExchangeRate-API](https://www.exchangerate-api.com/)

## 설치 및 사용 방법
1. 이 저장소를 클론합니다.
2. `main.js` 파일에 본인의 `SUPABASE_URL`, `SUPABASE_KEY`, `EXCHANGE_API_KEY`를 설정합니다.
3. `index.html`을 브라우저에서 엽니다.

## 배포
이 프로젝트는 정적 HTML 파일로 구성되어 있어 **Netlify**, **Vercel**, 또는 **GitHub Pages**를 통해 매우 쉽게 배포할 수 있습니다.
