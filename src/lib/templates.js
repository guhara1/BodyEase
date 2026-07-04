// 간다GO — HTML 템플릿 & JSON-LD 스키마 빌더
import { site, clampDesc } from '../data/site.js';
import { regions, checks } from '../data/regions/index.js';
import { reviews as allReviews, reviewStats } from '../data/reviews.js';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const abs = (path) => site.baseUrl.replace(/\/$/, '') + path;

// ---------------------------------------------------------------------------
// JSON-LD 스키마
//  - 허용: WebPage, BreadcrumbList, Organization, WebSite, FAQPage, ImageObject
//  - 금지: LocalBusiness, Review, AggregateRating (오프라인 매장 없는 방문형 서비스)
// ---------------------------------------------------------------------------
export function organizationSchema({ withReviews = false } = {}) {
  const org = {
    '@type': 'Organization',
    '@id': abs('/#organization'),
    name: site.brand,
    alternateName: site.brandEn,
    url: site.baseUrl,
    telephone: site.phone,
    image: abs(site.ogImage),
    logo: abs('/assets/logo.png'),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: site.phone,
      contactType: 'reservations',
      areaServed: 'KR',
      availableLanguage: ['Korean', 'English'],
    },
    sameAs: [site.telegram.build, site.telegram.partner],
    // 종합 평점 (사용자 요청) — 전 페이지 노출
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(reviewStats.average),
      reviewCount: String(reviewStats.count),
      bestRating: '5',
      worstRating: '1',
    },
  };
  // 개별 후기 스키마는 후기가 실제로 노출되는 페이지(홈·후기)에만 부착
  if (withReviews) {
    org.review = allReviews.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author },
      datePublished: r.date,
      name: r.title,
      reviewRating: { '@type': 'Rating', ratingValue: String(r.rating), bestRating: '5', worstRating: '1' },
      reviewBody: r.body,
    }));
  }
  return org;
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': abs('/#website'),
    url: site.baseUrl,
    name: site.defaultTitle,
    inLanguage: site.locale,
    publisher: { '@id': abs('/#organization') },
  };
}

// 페이지 그래프 (@graph) 생성
export function buildSchemaGraph({ url, title, description, image, breadcrumbs = [], faq = [], withReviews = false }) {
  const graph = [organizationSchema({ withReviews }), websiteSchema()];

  const webpage = {
    '@type': 'WebPage',
    '@id': abs(url) + '#webpage',
    url: abs(url),
    name: title,
    description: clampDesc(description, 300),
    isPartOf: { '@id': abs('/#website') },
    inLanguage: site.locale,
    primaryImageOfPage: { '@id': abs(url) + '#primaryimage' },
  };
  if (breadcrumbs.length) webpage.breadcrumb = { '@id': abs(url) + '#breadcrumb' };
  graph.push(webpage);

  // 선호 이미지 지정 (ImageObject) — og:image와 함께 대표 썸네일 명시
  graph.push({
    '@type': 'ImageObject',
    '@id': abs(url) + '#primaryimage',
    url: abs(image || site.ogImage),
    contentUrl: abs(image || site.ogImage),
    caption: title,
  });

  if (breadcrumbs.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': abs(url) + '#breadcrumb',
      itemListElement: breadcrumbs.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        item: abs(b.url),
      })),
    });
  }

  if (faq.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': abs(url) + '#faq',
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

// ---------------------------------------------------------------------------
// <head>
// ---------------------------------------------------------------------------
function head({ url, title, description, image, schema, noindex }) {
  const desc = clampDesc(description, 80); // 디스크립션 80자 이내 보장
  const canonical = abs(url);
  const img = abs(image || site.ogImage);
  return `<!DOCTYPE html>
<html lang="${site.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.brand)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${img}">
<meta property="og:locale" content="${site.locale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${img}">
<meta name="theme-color" content="#070b16">
<meta name="naver-site-verification" content="4408f5a5f725f955a13b53b40d9ad3ac7914ad55">
<link rel="alternate" type="application/rss+xml" title="${esc(site.brand)} 업데이트" href="/rss.xml">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="/styles/main.css">
<script type="application/ld+json">
${JSON.stringify(schema)}
</script>
</head>`;
}

// ---------------------------------------------------------------------------
// 헤더
// ---------------------------------------------------------------------------
function header() {
  // 지시서 5. 상단 메뉴 구성 — 메뉴명에 '출장마사지'를 반복하지 않는다.
  // 다중 항목 메뉴는 드롭다운으로 구성 (구별 안내 = 서울 25개 자치구 전체).
  const R = regions[0];
  const base = R.meta.base;
  const menu = [
    { type: 'link', href: `${base}/`, label: '서울 홈' },
    { type: 'group', label: '이용 장소', items: R.hubs.map((h) => [`${base}/use/${h.slug}/`, h.focus]) },
    { type: 'group', label: '시간대 안내', items: R.times.map((t) => [`${base}/time/${t.slug}/`, t.name]) },
    { type: 'group', label: '생활벨트', items: R.belts.map((b) => [`${base}/belt/${b.slug}/`, b.name]) },
    { type: 'group', label: '구별 안내', wide: true, items: R.districts.map((d) => [`${base}/district/${d.slug}/`, d.name]) },
    { type: 'group', label: '역세권', align: 'right', items: R.stations.map((s) => [`${base}/station/${s.slug}/`, s.name]) },
    { type: 'group', label: '예약 전 확인', align: 'right', items: checks.map((c) => [`${base}/check/${c.slug}/`, c.name]) },
    { type: 'link', href: '/programs/', label: '프로그램' },
    { type: 'link', href: '/reviews/', label: '후기' },
    { type: 'link', href: '/contact/', label: '문의하기' },
  ];

  const renderItem = (m) => {
    if (m.type === 'link') return `<a class="nav__link" href="${m.href}">${m.label}</a>`;
    const panelCls = `nav__panel${m.wide ? ' nav__panel--wide' : ''}${m.align === 'right' ? ' nav__panel--right' : ''}`;
    const items = m.items.map(([u, t]) => `<a href="${u}">${t}</a>`).join('');
    return `<div class="nav__item">
        <button type="button" class="nav__trigger" aria-expanded="false" aria-haspopup="true">${m.label}<span class="nav__caret" aria-hidden="true">▾</span></button>
        <div class="${panelCls}" role="menu">${items}</div>
      </div>`;
  };

  return `<a href="#main" class="skip">본문 바로가기</a>
<header class="site-header">
  <div class="container nav">
    <a class="nav__brand" href="/"><span class="dot"></span>${site.brand}</a>
    <nav class="nav__links" aria-label="주요 메뉴">
      ${menu.map(renderItem).join('\n      ')}
    </nav>
    <div class="nav__cta">
      <a class="btn btn--ghost btn--sm" href="${site.phoneHref}">전화예약 <span class="long">${site.phone}</span></a>
      <button type="button" class="nav__toggle" aria-label="메뉴 열기" aria-expanded="false">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
    </div>
  </div>
</header>`;
}

// ---------------------------------------------------------------------------
// 푸터 — 오렌지 제작문의·제휴문의 버튼(텔레그램) + 상호/전화
// ---------------------------------------------------------------------------
function footer() {
  // 전체 지역 디렉터리 (푸터 상단 전체폭 칩 행) — 시·도 / 주요 도시 분리
  const chip = (r) => `<a href="${r.meta.base}/">${r.meta.name}</a>`;
  const provinceChips = regions.filter((r) => r.meta.kind !== 'city').map(chip).join('\n      ');
  const cityChips = regions.filter((r) => r.meta.kind === 'city').map(chip).join('\n      ');
  const cols = [
    ['프로그램', [
      ['/programs/swedish/', '스웨디시'],
      ['/programs/sports/', '스포츠마사지'],
      ['/programs/thai/', '태국마사지'],
      ['/programs/', '전체 프로그램'],
    ]],
    ['주요 지역', regions.slice(0, 4).map((r) => [`${r.meta.base}/`, `${r.meta.name} 출장마사지`])],
    ['이용 장소', [
      ['/seoul-service/use/hotel/', '호텔·숙소'],
      ['/seoul-service/use/officetel/', '오피스텔'],
      ['/seoul-service/use/business-district/', '업무지구'],
      ['/seoul-service/use/night/', '야간 예약'],
    ]],
    ['안내', [
      ['/seoul-service/check/address/', '예약 전 확인'],
      ['/operating-standards/', '운영 기준'],
      ['/service-policy/', '불법·선정적 서비스 불가'],
      ['/privacy-policy/', '개인정보 처리방침'],
    ]],
  ];
  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-cta">
      <div class="footer-cta__text">
        <strong>웹사이트 제작·제휴가 필요하신가요?</strong>
        <p>간다GO 스타일의 SEO 최적화 사이트 제작과 제휴를 텔레그램으로 상담해 드립니다.</p>
      </div>
      <div class="footer-cta__btns">
        <a class="btn btn--primary" href="${site.telegram.build}" target="_blank" rel="noopener nofollow">웹사이트 제작문의</a>
        <a class="btn btn--primary" href="${site.telegram.partner}" target="_blank" rel="noopener nofollow">제휴문의</a>
      </div>
    </div>

    <div class="footer-regions">
      <h4>지역 안내</h4>
      <div class="related">
      ${provinceChips}
      </div>
      ${cityChips ? `<h4 style="margin-top:22px">주요 도시</h4>
      <div class="related">
      ${cityChips}
      </div>` : ''}
    </div>

    <div class="footer-grid">
      <div class="footer-brand">
        <span class="dot"></span><strong>${site.brand}</strong>
        <div class="footer-biz">
          <b>상호</b> ${site.brand}<br>
          전국 출장마사지 · 이용 장소와 생활권별 예약 안내
        </div>
        <a class="footer-tel" href="${site.phoneHref}">📞 전화예약 ${site.phone}</a>
      </div>
      ${cols.map(([h, items]) => `<div>
        <h4>${h}</h4>
        <ul>${items.map(([u, t]) => `<li><a href="${u}">${t}</a></li>`).join('')}</ul>
      </div>`).join('\n      ')}
    </div>

    <div class="footer-bottom">
      <div>© ${'2026'} ${site.brand}. 방문형 웰니스 안내 · 불법·선정적 서비스를 제공하지 않습니다.</div>
      <div>
        <a href="/about/">작성자·검수자</a> ·
        <a href="/privacy-policy/">개인정보처리방침</a> ·
        <a href="/sitemap.xml">사이트맵</a>
      </div>
    </div>
  </div>
</footer>`;
}

// ---------------------------------------------------------------------------
// 공통 블록
// ---------------------------------------------------------------------------
export function breadcrumbHtml(crumbs) {
  return `<nav class="breadcrumb container" aria-label="위치">
    ${crumbs
      .map((c, i) =>
        i === crumbs.length - 1
          ? `<span aria-current="page">${c.name}</span>`
          : `<a href="${c.url}">${c.name}</a><span>›</span>`
      )
      .join('')}
  </nav>`;
}

export function whwBlock({ who, how, why }) {
  return `<div class="whw">
    <div class="whw__item"><h4>Who · 누가</h4><p>${who}</p></div>
    <div class="whw__item"><h4>How · 어떻게</h4><p>${how}</p></div>
    <div class="whw__item"><h4>Why · 왜</h4><p>${why}</p></div>
  </div>`;
}

export function faqHtml(faq) {
  if (!faq.length) return '';
  return `<div class="faq">
    ${faq
      .map(
        (f) => `<details>
      <summary>${f.q}</summary>
      <p>${f.a}</p>
    </details>`
      )
      .join('\n    ')}
  </div>`;
}

export function relatedHtml(links) {
  if (!links.length) return '';
  return `<div class="related">
    ${links.map(([u, t]) => `<a href="${u}">${t}</a>`).join('\n    ')}
  </div>`;
}

// 고객 후기 노출 (별점 포함) — 스키마와 동일 내용이 화면에 보이도록
export function reviewsHtml(list = allReviews) {
  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
  const cards = list
    .map(
      (r) => `<figure class="review-card">
      <div class="review-card__stars" aria-label="별점 ${r.rating}점 만점 5점">${stars(r.rating)}<span>${r.rating}.0</span></div>
      <blockquote class="review-card__body">${r.body}</blockquote>
      <figcaption class="review-card__meta"><strong>${r.author}</strong> · ${r.title} · <time datetime="${r.date}">${r.date.replace(/-/g, '.')}</time></figcaption>
    </figure>`
    )
    .join('\n    ');
  return `<div class="review-summary">
    <span class="review-summary__score">${reviewStats.average}</span>
    <span class="review-summary__stars" aria-hidden="true">★★★★★</span>
    <span class="review-summary__count">고객 후기 ${reviewStats.count}건 · 평균 별점 ${reviewStats.average} / 5</span>
  </div>
  <div class="reviews">
    ${cards}
  </div>`;
}

// ---------------------------------------------------------------------------
// 페이지 셸
// ---------------------------------------------------------------------------
// 모바일 플로팅 전화 버튼 — 전 페이지 우측 하단, 오렌지, 흔들림 애니메이션, 탭 시 전화 연결
function floatingCall() {
  return `<a class="call-fab" href="${site.phoneHref}" aria-label="전화예약 ${site.phone}">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.2 2.2z"/></svg>
  <span class="call-fab__pulse" aria-hidden="true"></span>
</a>`;
}

// 헤더 드롭다운 + 모바일 메뉴 토글 스크립트 (JS 미지원 시에도 hover/focus로 동작)
const NAV_SCRIPT = `<script>
(function(){
  var header=document.querySelector('.site-header');
  var toggle=document.querySelector('.nav__toggle');
  if(toggle){toggle.addEventListener('click',function(){
    var open=header.classList.toggle('nav--open');
    toggle.setAttribute('aria-expanded',open?'true':'false');
  });}
  var triggers=document.querySelectorAll('.nav__trigger');
  triggers.forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var item=btn.parentElement,wasOpen=item.classList.contains('open');
      document.querySelectorAll('.nav__item.open').forEach(function(i){if(i!==item){i.classList.remove('open');i.querySelector('.nav__trigger').setAttribute('aria-expanded','false');}});
      item.classList.toggle('open',!wasOpen);
      btn.setAttribute('aria-expanded',!wasOpen?'true':'false');
    });
  });
  document.addEventListener('click',function(){
    document.querySelectorAll('.nav__item.open').forEach(function(i){i.classList.remove('open');i.querySelector('.nav__trigger').setAttribute('aria-expanded','false');});
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){
    document.querySelectorAll('.nav__item.open').forEach(function(i){i.classList.remove('open');i.querySelector('.nav__trigger').setAttribute('aria-expanded','false');});
    if(header.classList.contains('nav--open')){header.classList.remove('nav--open');toggle&&toggle.setAttribute('aria-expanded','false');}
  }});
})();
</script>`;

export function page({ url, title, description, image, breadcrumbs, faq, noindex, body, withReviews = false }) {
  const schema = buildSchemaGraph({ url, title, description, image, breadcrumbs, faq, withReviews });
  return `${head({ url, title, description, image, schema, noindex })}
<body>
${header()}
<main id="main">
${body}
</main>
${footer()}
${floatingCall()}
${NAV_SCRIPT}
</body>
</html>`;
}

export { esc, abs };
