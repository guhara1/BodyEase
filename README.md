# 간다GO — 전국 출장마사지 안내 사이트

이용 장소·생활권 중심으로 설계한 전국 다지역 출장마사지 안내 정적 사이트입니다.
행정구역 나열형이 아니라 **호텔·오피스텔·아파트·업무지구·관광 숙소·야간·역세권** 등
이용 목적별 허브 구조로 구성해, 도어웨이/중복 페이지 스팸 리스크를 낮췄습니다.
현재 **전국 17개 시·도**(서울·경기·인천·부산·대구·대전·광주·울산·세종·강원·충북·충남·전북·전남·경북·경남·제주)를 동일 엔진으로 생성합니다.

## 빌드

의존성 없이 Node 18+ 만으로 동작합니다.

```bash
node build.js      # → dist/ 에 전체 사이트 생성 (약 1,000 indexable 페이지)
```

`dist/` 를 정적 호스팅(Netlify, Vercel, GitHub Pages, S3 등)에 그대로 올리면 됩니다.

## 구조

```
src/
├─ data/
│  ├─ site.js          # 상호·전화·텔레그램·요금 등 전역 설정 (한 곳에서 관리)
│  ├─ pages.js         # 서울 허브 데이터 + 공유 checks/policies
│  └─ regions/
│     ├─ index.js      # 지역 레지스트리 (새 지역은 여기에 추가)
│     ├─ seoul.js      # 서울 지역 (meta + 데이터)
│     └─ gyeonggi.js   # 경기 지역 (meta + 데이터)
├─ lib/
│  ├─ templates.js     # <head>·헤더·푸터·JSON-LD 스키마 빌더
│  └─ content.js       # 지역 컨텍스트(ctx) 기반 본문 빌더
└─ styles/main.css     # 디자인 토큰(프리미엄 팔레트) + 컴포넌트 오버레이 + Pretendard
build.js               # 정적 사이트 생성기 (지역 루프)
```

### 페이지 구성 (지역당, 약 1,000 indexable 합계)

| 그룹 | 경로 |
|---|---|
| 지역 허브 메인 | `/{region}-service/` |
| 이용 상황별 허브 (8) | `.../use/*` |
| 시간대별 안내 (5) | `.../time/*` |
| 8대 생활벨트 (8) | `.../belt/*` |
| 구/시·군 안내 (지역별 상이) | `.../district/*` |
| 핵심 역세권 (12–14) | `.../station/*` |
| 예약 전 확인 (12) | `.../check/*` |

17개 시·도 × 위 구조 + 전역(홈 `/`, 운영/정책/문의 6, 사이트맵 `/sitemap/`).
`sitemap.xml`, `robots.txt` 자동 생성. 얇은 외곽 군·면은 `tier:3` → 자동 `noindex`.

### 새 지역 추가 방법

1. `src/data/regions/<region>.js` 를 `gyeonggi.js` 형식으로 작성 (meta + hubs/times/belts/districts/stations).
2. `src/data/regions/index.js` 의 `regions` 배열에 추가.
3. `node build.js` — 홈 지역 선택·헤더·푸터·사이트맵에 자동 반영됩니다.

## SEO 원칙 (반영 사항)

- **디스크립션 80자 이내** — 모든 페이지에서 자동 보장(`clampDesc`), 빌드 시 검증.
- **스키마(JSON-LD)** — `Organization`, `WebSite`, `WebPage`, `BreadcrumbList`,
  `FAQPage`, `ImageObject`(선호 썸네일 지정)만 사용.
  방문형 서비스이므로 `LocalBusiness`·`Review`·`AggregateRating`은 **사용하지 않음**.
- **E-E-A-T / Who·How·Why** — 모든 주요 페이지 하단에 작성 주체·방법·목적 블록.
- **내부링크 롱테일** — 지역명 반복이 아닌 "강남역·역삼 호텔 숙소 이용 전 확인" 형태
  이용 상황형 앵커텍스트로 허브↔생활벨트↔구↔역세권↔예약전확인을 상호 연결.
- **중복/얇은 페이지 방지** — 출구별·노선별·번호동 개별 페이지를 만들지 않음.
  본문이 약한 강북권 구는 `tier: 3`으로 두면 자동 `noindex`.
- **금지 표현 배제** — 상위노출 보장·최저가·1위·VIP·은밀·가짜 후기 등 미사용.

## 배포 전 교체 항목 (TODO)

`src/data/site.js` 에서 아래 값을 실제 정보로 교체 후 다시 빌드하세요.

- `baseUrl` — 실제 도메인 (현재 `https://gandago.co.kr` 예시)
- `telegram.build` / `telegram.partner` — 실제 텔레그램 채널/계정
  (현재 `t.me/gandago_build`, `t.me/gandago_partner` 플레이스홀더)
- `ogImage`, `/assets/logo.png` — 실제 대표 이미지·로고 파일

상호(간다GO)·전화예약(0508-202-4719)은 이미 반영되어 있습니다.
