// 간다GO — 정적 사이트 생성기 (의존성 없음, Node 18+, 다지역 지원)
// 실행: node build.js  →  dist/ 에 전체 사이트 생성
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { site } from './src/data/site.js';
import { regions, checks, policies } from './src/data/regions/index.js';
import { programs } from './src/data/programs.js';
import { page, faqHtml, relatedHtml, whwBlock } from './src/lib/templates.js';
import { hubBody, timeBody, beltBody, districtBody, stationBody, checkBody, CHECKLIST } from './src/lib/content.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const REGION_NAMES = regions
  .filter((r) => r.meta.kind !== 'city')
  .map((r) => r.meta.name)
  .join('·'); // 시·도 이름 (예: 서울·경기·인천…)
// 도(道) 시(市) 이름 → 전용 도시 허브 base 매핑 (예: '수원' → '/suwon-service')
const CITY_HUB_BY_NAME = new Map(
  regions.filter((r) => r.meta.kind === 'city').map((r) => [r.meta.name, r.meta.base])
);

const urls = [];
async function emit(url, html, { noindex = false } = {}) {
  const rel = url.endsWith('/') ? url + 'index.html' : url;
  const out = path.join(DIST, rel.replace(/^\//, ''));
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, html, 'utf8');
  if (!noindex) urls.push(url);
}

const beltName = (region, slug) => region.belts.find((b) => b.slug === slug)?.name || slug;

// ---------------------------------------------------------------------------
// 전역 홈 (간다GO 메인) — 지역 선택 + 요금 섹션
// ---------------------------------------------------------------------------
function homePage() {
  const url = '/';
  const title = site.defaultTitle;
  const regionNames = REGION_NAMES;
  const description = `간다GO ${regionNames} 출장마사지 60·90·120분 코스 요금과 이용 장소별 안내.`;

  const pricing = site.courses
    .map(
      (c) => `<div class="card price-card${c.recommended ? ' card--accent' : ''}">
      ${c.recommended ? '<span class="price-card__badge">추천</span>' : ''}
      <div class="price-card__name">${c.name}</div>
      <div class="price-card__price">${c.price}<small>원</small></div>
      <div class="price-card__min">${c.minutes}</div>
      <div class="price-card__desc">${c.desc}</div>
      <a class="btn ${c.recommended ? 'btn--primary' : 'btn--ghost'} btn--block" href="${site.phoneHref}">예약 문의</a>
    </div>`
    )
    .join('\n    ');

  const regionCard = (r) => `<a class="card card--accent" href="${r.meta.base}/">
      <h3>${r.meta.name} 출장마사지</h3>
      <p>${r.meta.tagline}</p>
      <span class="card__more">${r.meta.name} 이용 안내 →</span>
    </a>`;
  const provinceCards = regions.filter((r) => r.meta.kind !== 'city').map(regionCard).join('\n    ');
  const cityCards = regions.filter((r) => r.meta.kind === 'city').map(regionCard).join('\n    ');

  // 대표 이용 장소(서울 허브) 카드
  const useCards = regions[0].hubs
    .map(
      (h) => `<a class="card" href="${regions[0].meta.base}/use/${h.slug}/">
      <h3>${h.focus}</h3>
      <p>${h.angle.split('.')[0]}.</p>
      <span class="card__more">이용 기준 보기 →</span>
    </a>`
    )
    .join('\n    ');

  const faq = [
    { q: '간다GO 코스와 요금은 어떻게 되나요?', a: '60분 90,000원, 90분 150,000원, 120분 180,000원 기준이며 지역·예약 시간대·이동 거리에 따라 상담 시 최종 확인됩니다.' },
    { q: '어느 지역까지 이용 안내가 되나요?', a: `현재 ${regionNames} 지역을 이용 장소·생활권별로 안내하며, 지역은 계속 확장하고 있습니다.` },
    { q: '불법·선정적 서비스도 가능한가요?', a: '불법·선정적 서비스는 제공하거나 안내하지 않습니다.' },
    { q: '예약은 어떻게 하나요?', a: `전화예약 ${site.phone} 으로 문의하시면 이용 장소와 예약 가능 시간을 확인해 안내합니다.` },
  ];

  const body = `<section class="hero">
  <div class="container">
    <p class="eyebrow">${regionNames} 출장마사지 · 이용 장소와 생활권별 예약 안내</p>
    <h1>출장마사지, 지역명보다<br>이용 장소 확인이 먼저입니다</h1>
    <p class="lede">간다GO는 ${regionNames}에서 호텔·오피스텔·아파트·업무지구·신도시 이용 전 필요한 주소 확인, 건물 출입, 예약 가능 시간, 개인정보 처리 기준을 안내합니다.</p>
    <div class="hero__cta">
      <a class="btn btn--primary" href="${site.phoneHref}">전화예약 ${site.phone}</a>
      <a class="btn btn--ghost" href="/seoul-service/">서울 이용 안내 →</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <p class="eyebrow">지역을 선택하세요</p>
    <h2>광역 시·도 이용 안내</h2>
    <div class="grid grid--2" style="margin-top:30px">
    ${provinceCards}
    </div>
    <h2 style="margin-top:2em">주요 도시 상세 안내</h2>
    <p class="lede">도(道) 내 대도시는 구·생활권 단위로 더 자세히 안내합니다.</p>
    <div class="grid grid--2" style="margin-top:24px">
    ${cityCards}
    </div>
  </div>
</section>

<section class="section center" style="background:var(--bg-2)">
  <div class="container">
    <p class="eyebrow">이용 코스와 요금 살펴보기</p>
    <h2>이용 코스와 요금</h2>
    <p class="lede">60·90·120분 코스별 기준 요금이며, 추가 비용 없이 있는 그대로 안내드립니다.</p>
    <div class="pricing" style="margin-top:38px">
    ${pricing}
    </div>
    <p class="lede" style="margin-top:26px">지역·예약 시간대·이동 거리에 따라 상담 시 최종 확인됩니다. <a href="/terms/">상세 요금 안내 보기 →</a></p>
  </div>
</section>

<section class="section">
  <div class="container">
    <p class="eyebrow">마사지 프로그램</p>
    <h2>프로그램 안내</h2>
    <p class="lede">스웨디시부터 스포츠마사지, 태국마사지까지 — 컨디션에 맞는 프로그램을 선택하세요.</p>
    <div class="grid grid--3" style="margin-top:30px">
    ${programs
      .map(
        (p) => `<a class="card" href="/programs/${p.slug}/">
      <h3>${p.name}</h3>
      <p>${p.tagline}</p>
      <span class="card__more">프로그램 안내 →</span>
    </a>`
      )
      .join('\n    ')}
    </div>
  </div>
</section>

<section class="section" style="background:var(--bg-2)">
  <div class="container">
    <p class="eyebrow">지역명보다 이용 장소 확인이 먼저입니다</p>
    <h2>이용 장소별 안내</h2>
    <p class="lede">예약 전 확인해야 할 내용은 행정구역보다 이용 장소에 따라 달라집니다.</p>
    <div class="grid grid--4" style="margin-top:30px">
    ${useCards}
    </div>
  </div>
</section>

<section class="section" style="background:var(--bg-2)">
  <div class="container article">
    <h2>예약 전 확인해야 할 내용</h2>
    <ul class="checklist">${CHECKLIST.map((i) => `<li>${i}</li>`).join('')}</ul>
    <h2 style="margin-top:1.6em">자주 묻는 질문</h2>
    ${faqHtml(faq)}
  </div>
</section>`;

  return { url, title, description, faq, body };
}

// ---------------------------------------------------------------------------
// 지역 허브 메인 (/{base}/)
// ---------------------------------------------------------------------------
function regionMain(region) {
  const { meta } = region;
  const url = `${meta.base}/`;
  const breadcrumbs = [{ name: '홈', url: '/' }, { name: `${meta.name} 출장마사지`, url }];

  const cards = (items, seg, get) =>
    items.map((it) => `<a class="card" href="${meta.base}/${seg}/${it.slug}/"><h3>${get(it)}</h3></a>`).join('\n    ');

  const faq = [
    { q: '이 사이트는 구별/시별 사이트인가요?', a: '지역별 안내도 포함하지만, 핵심은 호텔·오피스텔·아파트·업무지구처럼 이용 상황별로 확인할 수 있는 구조입니다.' },
    { q: '역세권 페이지는 출구별로 만드나요?', a: '아니요. 출구별 페이지는 중복 위험이 크기 때문에 역명 기준 1개 페이지로 관리합니다.' },
    { q: '불법·선정적 서비스도 가능한가요?', a: '불법·선정적 서비스는 제공하거나 안내하지 않습니다.' },
  ];

  const body = `<section class="hero">
  <div class="container">
    <p class="eyebrow">${meta.name} 출장마사지 · 이용 장소와 생활권별 예약 안내</p>
    <h1>${meta.h1}</h1>
    <p class="lede">${meta.intro}</p>
    <div class="hero__cta">
      <a class="btn btn--primary" href="${site.phoneHref}">전화예약 ${site.phone}</a>
      <a class="btn btn--ghost" href="/">다른 지역 보기 →</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2>${meta.name}은 지역명보다 이용 장소 확인이 먼저입니다</h2>
    <p class="lede">${meta.name}은 ${meta.admin}으로 구성되어 있지만, 실제 예약 전 확인해야 할 내용은 행정구역보다 이용 장소에 따라 달라집니다. 호텔은 숙소 정책, 오피스텔은 공동현관과 관리 규정, 아파트는 경비실과 주차, 업무지구는 퇴근 후 이동 기준을 확인해야 합니다.</p>
    <h2 style="margin-top:1.4em">이용 장소별 안내</h2>
    <div class="grid grid--4" style="margin-top:24px">
    ${cards(region.hubs, 'use', (h) => h.focus)}
    </div>
  </div>
</section>

<section class="section" style="background:var(--bg-2)">
  <div class="container">
    <h2>${meta.beltTitle}</h2>
    <div class="grid grid--4" style="margin-top:24px">
    ${cards(region.belts, 'belt', (b) => b.name)}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2>시간대별 예약 기준</h2>
    <div class="grid grid--3" style="margin-top:24px">
    ${cards(region.times, 'time', (t) => t.name)}
    </div>
  </div>
</section>

<section class="section" style="background:var(--bg-2)">
  <div class="container">
    <h2>${meta.name} 주요 ${meta.districtWord} 안내</h2>
    <div class="grid grid--4" style="margin-top:24px">
    ${region.districts.filter((d) => d.tier === 1).map((d) => `<a class="card" href="${meta.base}/district/${d.slug}/"><h3>${d.name}</h3></a>`).join('\n    ')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2>핵심 역세권</h2>
    <div class="grid grid--4" style="margin-top:24px">
    ${cards(region.stations, 'station', (s) => s.name)}
    </div>
  </div>
</section>

<section class="section" style="background:var(--bg-2)">
  <div class="container article">
    <h2>예약 전 확인해야 할 내용</h2>
    <ul class="checklist">${CHECKLIST.map((i) => `<li>${i}</li>`).join('')}</ul>
    <h2 style="margin-top:1.6em">자주 묻는 질문</h2>
    ${faqHtml(faq)}
    <h2 style="margin-top:1.6em">Who · How · Why</h2>
    ${whwBlock({
      who: `이 페이지는 ${meta.name} 방문형 웰니스 이용 전 숙소 유형·건물 출입·생활권·예약 조건을 확인할 수 있도록 작성되었습니다.`,
      how: `${meta.name} 공식 행정구역 자료와 실제 예약 전 확인 항목을 기준으로 작성하며 사람이 최종 검수합니다.`,
      why: '검색 순위 조작이 아니라, 이용 전 필요한 확인사항을 이해하기 쉽게 안내하기 위해서입니다.',
    })}
  </div>
</section>`;

  return { url, title: meta.seoTitle, description: meta.seoDesc, breadcrumbs, faq, body };
}

// ---------------------------------------------------------------------------
// 정책/정적 페이지 본문 (전역)
// ---------------------------------------------------------------------------
function policyBody(p) {
  const rows = {
    about: `<p>간다GO 콘텐츠는 ${REGION_NAMES} 등 방문형 웰니스 서비스 이용 전 확인 사항을 안내하기 위해 작성됩니다.</p>
      <h2>작성 기준</h2>
      <p>공식 자치구·시·군 자료, 실제 예약 전 확인 항목, 개인정보 처리 기준, 불법·선정적 서비스 불가 원칙을 기준으로 작성합니다.</p>
      <h2>검수 기준</h2>
      <p>AI 보조 도구를 사용할 수 있으나, 최종 문구는 사람이 검수하고 중복·과장·허위 표현을 제거합니다. 상위노출 보장, 최저가, 1위 같은 표현은 사용하지 않습니다.</p>
      <h2>책임 운영</h2>
      <p>상호 ${site.brand} · 전화예약 ${site.phone}. 문의 사항은 <a href="/contact/">문의하기</a>로 연락 바랍니다.</p>`,
    privacy: `<p>간다GO는 예약 확인과 연락에 필요한 최소한의 개인정보만 확인합니다.</p>
      <h2>수집 항목</h2>
      <p>예약 시 연락처, 방문 주소, 예약 희망 시간 등 예약 이행에 필요한 최소 정보만 확인합니다.</p>
      <h2>이용 목적</h2>
      <p>예약 확인, 방문 안내, 예약 변경 연락 목적 외에는 사용하지 않습니다.</p>
      <h2>보관 및 파기</h2>
      <p>예약 목적이 달성되면 관련 정보를 지체 없이 파기합니다. 목적 외 제3자 제공을 하지 않습니다.</p>`,
    service: `<p>간다GO는 건전한 방문형 웰니스 안내만 제공합니다.</p>
      <h2>제공하지 않는 서비스</h2>
      <p>불법·선정적 서비스는 제공하거나 안내하지 않으며, 관련 문의에도 응하지 않습니다. 허위 후기·허위 평점을 사용하지 않습니다.</p>
      <h2>표현 원칙</h2>
      <p>‘무조건 가능’, ‘즉시 가능 보장’, ‘최저가’, ‘1위’, ‘VIP 은밀 서비스’ 같은 표현을 사용하지 않습니다.</p>`,
    operating: `<p>간다GO 운영 기준은 다음과 같습니다.</p>
      <h2>예약</h2>
      <p>실제 방문 주소, 이용 장소, 예약 가능 시간, 이동 기준을 확인한 뒤 방문 가능 여부를 안내합니다.</p>
      <h2>이용 장소</h2>
      <p>호텔·오피스텔·아파트·업무지구·관광 숙소별로 건물 출입 방식과 확인 사항이 다릅니다. <a href="/seoul-service/check/address/">예약 전 확인</a> 페이지를 참고하세요.</p>
      <h2>개인정보 · 서비스 범위</h2>
      <p><a href="/privacy-policy/">개인정보 처리방침</a>과 <a href="/service-policy/">불법·선정적 서비스 불가 안내</a>를 따릅니다.</p>`,
    terms: `<p>간다GO 이용 안내입니다.</p>
      <h2>코스 · 요금</h2>
      <ul>
        <li>60분 코스 — 90,000원 · 기본 컨디션·릴랙스 케어</li>
        <li>90분 코스 — 150,000원 · 아로마 포함 추천 구성</li>
        <li>120분 코스 — 180,000원 · 전신 집중 프리미엄 케어</li>
      </ul>
      <p>지역·예약 시간대·이동 거리에 따라 상담 시 최종 확인됩니다.</p>
      <h2>예약 방법</h2>
      <p>전화예약 ${site.phone} 으로 문의하시면 이용 장소와 예약 가능 시간을 확인해 안내합니다.</p>`,
    contact: `<p>간다GO 문의 방법입니다.</p>
      <h2>전화예약</h2>
      <p><a class="footer-tel" href="${site.phoneHref}">📞 ${site.phone}</a></p>
      <h2>웹사이트 제작·제휴 문의</h2>
      <p>SEO 최적화 사이트 제작과 제휴는 텔레그램으로 상담해 드립니다.</p>
      <div class="hero__cta">
        <a class="btn btn--primary" href="${site.telegram.build}" target="_blank" rel="noopener nofollow">웹사이트 제작문의</a>
        <a class="btn btn--primary" href="${site.telegram.partner}" target="_blank" rel="noopener nofollow">제휴문의</a>
      </div>`,
  };
  return `<section class="section">
  <div class="container article">
    <p class="eyebrow">운영 안내</p>
    <h1>${p.h1}</h1>
    ${rows[p.kind]}
    <div class="notice" style="margin-top:24px">상호 ${site.brand} · 전화예약 ${site.phone} · 방문형 웰니스 안내</div>
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
// 마사지 프로그램 페이지 (전역)
// ---------------------------------------------------------------------------
function programBody(p) {
  const others = programs.filter((x) => x.slug !== p.slug);
  const faq = [
    { q: `${p.name}은 어떤 프로그램인가요?`, a: p.intro },
    { q: `${p.name} 요금은 어떻게 되나요?`, a: `60분 90,000원, 90분 150,000원, 120분 180,000원 코스 체계를 따릅니다. ${p.courseNote}` },
    { q: '이용 전 준비할 것이 있나요?', a: p.caution },
    { q: '프로그램을 바꾸거나 조합할 수 있나요?', a: '예약 시 또는 진행 전 상담으로 프로그램 변경·조합이 가능합니다. 압 강도도 진행 중 조절할 수 있습니다.' },
  ];
  const html = `<section class="section">
  <div class="container article">
    <p class="eyebrow">마사지 프로그램</p>
    <h1>${p.h1}</h1>
    <p class="lede">${p.tagline}</p>

    <h2>${p.name} 소개</h2>
    <p>${p.intro}</p>

    <h2>${p.name}의 특징</h2>
    <ul>${p.features.map((f) => `<li>${f}</li>`).join('')}</ul>

    <h2>이런 분께 잘 맞습니다</h2>
    <ul>${p.goodFor.map((g) => `<li>${g}</li>`).join('')}</ul>

    <h2>코스 구성과 요금</h2>
    <p>${p.name}은 간다GO 공통 코스 체계로 이용할 수 있습니다. ${p.courseNote}</p>
    <ul>
      <li><strong>60분 코스 — 90,000원</strong> · 기본 컨디션·릴랙스 케어</li>
      <li><strong>90분 코스 — 150,000원</strong> · 아로마 포함 추천 구성</li>
      <li><strong>120분 코스 — 180,000원</strong> · 전신 집중 프리미엄 케어</li>
    </ul>
    <p>지역·예약 시간대·이동 거리에 따라 상담 시 최종 확인됩니다.</p>

    <h2>이용 흐름</h2>
    <ol>
      <li><strong>프로그램·코스 선택</strong> — ${p.name} 기준으로 60·90·120분 중 선택합니다. 상담 시 컨디션에 맞는 구성을 안내드립니다.</li>
      <li><strong>이용 장소 확인</strong> — 호텔·오피스텔·아파트 등 이용 장소와 정확한 주소, 건물 출입 방식을 확인합니다.</li>
      <li><strong>예약 확정</strong> — 예약 가능 시간과 이동 거리를 반영해 도착 시간을 안내드립니다.</li>
      <li><strong>진행</strong> — 시작 전 압 강도와 집중 부위를 확인하고, 진행 중에도 조절을 요청할 수 있습니다.</li>
    </ol>

    <h2>이용 전 참고사항</h2>
    <p>${p.caution}</p>

    <h2>이용 장소와 지역</h2>
    <p>${p.name}은 서울·경기·인천을 비롯한 전국 안내 지역의 호텔·오피스텔·아파트·자택에서 이용할 수 있습니다. 이용 장소에 따라 건물 출입 방식과 준비 사항이 다르므로, <a href="/seoul-service/use/hotel/">호텔·숙소 이용 기준</a>과 <a href="/seoul-service/use/officetel/">오피스텔 공동현관 확인</a> 페이지를 함께 참고하세요. 지역별 생활권 안내는 <a href="/sitemap/">전체 지역</a>에서 확인할 수 있습니다. 야간 시간대 이용을 원하시면 건물 출입 가능 여부를 먼저 확인해 드리니 예약 시 시간대를 함께 알려주세요.</p>

    <div class="notice">
      간다GO는 건전한 방문형 웰니스 관리만 제공합니다. <a href="/service-policy/">불법·선정적 서비스</a>는 제공하거나 안내하지 않으며,
      예약 확인에 필요한 <a href="/privacy-policy/">최소 개인정보</a>만 확인합니다.
    </div>

    <h2>자주 묻는 질문</h2>
    ${faqHtml(faq)}

    <h2>Who · How · Why</h2>
    ${whwBlock({
      who: `이 페이지는 ${p.name} 프로그램 이용 전, 구성·요금·준비 사항을 확인할 수 있도록 작성되었습니다.`,
      how: '실제 코스 체계와 상담 시 안내 기준을 바탕으로 작성하며, 과장·허위 표현 없이 사람이 최종 검수합니다.',
      why: '프로그램 간 차이를 이해하고 자신에게 맞는 구성을 선택할 수 있도록 돕기 위해서입니다.',
    })}

    <h2>다른 프로그램 보기</h2>
    ${relatedHtml([
      ...others.map((o) => [`/programs/${o.slug}/`, `${o.name} 프로그램 안내`]),
      ['/programs/', '전체 프로그램 보기'],
      ['/contact/', '예약·문의하기'],
    ])}
  </div>
</section>`;
  return { faq, html };
}

function programsHub() {
  const url = '/programs/';
  const title = '마사지 프로그램 안내｜스웨디시·스포츠·태국마사지 · 간다GO';
  const description = '간다GO 마사지 프로그램 안내. 스웨디시·아로마·스포츠·태국·딥티슈·발마사지 구성.';
  const breadcrumbs = [{ name: '홈', url: '/' }, { name: '마사지 프로그램', url }];
  const faq = [
    { q: '어떤 프로그램이 있나요?', a: `${programs.map((p) => p.name).join(', ')} 프로그램을 운영합니다. 상담 시 컨디션에 맞는 구성을 안내드립니다.` },
    { q: '프로그램마다 요금이 다른가요?', a: '요금은 60분 90,000원, 90분 150,000원, 120분 180,000원 공통 코스 체계를 따르며, 프로그램에 따라 구성만 달라집니다.' },
    { q: '어떤 프로그램을 선택해야 할지 모르겠어요.', a: '처음이시라면 스웨디시, 뭉침이 심하면 스포츠·딥티슈, 오일이 부담스러우면 태국마사지를 권합니다. 전화 상담으로 맞는 구성을 안내드립니다.' },
  ];
  const cards = programs
    .map(
      (p) => `<a class="card" href="/programs/${p.slug}/">
      <h3>${p.name}</h3>
      <p>${p.tagline}</p>
      <span class="card__more">프로그램 안내 →</span>
    </a>`
    )
    .join('\n    ');
  const body = `<section class="hero">
  <div class="container">
    <p class="eyebrow">마사지 프로그램</p>
    <h1>마사지 프로그램 안내</h1>
    <p class="lede">간다GO는 스웨디시부터 스포츠마사지, 태국마사지까지 컨디션과 취향에 맞는 프로그램을 운영합니다. 모든 프로그램은 60·90·120분 공통 코스 체계로 이용할 수 있습니다.</p>
    <div class="hero__cta">
      <a class="btn btn--primary" href="${site.phoneHref}">전화예약 ${site.phone}</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2>프로그램 선택</h2>
    <div class="grid grid--3" style="margin-top:30px">
    ${cards}
    </div>
  </div>
</section>

<section class="section" style="background:var(--bg-2)">
  <div class="container article">
    <h2>프로그램 선택 가이드</h2>
    <p>처음 이용하시거나 부드러운 관리를 원하시면 <a href="/programs/swedish/">스웨디시</a>나 <a href="/programs/aroma/">아로마</a>를, 운동 후 뭉침이나 만성 긴장이 고민이면 <a href="/programs/sports/">스포츠마사지</a>·<a href="/programs/deep-tissue/">딥티슈</a>를 권합니다. 오일 사용이 부담스럽다면 건식으로 진행하는 <a href="/programs/thai/">태국마사지</a>가 적합하고, 하체 피로가 크다면 <a href="/programs/foot/">발마사지</a> 구성을 더할 수 있습니다.</p>
    <h2 style="margin-top:1.4em">공통 코스 체계</h2>
    <ul>
      <li><strong>60분 코스 — 90,000원</strong> · 기본 컨디션·릴랙스 케어</li>
      <li><strong>90분 코스 — 150,000원</strong> · 아로마 포함 추천 구성</li>
      <li><strong>120분 코스 — 180,000원</strong> · 전신 집중 프리미엄 케어</li>
    </ul>
    <h2 style="margin-top:1.4em">자주 묻는 질문</h2>
    ${faqHtml(faq)}
  </div>
</section>`;
  return { url, title, description, breadcrumbs, faq, body };
}

// ---------------------------------------------------------------------------
// 사이트맵(HTML)
// ---------------------------------------------------------------------------
function sitemapHtmlBody() {
  const group = (title, items) => `<h2>${title}</h2><div class="related">${items.map(([u, t]) => `<a href="${u}">${t}</a>`).join('')}</div>`;
  const regionGroups = regions
    .map((r) => {
      const b = r.meta.base;
      return [
        group(`${r.meta.name} · 이용 장소`, r.hubs.map((h) => [`${b}/use/${h.slug}/`, h.focus])),
        group(`${r.meta.name} · 생활벨트`, r.belts.map((x) => [`${b}/belt/${x.slug}/`, x.name])),
        group(`${r.meta.name} · ${r.meta.districtLabel}`, r.districts.map((d) => [`${b}/district/${d.slug}/`, d.name])),
        group(`${r.meta.name} · 역세권`, r.stations.map((s) => [`${b}/station/${s.slug}/`, s.name])),
      ].join('\n    ');
    })
    .join('\n    ');
  return `<section class="section"><div class="container article">
    <h1>사이트맵</h1>
    ${group('마사지 프로그램', [['/programs/', '전체 프로그램'], ...programs.map((p) => [`/programs/${p.slug}/`, p.name])])}
    ${group('지역', regions.map((r) => [`${r.meta.base}/`, `${r.meta.name} 출장마사지`]))}
    ${regionGroups}
    ${group('예약 전 확인 (서울)', checks.map((c) => [`/seoul-service/check/${c.slug}/`, c.name]))}
    ${group('운영 안내', policies.map((p) => [`/${p.slug}/`, p.name]))}
  </div></section>`;
}

// ---------------------------------------------------------------------------
// 빌드
// ---------------------------------------------------------------------------
async function build() {
  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });
  await fs.mkdir(path.join(DIST, 'styles'), { recursive: true });
  await fs.copyFile(path.join(__dirname, 'src/styles/main.css'), path.join(DIST, 'styles/main.css'));

  // 전역 홈
  { const h = homePage(); await emit(h.url, page(h)); }

  // 지역별 생성
  for (const region of regions) {
    const { meta } = region;
    const home = { name: '홈', url: '/' };
    const regionCrumb = { name: `${meta.name} 출장마사지`, url: `${meta.base}/` };

    // 지역 메인
    { const m = regionMain(region); await emit(m.url, page(m)); }

    // 이용 장소 허브
    for (const hub of region.hubs) {
      const url = `${meta.base}/use/${hub.slug}/`;
      const related = [
        [`${meta.base}/`, `${meta.name} 출장마사지 홈`],
        [`${meta.base}/check/address/`, '방문 주소 확인'],
        [`${meta.base}/check/building-access/`, '건물 출입 방식 확인'],
        ...region.belts.slice(0, 4).map((b) => [`${meta.base}/belt/${b.slug}/`, `${b.name} 이용 안내`]),
      ];
      const { faq, html } = hubBody(hub, meta, related);
      const breadcrumbs = [home, regionCrumb, { name: hub.focus, url }];
      await emit(url, page({ url, title: hub.title, description: hub.desc, breadcrumbs, faq, body: html }));
    }

    // 시간대
    for (const t of region.times) {
      const url = `${meta.base}/time/${t.slug}/`;
      const related = [
        [`${meta.base}/use/business-district/`, '업무지구 퇴근 후 예약 기준'],
        [`${meta.base}/use/hotel/`, '호텔·숙소 이용 전 확인'],
        [`${meta.base}/check/time/`, '예약 가능 시간 확인'],
        [`${meta.base}/check/night-access/`, '야간 출입 가능 여부 확인'],
      ];
      const { faq, html } = timeBody(t, meta, related);
      const breadcrumbs = [home, regionCrumb, { name: t.name, url }];
      await emit(url, page({ url, title: `${meta.name} ${t.name} 출장마사지 예약 기준｜간다GO`, description: t.desc, breadcrumbs, faq, body: html }));
    }

    // 생활벨트
    for (const b of region.belts) {
      const url = `${meta.base}/belt/${b.slug}/`;
      const beltDistricts = region.districts.filter((d) => d.belt === b.slug);
      const related = [
        [`${meta.base}/`, `${meta.name} 출장마사지 홈`],
        ...beltDistricts.slice(0, 4).map((d) => [`${meta.base}/district/${d.slug}/`, `${d.name} 이용 안내`]),
        [`${meta.base}/use/hotel/`, '호텔·숙소 이용 전 확인'],
        [`${meta.base}/use/officetel/`, '오피스텔 공동현관 확인'],
      ];
      const { faq, html } = beltBody(b, meta, related);
      const breadcrumbs = [home, regionCrumb, { name: meta.beltTitle, url: `${meta.base}/` }, { name: b.name, url }];
      await emit(url, page({ url, title: `${b.h1}｜간다GO`, description: b.desc, breadcrumbs, faq, body: html }));
    }

    // 구/시
    for (const d of region.districts) {
      const url = `${meta.base}/district/${d.slug}/`;
      // 도(道) 시(市) 페이지에 전용 도시 허브가 있으면 상세 안내 링크를 최상단에 배치
      const cityHubBase = CITY_HUB_BY_NAME.get(d.name.replace(/시$/, ''));
      const related = [
        ...(cityHubBase && meta.kind !== 'city'
          ? [[`${cityHubBase}/`, `${d.name.replace(/시$/, '')} 구·생활권 상세 안내`]]
          : []),
        [`${meta.base}/belt/${d.belt}/`, `${beltName(region, d.belt)}`],
        [`${meta.base}/use/hotel/`, '호텔·숙소 이용 전 확인'],
        [`${meta.base}/use/officetel/`, '오피스텔 공동현관 확인'],
        [`${meta.base}/check/apartment-access/`, '공동현관 확인'],
        ['/service-policy/', '불법·선정적 서비스 불가 안내'],
      ];
      const { faq, html } = districtBody(d, meta, beltName(region, d.belt), related);
      const breadcrumbs = [home, regionCrumb, { name: meta.districtLabel, url: `${meta.base}/` }, { name: d.name, url }];
      // 전 페이지 index — 생활권별 상세 본문(2,000자 이상)으로 얇은 페이지 문제를 해소했으므로
      // tier는 지역 메인 노출 우선순위로만 사용하고 noindex는 사용하지 않습니다.
      await emit(url, page({ url, title: `${d.h1}｜간다GO`, description: d.desc, breadcrumbs, faq, body: html }));
    }

    // 역세권
    for (const s of region.stations) {
      const url = `${meta.base}/station/${s.slug}/`;
      const related = [
        [`${meta.base}/use/station-area/`, '역세권 이용 장소 확인'],
        [`${meta.base}/check/building-access/`, '건물 출입 방식 확인'],
        [`${meta.base}/check/time/`, '예약 가능 시간 확인'],
        [`${meta.base}/`, `${meta.name} 출장마사지 홈`],
      ];
      const { faq, html } = stationBody(s, meta, related);
      const breadcrumbs = [home, regionCrumb, { name: '역세권', url: `${meta.base}/` }, { name: s.name, url }];
      await emit(url, page({ url, title: `${s.h1}｜간다GO`, description: s.desc, breadcrumbs, faq, body: html }));
    }

    // 예약 전 확인 (공유 템플릿, 지역 컨텍스트 반영)
    for (const c of checks) {
      const url = `${meta.base}/check/${c.slug}/`;
      const related = [
        [`${meta.base}/check/address/`, '방문 주소 확인'],
        [`${meta.base}/check/hotel-policy/`, '호텔 객실 출입 정책'],
        [`${meta.base}/check/officetel-rule/`, '오피스텔 관리 규정'],
        ['/privacy-policy/', '개인정보 처리방침'],
        ['/service-policy/', '불법·선정적 서비스 불가 안내'],
      ].filter(([u]) => u !== url);
      const { faq, html } = checkBody(c, meta, related);
      const breadcrumbs = [home, regionCrumb, { name: '예약 전 확인', url: `${meta.base}/` }, { name: c.name, url }];
      await emit(url, page({ url, title: `${meta.name} ${c.h1}｜간다GO`, description: `${meta.name} ${c.desc}`, breadcrumbs, faq, body: html }));
    }
  }

  // 마사지 프로그램 (전역)
  { const h = programsHub(); await emit(h.url, page(h)); }
  for (const p of programs) {
    const url = `/programs/${p.slug}/`;
    const { faq, html } = programBody(p);
    const breadcrumbs = [{ name: '홈', url: '/' }, { name: '마사지 프로그램', url: '/programs/' }, { name: p.name, url }];
    await emit(url, page({ url, title: p.title, description: p.desc, breadcrumbs, faq, body: html }));
  }

  // 정책/정적 (전역)
  for (const p of policies) {
    const url = `/${p.slug}/`;
    const breadcrumbs = [{ name: '홈', url: '/' }, { name: p.name, url }];
    await emit(url, page({ url, title: `${p.h1}｜간다GO`, description: p.desc, breadcrumbs, body: policyBody(p) }));
  }

  // 사이트맵(HTML)
  {
    const url = '/sitemap/';
    const breadcrumbs = [{ name: '홈', url: '/' }, { name: '사이트맵', url }];
    await emit(url, page({ url, title: '사이트맵｜간다GO', description: '간다GO 서울·경기 출장마사지 안내 전체 페이지 목록입니다.', breadcrumbs, body: sitemapHtmlBody() }));
  }

  // sitemap.xml
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${site.baseUrl.replace(/\/$/, '')}${u}</loc></url>`).join('\n')}
</urlset>`;
  await fs.writeFile(path.join(DIST, 'sitemap.xml'), xml, 'utf8');

  // robots.txt
  const robots = `User-agent: *
Allow: /
Sitemap: ${site.baseUrl.replace(/\/$/, '')}/sitemap.xml`;
  await fs.writeFile(path.join(DIST, 'robots.txt'), robots, 'utf8');

  console.log(`✓ 빌드 완료: ${urls.length} indexable pages (지역 ${regions.length}개) → dist/`);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
