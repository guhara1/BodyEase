// 간다GO — 페이지 본문(아티클) 빌더 (다지역 지원)
// 각 페이지가 이름만 바꾼 중복 본문이 되지 않도록, 해당 페이지의 실제
// 생활권/역세권/이용 장소 데이터와 지역 컨텍스트(ctx)를 본문·FAQ에 반영합니다.
//
// ctx = { key, name, nameTopic, base, admin, districtWord, districtLabel, beltTitle }
import { site } from '../data/site.js';
import { whwBlock, faqHtml, relatedHtml } from './templates.js';

// 공통 예약 전 체크리스트
export const CHECKLIST = [
  '방문 주소(도로명·건물명·동·호수)를 정확히 확인했나요?',
  '호텔·오피스텔·아파트 중 이용 장소를 확인했나요?',
  '공동현관 또는 건물 출입 방식이 있나요?',
  '예약 가능 시간과 이동 거리를 확인했나요?',
  '주차 또는 차량 진입이 가능한가요?',
  '야간 출입 제한이 있나요?',
  '개인정보 처리 기준을 확인했나요?',
  '불법·선정적 서비스 불가 안내를 확인했나요?',
];

function checklistHtml(items = CHECKLIST) {
  return `<ul class="checklist">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
}

// 이용 코스·요금표 — 모든 지역 상세 페이지에 공통 노출
export function priceTable(ctx) {
  const region = ctx && ctx.name ? `${ctx.name} 지역도 ` : '';
  const cards = site.courses
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
    .join('\n      ');
  return `<h2>이용 코스와 요금</h2>
    <p>${region}동일한 코스·요금으로 이용하실 수 있습니다. 60·90·120분 코스별 기준 요금이며, 추가 비용 없이 있는 그대로 안내드립니다.</p>
    <div class="pricing pricing--compact" style="margin-top:22px">
      ${cards}
    </div>
    <p style="margin-top:16px">지역·예약 시간대·이동 거리에 따라 상담 시 최종 확인됩니다. <a href="/terms/">상세 요금 안내 보기 →</a></p>`;
}

function figure(alt) {
  // 대표 이미지 — 전 상세 페이지에 실제 <img>로 노출 (페이지별 고유 alt, image sitemap 대상)
  return `<figure class="figure"><img src="/assets/hero-bg.webp" alt="${alt}" loading="lazy" decoding="async" width="1600" height="900"><figcaption>${alt}</figcaption></figure>`;
}

// 지역별 안내 배너 (개인정보 / 불법·선정적 서비스 불가)
function policyNotice(ctx) {
  return `<div class="notice">
  ${site.brand}는 예약 확인과 연락에 필요한 <a href="${ctx.base}/check/privacy/">최소 개인정보</a>만 확인하며,
  <a href="/service-policy/">불법·선정적 서비스</a>는 제공하거나 안내하지 않습니다.
  방문 가능 여부는 실제 주소와 예약 조건 확인 후 안내합니다.
</div>`;
}

// Who/How/Why 블록 — subject(페이지 고유 주제)를 반영해 페이지마다 다르게 생성
function whw(ctx, subject) {
  const s = subject || `${ctx.name} 이용`;
  return whwBlock({
    who: `이 페이지는 ${ctx.name} ${s}을(를) 앞둔 이용자가 숙소 유형·건물 출입·예약 조건을 미리 확인하도록 정리했습니다. ${s} 관련 문의에서 실제로 자주 확인되는 항목을 기준으로 관리합니다.`,
    how: `${ctx.name} 공식 행정구역 자료와 ${s} 예약 시 확인되는 실제 항목, 개인정보 처리 기준을 바탕으로 작성합니다. AI 보조 도구를 쓰더라도 최종 문구는 사람이 검수하며 과장·중복 표현을 제거합니다.`,
    why: `이 페이지의 목적은 검색 순위 조작이 아니라, ${s} 전에 확인하면 도착 지연을 줄일 수 있는 내용을 이해하기 쉽게 안내하는 것입니다. 제공하지 않는 서비스나 불법·선정적 내용은 다루지 않습니다.`,
  });
}

// 이용 장소별 차이 설명 — subject를 반영한 도입부로 페이지마다 다르게 생성 (허브 페이지 전용)
function useDiff(ctx, subject) {
  const s = subject || '이용';
  return `<h2>이용 장소별로 확인 사항이 다릅니다</h2>
<p>${s} 시에도 <strong>호텔</strong>은 객실 출입과 프런트 확인, <strong>오피스텔</strong>은 공동현관과 관리 규정,
<strong>아파트·자택</strong>은 경비실과 주차, <strong>업무지구</strong>는 퇴근 후 이동과 건물 출입 방식이 서로 다릅니다.
지역명보다 먼저 어떤 <a href="${ctx.base}/use/hotel/">이용 장소</a>인지 확인하면 준비가 정확해집니다.</p>
<ul>
  <li><a href="${ctx.base}/use/hotel/">호텔·숙소</a> — 객실 출입 가능 여부, 프런트 확인, 예약자명, 야간 출입</li>
  <li><a href="${ctx.base}/use/officetel/">오피스텔</a> — 공동현관, 엘리베이터, 경비실, 관리 규정, 방문 가능 시간</li>
  <li><a href="${ctx.base}/use/apartment-home/">아파트·자택</a> — 동·호수, 공동현관, 경비실, 주차</li>
  <li><a href="${ctx.base}/use/business-district/">업무지구</a> — 퇴근 후 예약, 차량 이동, 건물 출입, 야간 시간대</li>
</ul>`;
}

// 짧은 이용장소 링크 안내 — 허브 외 페이지에서 긴 useDiff 대신 사용 (중복 축소)
function useLinksInline(ctx) {
  return `<p>이용 장소에 따라 확인 항목이 달라집니다 —
<a href="${ctx.base}/use/hotel/">호텔·숙소</a>,
<a href="${ctx.base}/use/officetel/">오피스텔</a>,
<a href="${ctx.base}/use/apartment-home/">아파트·자택</a>,
<a href="${ctx.base}/use/business-district/">업무지구</a> 페이지에서 유형별 기준을 확인하세요.</p>`;
}

// ---------------------------------------------------------------------------
// 허브(이용 상황별) 페이지 본문
// ---------------------------------------------------------------------------
export function hubBody(hub, ctx, relatedLinks) {
  const subj = hub.focus;
  const areas = hub.areas.map((a) => `<li>${a}</li>`).join('');
  const faq = [
    { q: `${hub.focus} 시 무엇을 먼저 확인해야 하나요?`, a: `${hub.angle}` },
    { q: `${ctx.name} 전 지역 방문이 가능한가요?`, a: '실제 방문 주소, 가까운 생활권, 예약 가능 시간, 이동 기준을 확인한 뒤 안내합니다.' },
    { q: '야간 예약도 가능한가요?', a: '무조건 가능하다고 안내하지 않습니다. 주소, 이동 거리, 건물 출입, 예약 가능 시간 확인 후 안내합니다.' },
    { q: '불법·선정적 서비스도 가능한가요?', a: '불법·선정적 서비스는 제공하거나 안내하지 않습니다.' },
  ];
  return {
    faq,
    html: `<section class="section">
  <div class="container article">
    <p class="eyebrow">${ctx.name} · 이용 상황별 안내</p>
    <h1>${hub.h1}</h1>
    <p class="lede">${ctx.name}에서 ${hub.focus} 전 확인해야 할 주소·건물 출입·예약 가능 시간 기준을 정리했습니다. ${site.brand}는 실제 예약 조건을 확인한 뒤 방문 가능 여부를 안내합니다.</p>
    ${figure(hub.imgAlt)}

    <h2>${hub.focus} 개요</h2>
    <p>${hub.angle} ${ctx.nameTopic} ${ctx.admin}으로 구성되어 있어 지역명만으로는 이용 조건을 판단하기 어렵습니다. 그래서 ${hub.focus}처럼 이용 상황을 먼저 확인하는 것이 예약을 더 정확하게 만듭니다.</p>

    <h2>주요 이용 생활권</h2>
    <p>${hub.focus}와 관련해 문의가 많은 ${ctx.name} 생활권은 다음과 같습니다. 같은 생활권이라도 건물·숙소 유형에 따라 확인 사항이 달라집니다.</p>
    <ul>${areas}</ul>

    <h2>${hub.focus} 생활권 참고</h2>
    <p>${hub.areas[0]}·${hub.areas[1]} 등 위 생활권은 건물·숙소 유형이 섞여 있어, 같은 ${hub.focus}라도 생활권마다 확인 항목이 조금씩 다릅니다. 예약 시 어느 생활권인지와 건물 유형을 함께 알려주시면 그에 맞춰 안내드립니다.</p>
    ${useLinksInline(ctx)}

    <h2>건물 출입 기준</h2>
    <p>공동현관 인증, 엘리베이터 카드, 경비실 방문자 등록, 프런트 확인 방식은 건물마다 다릅니다. 도착 후 지연을 줄이려면 예약 전에 출입 방식을 미리 확인하는 것이 좋습니다. 자세한 내용은 <a href="${ctx.base}/check/building-access/">건물 출입 방식</a>과 <a href="${ctx.base}/check/apartment-access/">공동현관 확인</a> 페이지를 참고하세요.</p>

    <h2>예약 흐름</h2>
    <p>${hub.focus}의 예약은 보통 ①이용 장소와 정확한 주소 확인 → ②예약 가능 시간·이동 거리 확인 → ③건물 출입 방식 안내 → ④예약 확정 순서로 진행됩니다. 조건이 확인되지 않은 상태에서 가능 여부를 단정하지 않으며, 변경이 필요한 경우 사전 연락으로 조정할 수 있습니다. 시간대별 기준은 <a href="${ctx.base}/time/after-work/">퇴근 후 예약</a>과 <a href="${ctx.base}/time/night/">야간 예약</a> 페이지를 참고하세요.</p>

    <h2>예약 전 확인사항</h2>
    ${checklistHtml()}

    ${policyNotice(ctx)}

    ${priceTable(ctx)}

    <h2>자주 묻는 질문</h2>
    ${faqHtml(faq)}

    <h2>Who · How · Why</h2>
    ${whw(ctx, subj)}

    <h2>관련 페이지 보기</h2>
    ${relatedHtml(relatedLinks)}
  </div>
</section>`,
  };
}

// ---------------------------------------------------------------------------
// 시간대별 페이지 본문
// ---------------------------------------------------------------------------
export function timeBody(t, ctx, relatedLinks) {
  const subj = `${t.name}`;
  const faq = [
    { q: `${t.name} 시 무엇을 확인해야 하나요?`, a: t.angle },
    { q: '예약 가능 시간은 어떻게 정해지나요?', a: '이동 거리와 교통 상황을 반영해 도착 예상 시간을 안내합니다. 여유 있는 시간을 잡는 것이 좋습니다.' },
    { q: '예약 변경은 가능한가요?', a: '사전 연락을 원칙으로 하며, 변경·취소 가능 시점은 예약 변경 기준 페이지에서 확인할 수 있습니다.' },
  ];
  return {
    faq,
    html: `<section class="section">
  <div class="container article">
    <p class="eyebrow">${ctx.name} · 시간대별 안내</p>
    <h1>${t.h1}</h1>
    <p class="lede">${t.desc}</p>
    <p>${ctx.name}에서 ${t.name}을 고려하신다면, 이 페이지에서 시간대 특성과 예약 전 확인 사항을 먼저 살펴보세요. 이용 장소와 건물 출입 방식에 따라 같은 시간대라도 가능 여부와 도착 시간이 달라질 수 있습니다.</p>
    ${figure(`${ctx.name} ${t.name} 안내 이미지`)}

    <h2>${t.name} 개요</h2>
    <p>${t.angle} 시간대에 따라 상권 혼잡, 건물 출입, 숙소 정책이 달라지므로, 예약 전 이동 여유와 도착 예상 시간을 함께 확인하는 것이 좋습니다.</p>

    <h2>${t.name} 특성</h2>
    <p>${t.detail}</p>

    <h2>준비하면 좋은 정보</h2>
    <ul>
      <li>이용 장소 유형과 정확한 주소·건물명</li>
      <li>희망 시간대와 여유 시간 범위</li>
      <li>공동현관·프런트 등 건물 출입 방식</li>
      <li>주차 또는 차량 진입 가능 여부</li>
      <li>예약 변경 가능성이 있다면 미리 알려주세요</li>
    </ul>

    <h2>이런 점도 함께 확인하세요</h2>
    <p>같은 시간대라도 ${ctx.name} 안에서 생활권에 따라 교통 흐름과 건물 운영 방식이 다릅니다. 업무지구는 퇴근 시간 전후로 출입 절차가 바뀌는 건물이 있고, 숙박시설은 시간대에 따라 프런트 운영과 객실 방문 정책이 달라질 수 있습니다. 아파트·오피스텔은 늦은 시간 공동현관 인증이 제한되기도 합니다. 예약 시 이용 장소와 시간대를 함께 알려주시면 해당 조건에 맞춰 확인해 드립니다.</p>

    ${useLinksInline(ctx)}

    <h2>예약 전 확인사항</h2>
    ${checklistHtml()}

    ${policyNotice(ctx)}

    ${priceTable(ctx)}

    <h2>자주 묻는 질문</h2>
    ${faqHtml(faq)}

    <h2>Who · How · Why</h2>
    ${whw(ctx, subj)}

    <h2>관련 페이지 보기</h2>
    ${relatedHtml(relatedLinks)}
  </div>
</section>`,
  };
}

// ---------------------------------------------------------------------------
// 생활벨트 페이지 본문
// ---------------------------------------------------------------------------
export function beltBody(belt, ctx, relatedLinks) {
  const subj = `${belt.name} 이용`;
  const areas = belt.areas.map((a) => `<li>${a}</li>`).join('');
  const faq = [
    { q: `${belt.name}에는 어떤 지역이 포함되나요?`, a: `${belt.areas.join(', ')} 등이 포함됩니다.` },
    { q: `${belt.name} 이용 시 무엇을 확인해야 하나요?`, a: belt.angle },
    { q: '역세권별 안내도 있나요?', a: '역명 기준 이용 상황형 역세권 페이지에서 인근 이용 장소를 확인할 수 있습니다. 출구별·노선별 개별 페이지는 만들지 않습니다.' },
  ];
  return {
    faq,
    html: `<section class="section">
  <div class="container article">
    <p class="eyebrow">${ctx.beltTitle}</p>
    <h1>${belt.h1}</h1>
    <p class="lede">${belt.desc}</p>
    ${figure(`${belt.name} 이용 안내 이미지`)}

    <h2>${belt.name} 개요</h2>
    <p>${belt.angle} ${belt.name}은 하나의 이름으로 묶여 있지만 내부 생활권마다 건물·숙소 유형과 이용 조건이 다릅니다. 예약 전에는 정확한 주소와 이용 장소를 먼저 확인하는 것이 좋으며, 아래 생활권 목록과 이용 시 참고 사항을 함께 살펴보시면 준비가 수월합니다.</p>

    <h2>포함 생활권</h2>
    <ul>${areas}</ul>

    <h2>${belt.name} 이용 시 참고</h2>
    <p>${belt.areas[0]}${belt.areas[1] ? `·${belt.areas[1]}` : ''} 방면은 문의가 잦은 축에 속하며, 시간대에 따라 이동 소요가 크게 달라질 수 있습니다. ${belt.areas.length > 2 ? `${belt.areas.slice(2).join(', ')} 일대는` : '그 외 생활권은'} 건물 유형에 따라 출입 절차가 달라 예약 전 정확한 주소와 건물명을 확인하는 것이 좋습니다. 야간 시간대에는 공동현관·프런트 운영이 제한될 수 있어 가능 여부를 먼저 확인해 드립니다. 주말에는 상권·관광지 인근 혼잡과 주차 여건을 함께 고려해 주세요.</p>

    ${useLinksInline(ctx)}

    <h2>건물 출입 기준</h2>
    <p>${belt.name} 내 호텔·오피스텔·아파트는 공동현관 인증, 프런트 확인, 경비실 방문자 등록 방식이 서로 다릅니다. 오피스텔은 관리 규정과 방문 가능 시간, 호텔은 예약자명 일치와 객실 출입 정책, 아파트는 동·호수와 경비실 안내가 확인 포인트입니다. <a href="${ctx.base}/check/building-access/">건물 출입 방식</a> 페이지에서 유형별 확인 사항을 참고하세요.</p>

    <h2>시간대별 참고</h2>
    <p>낮 시간대에는 대부분 생활권에서 이동이 원활하지만, 출퇴근 시간대에는 주요 도로 흐름이 크게 바뀝니다. 야간에는 건물 출입 제한 여부를 먼저 확인해야 하며, 주말에는 상권 혼잡과 주차 여건이 평일과 다릅니다. <a href="${ctx.base}/time/after-work/">퇴근 후 예약</a>, <a href="${ctx.base}/time/night/">야간 예약</a> 기준을 함께 참고하시면 시간대에 맞는 준비를 할 수 있습니다.</p>

    <h2>예약 전 확인사항</h2>
    ${checklistHtml()}

    ${policyNotice(ctx)}

    ${priceTable(ctx)}

    <h2>자주 묻는 질문</h2>
    ${faqHtml(faq)}

    <h2>Who · How · Why</h2>
    ${whw(ctx, subj)}

    <h2>관련 페이지 보기</h2>
    ${relatedHtml(relatedLinks)}
  </div>
</section>`,
  };
}

// ---------------------------------------------------------------------------
// 구/시 페이지 본문
// 생활권(sub)마다 이용 장소 관점을 달리한 상세 문단을 생성해
// 지역명만 바꾼 얇은 페이지가 되지 않도록 본문을 2,000자 이상으로 구성합니다.
// ---------------------------------------------------------------------------

// 생활권별 안내 문단 템플릿 — 문장 구조를 회전시켜 페이지 간 어순 중복을 줄임
const SUB_ANGLES = [
  (s, d) => `<h3>${s}</h3><p>${s} 일대는 ${d.name}에서 문의가 잦은 생활권입니다. 상권과 주거가 섞여 있어 같은 ${s}라도 호텔·오피스텔·아파트 중 어느 곳을 이용하는지에 따라 출입 절차가 달라집니다. 예약 시 정확한 건물명과 층수까지 확인해 주시면 도착까지의 지연을 줄일 수 있습니다.</p>`,
  (s, d) => `<h3>${s}</h3><p>${s} 방면 예약은 이동 동선을 먼저 확인하는 것이 좋습니다. 시간대에 따라 교통 흐름이 크게 달라지는 구간이 있어, 예약 가능 시간과 도착 예상 시간을 상담 시 함께 안내드립니다. 오피스텔이라면 공동현관 인증 방식, 아파트라면 동·호수와 경비실 확인이 필요합니다.</p>`,
  (s, d) => `<h3>${s}</h3><p>숙박시설을 이용해 ${s} 인근에서 예약하시는 경우, 체크인 이후 객실 출입 가능 여부와 예약자명 일치를 먼저 확인해 주세요. 시설마다 방문 정책이 다르기 때문에 예약 전 상담 시 숙소 이름을 알려주시면 이용 가능한 방식으로 안내드립니다.</p>`,
  (s, d) => `<h3>${s}</h3><p>${s} 쪽은 야간 시간대 문의가 많은 편입니다. 야간에는 공동현관·프런트 운영이 제한될 수 있어 무조건 가능하다고 안내하지 않으며, 건물 출입 방식과 이동 거리를 확인한 뒤 가능 여부를 알려드립니다. 주차 여건도 함께 확인하면 좋습니다.</p>`,
  (s, d) => `<h3>${s}</h3><p>${s} 일대에서 자택·아파트로 예약하시는 경우 동·호수, 공동현관 비밀번호 또는 방문자 등록 절차, 엘리베이터 이용 방식을 미리 준비해 주시면 원활합니다. 차량 진입이 어려운 구간이 있다면 상담 시 알려주세요.</p>`,
];

function subSections(d) {
  // 시작 오프셋을 지역명 길이 기반으로 회전 → 인접 페이지 간 동일 순서 반복 방지
  const offset = [...d.name].length + d.sub.length;
  return d.sub
    .map((s, i) => SUB_ANGLES[(offset + i) % SUB_ANGLES.length](s, d))
    .join('\n    ');
}

export function districtBody(d, ctx, beltName, relatedLinks) {
  const subj = `${d.name} 이용`;
  const faq = [
    { q: `${d.name}는 어떤 생활권으로 나뉘나요?`, a: `${d.sub.join(', ')} 등 생활권별로 이용 조건이 다릅니다.` },
    { q: `${d.name} 이용 시 무엇을 확인해야 하나요?`, a: '방문 주소, 이용 장소(호텔·오피스텔·아파트·업무지구), 건물 출입 방식, 예약 가능 시간을 확인합니다.' },
    { q: '야간 예약도 가능한가요?', a: '무조건 가능하다고 안내하지 않습니다. 주소, 이동 거리, 건물 출입, 예약 가능 시간 확인 후 안내합니다.' },
    { q: `${d.name} 외곽이나 경계 지역도 방문하나요?`, a: '이동 거리와 예약 가능 시간을 확인한 뒤 안내합니다. 정확한 주소를 알려주시면 가능 여부를 빠르게 확인할 수 있습니다.' },
  ];
  return {
    faq,
    html: `<section class="section">
  <div class="container article">
    <p class="eyebrow">${ctx.name} ${ctx.districtLabel}</p>
    <h1>${d.h1}</h1>
    <p class="lede">${d.desc}</p>
    ${figure(`${d.name} 이용 안내 이미지`)}

    <h2>${d.name} 개요</h2>
    <p>${d.name}는 단순 지역명보다 ${d.sub.join(', ')}처럼 생활권 차이가 큽니다. 업무지구와 호텔, 오피스텔, 주거지가 섞여 있으므로 예약 전 주소, 건물 출입, 숙소 규정, 이동 기준을 함께 확인해야 합니다. ${d.name}는 <a href="${ctx.base}/belt/${d.belt}/">${beltName}</a>에 속합니다.</p>

    <h2>${d.name} 생활권별 이용 안내</h2>
    <p>아래는 ${d.name} 내 대표 생활권별로 예약 전 확인하면 좋은 내용입니다. 같은 ${ctx.districtWord} 안에서도 생활권에 따라 건물 유형과 출입 방식이 다르므로, 해당하는 생활권을 참고해 주세요.</p>
    ${subSections(d)}

    ${useLinksInline(ctx)}

    <h2>가까운 역세권</h2>
    <p>${d.name} 이용 시에는 인근 역세권의 이용 장소도 함께 확인하면 이동이 원활합니다. 역세권은 역명 기준 1개 페이지로 관리하며, 출구별·노선별 개별 페이지는 만들지 않습니다.</p>

    <h2>예약 전 확인사항</h2>
    ${checklistHtml()}

    ${policyNotice(ctx)}

    ${priceTable(ctx)}

    <h2>자주 묻는 질문</h2>
    ${faqHtml(faq)}

    <h2>Who · How · Why</h2>
    ${whw(ctx, subj)}

    <h2>관련 페이지 보기</h2>
    ${relatedHtml(relatedLinks)}
  </div>
</section>`,
  };
}

// ---------------------------------------------------------------------------
// 역세권 페이지 본문
// ---------------------------------------------------------------------------
export function stationBody(s, ctx, relatedLinks) {
  const subj = `${s.name} 인근 이용`;
  const faq = [
    { q: `${s.name} 인근에서는 무엇을 확인해야 하나요?`, a: s.angle },
    { q: '역세권 페이지는 출구별로 있나요?', a: '아니요. 출구별 페이지는 중복 위험이 크기 때문에 역명 기준 1개 페이지로 관리합니다.' },
    { q: '방문 가능 시간은 어떻게 되나요?', a: '이동 거리와 건물 출입 방식, 예약 가능 시간을 확인한 뒤 안내합니다.' },
  ];
  return {
    faq,
    html: `<section class="section">
  <div class="container article">
    <p class="eyebrow">${ctx.name} · 핵심 역세권</p>
    <h1>${s.h1}</h1>
    <p class="lede">${s.desc}</p>
    ${figure(`${s.name} 이용 안내 이미지`)}

    <h2>${s.name} 이용 개요</h2>
    <p>${s.angle} 역세권은 이용 장소(호텔·오피스텔·상권·업무지구)에 따라 건물 출입 방식이 다르므로, 예약 전 정확한 주소와 이용 장소를 먼저 확인하는 것이 좋습니다.</p>

    <h2>${s.name} 주변 특성</h2>
    <p>${s.detail}</p>

    <h2>${s.name} 인근 이용 시 준비하면 좋은 정보</h2>
    <ul>
      <li>이용할 건물의 정확한 이름과 주소 (역 이름만으로는 위치 특정이 어렵습니다)</li>
      <li>호텔·오피스텔·아파트 중 이용 장소 유형</li>
      <li>공동현관 비밀번호 또는 방문자 등록 절차 여부</li>
      <li>희망 시간대와 예약 가능 시간</li>
      <li>주차 또는 차량 진입 가능 여부</li>
    </ul>

    ${useLinksInline(ctx)}

    <h2>건물 출입 기준</h2>
    <p>${s.name} 인근 건물은 공동현관·프런트·경비실 확인 방식이 다양합니다. 오피스텔은 공동현관 인증과 방문 가능 시간, 호텔·레지던스는 프런트 확인과 예약자명 일치, 아파트는 동·호수와 경비실 안내가 핵심입니다. 자세한 내용은 <a href="${ctx.base}/check/building-access/">건물 출입 방식</a>과 <a href="${ctx.base}/check/time/">예약 가능 시간</a> 페이지를 함께 확인하세요.</p>

    <h2>예약 흐름</h2>
    <p>${s.name} 인근 예약은 보통 ①이용 장소·주소 확인 → ②예약 가능 시간과 이동 거리 확인 → ③건물 출입 방식 안내 → ④예약 확정 순서로 진행됩니다. 정확한 건물명을 알려주시면 확인이 빨라지고, 변경이 필요할 때는 사전 연락으로 조정할 수 있습니다.</p>

    <h2>예약 전 확인사항</h2>
    ${checklistHtml()}

    ${policyNotice(ctx)}

    ${priceTable(ctx)}

    <h2>자주 묻는 질문</h2>
    ${faqHtml(faq)}

    <h2>Who · How · Why</h2>
    ${whw(ctx, subj)}

    <h2>관련 페이지 보기</h2>
    ${relatedHtml(relatedLinks)}
  </div>
</section>`,
  };
}

// ---------------------------------------------------------------------------
// 행정동 페이지 본문 (지침서 1차-B)
// 동별 실제 특성(types·stations·angle)을 반영해 지역명만 바꾼 본문이 되지 않도록 구성.
// ---------------------------------------------------------------------------
const DONG_TYPE_SECTIONS = {
  office: (d) => `<h3>업무지구·퇴근 후 이용</h3><p>${d.name} 일대 업무 시설에서 퇴근 후 예약하시는 경우, 이동 시간과 저녁 교통 흐름을 반영해 도착 예상 시간을 안내드립니다. 사무 건물은 야간 출입 절차가 건물마다 달라, 이용 장소가 오피스텔·자택·숙소 중 어디인지와 함께 건물 출입 방식을 확인해 주세요.</p>`,
  hotel: (d) => `<h3>호텔·숙소 이용</h3><p>${d.name} 인근 호텔·숙소에서 이용하시는 경우 객실 출입 가능 여부, 프런트 확인 방식, 예약자명 일치가 핵심 확인 사항입니다. 시설마다 외부 방문 정책이 달라 숙소 이름을 알려주시면 이용 가능한 방식으로 안내드립니다. 체크인 직후 시간대는 문의가 몰릴 수 있어 여유 있는 예약을 권합니다.</p>`,
  officetel: (d) => `<h3>오피스텔 이용</h3><p>${d.name}의 오피스텔은 공동현관 인증, 엘리베이터 카드, 방문 가능 시간이 건물마다 다릅니다. 예약 시 건물명과 공동현관 위치를 알려주시면 출입 확인이 빨라지고, 관리 규정상 방문 시간이 제한되는 건물은 사전에 안내드립니다.</p>`,
  apt: (d) => `<h3>아파트·자택 이용</h3><p>${d.name} 주거지에서 이용하시는 경우 동·호수, 공동현관 비밀번호 또는 방문자 등록 절차, 경비실 안내 방식을 미리 준비해 주시면 원활합니다. 단지 규모가 큰 경우 동 위치에 따라 진입로가 달라질 수 있어 차량 진입 방향도 함께 확인합니다.</p>`,
  shopping: (d) => `<h3>상권 인근 이용</h3><p>${d.name} 상권 인근은 시간대에 따라 혼잡도 차이가 큽니다. 저녁·주말에는 도로 정체와 주차 여건을 감안해 도착 시간을 여유 있게 잡는 것이 좋으며, 상권 내 숙소·오피스텔 이용 시에는 건물 출입 방식을 먼저 확인해 드립니다.</p>`,
  tour: (d) => `<h3>관광 숙소 이용</h3><p>${d.name}의 게스트하우스·레지던스·부티크 숙소는 체크인 후 예약이 일반적입니다. 객실 출입 규정과 예약자명 확인이 필요하며, 시설별 방문 정책이 달라 숙소명을 알려주시면 가능 여부를 먼저 확인해 안내드립니다.</p>`,
};

export function dongBody(d, ctx, relatedLinks) {
  const subj = `${d.name} 이용`;
  const typeSections = d.types.map((t) => DONG_TYPE_SECTIONS[t](d)).join('\n    ');
  const faq = [
    { q: `${d.name}은 어떤 이용 문의가 많은 곳인가요?`, a: d.angle },
    { q: `${d.name}에서 무엇을 먼저 확인해야 하나요?`, a: '이용 장소(호텔·오피스텔·아파트), 정확한 주소와 건물명, 건물 출입 방식, 예약 가능 시간을 확인합니다.' },
    { q: '가까운 역은 어디인가요?', a: `${d.stations.join(', ')} 인근에서 이용 문의가 많습니다. 역세권 페이지에서 이용 장소 기준을 함께 확인할 수 있습니다.` },
    { q: '야간에도 이용할 수 있나요?', a: '무조건 가능하다고 안내하지 않습니다. 건물 야간 출입 가능 여부와 이동 거리를 확인한 뒤 안내드립니다.' },
  ];
  return {
    faq,
    html: `<section class="section">
  <div class="container article">
    <p class="eyebrow">${d.guName} · 행정동 안내</p>
    <h1>${d.h1}</h1>
    <p class="lede">${d.desc}</p>
    ${figure(`${d.name} 이용 안내 이미지`)}

    <h2>${d.name} 이용 개요</h2>
    <p>${d.angle} ${d.name}은 ${d.guName}에 속하며, 행정 경계보다는 실제 이용 장소(호텔·오피스텔·아파트·업무지구)에 따라 확인할 내용이 달라집니다. 같은 동 안에서도 건물 유형에 따라 출입 절차와 예약 가능 시간이 다를 수 있으니, 아래 유형별 안내와 예약 전 체크리스트를 함께 확인해 주세요.</p>

    <h2>${d.name} 이용 장소별 안내</h2>
    ${typeSections}

    <h2>가까운 역세권과 예약 흐름</h2>
    <p>${d.name}은 ${d.stations.join(', ')} 방면에서 접근이 편리합니다. 역 이름만으로는 위치 특정이 어려우므로 정확한 건물명과 주소를 알려주시면 도착 시간을 더 정확히 안내드립니다. 예약은 ①이용 장소·주소 확인 → ②예약 가능 시간·이동 거리 확인 → ③건물 출입 방식 안내 → ④예약 확정 순서로 진행되며, 조건이 확인되지 않은 상태에서 가능 여부를 단정하지 않습니다.</p>

    <h2>예약 전 확인사항</h2>
    ${checklistHtml()}

    ${policyNotice(ctx)}

    ${priceTable(ctx)}

    <h2>자주 묻는 질문</h2>
    ${faqHtml(faq)}

    <h2>Who · How · Why</h2>
    ${whw(ctx, subj)}

    <h2>관련 페이지 보기</h2>
    ${relatedHtml(relatedLinks)}
  </div>
</section>`,
  };
}

// 체크 페이지별 고유 보강 문단 (2,000자 확보 + 페이지 차별화)
const CHECK_NOTES = {
  address: '지도 앱에서 목적지를 검색해 정확한 도로명이 맞는지 대조하고, 상가와 주거가 함께 있는 복합 건물은 상가동·주거동 구분까지 확인하면 도착 지점이 어긋나지 않습니다. 주소가 확정되면 예약 확인이 빨라집니다.',
  'building-access': '오래된 빌라나 상가 건물은 공동현관이 없는 대신 계단·복도 구조가 복잡한 경우가 있어, 몇 층 몇 호인지와 계단·엘리베이터 위치를 함께 알려주시면 도움이 됩니다. 방문자 등록이 필요한 곳은 미리 등록해 두는 편이 좋습니다.',
  'apartment-access': '방문 시점에 세대에서 공동현관을 열어주실 수 있는지 미리 정해두면 출입이 매끄럽습니다. 택배·방문 차량 출입구가 별도인 단지도 있어, 도보·차량 중 어느 쪽으로 오는지에 따라 안내드리는 경로가 달라질 수 있습니다. 지상 차량 통제 단지는 지하 주차장을 통해 세대로 올라가는 경우가 많으니 주차 동선도 함께 확인하면 좋습니다.',
  'hotel-policy': '같은 브랜드 호텔이라도 지점마다 외부 방문 규정이 다를 수 있어, 예약하신 지점명을 정확히 알려주시는 것이 좋습니다. 로비에서 잠깐 맞이해 주시거나 프런트에 미리 방문 안내를 남겨두면 확인 절차가 한결 수월합니다.',
  'officetel-rule': '주거용과 업무용이 섞인 오피스텔은 방문 규정도 혼재하는 경우가 있어, 관리사무소 안내나 입주민 공지를 확인해 두면 좋습니다. 방문 차량 등록이 사전 신청제인 건물은 예약 시 미리 알려주시면 주차까지 함께 안내드립니다.',
  parking: '발렛 주차만 운영하는 건물이나 높이 제한이 있는 지하 주차장은 차량에 따라 진입이 어려울 수 있습니다. 방문자 주차가 유료인 곳은 정산 방식도 미리 확인하면, 도착 후 주차 문제로 시간을 쓰지 않습니다. 주차가 어려운 지역이라면 대중교통 이용이나 인근 거점 주차 후 도보 이동을 고려하는 것도 방법입니다.',
  'night-access': '심야에는 정문 대신 특정 출입구만 열려 있거나 야간 전용 호출 방식으로 바뀌는 건물이 있습니다. 경비실이 무인으로 전환되는 시간대라면 세대·객실에서 직접 맞이해 주셔야 하므로, 야간 예약은 출입 방식을 특히 꼼꼼히 확인합니다.',
  time: '연휴나 대형 행사가 있는 날은 특정 지역의 이동 시간이 평소의 두 배 이상으로 늘기도 합니다. 촘촘한 일정보다 앞뒤로 여유를 둔 시간대를 잡으면, 교통 지연이 생겨도 예약을 무리 없이 진행할 수 있습니다. 원하는 시작 시각이 있다면 그보다 조금 이르게 예약해 두는 것이 안전합니다.',
  'change-policy': '변경이 잦을 것으로 예상되면 예약 시 미리 말씀해 주시는 편이 조율에 유리합니다. 특히 방문 장소가 바뀌면 이동 거리와 도착 시간이 함께 달라지므로, 확정된 주소를 가능한 한 이르게 알려주시면 원하는 시간에 맞추기 쉽습니다. 부득이한 사정이 생겼을 때도 연락이 이를수록 다른 시간대로 조정할 여지가 커집니다.',
  privacy: '수집한 정보는 예약 담당자가 예약 이행 목적으로만 확인하며, 별도의 광고 수신 동의를 받지 않습니다. 개인정보와 관련해 궁금한 점이 있으면 개인정보 처리방침 페이지를 참고하시거나 문의처로 연락 주시면 안내드립니다.',
  'service-policy': '이 원칙은 특정 지역이나 시간대와 무관하게 모든 예약에 동일하게 적용됩니다. 서비스 범위를 벗어난 요청에는 응하지 않으며, 건전한 방문형 관리라는 운영 기준을 일관되게 유지합니다.',
  'customer-notice': '음주 상태이거나 컨디션이 크게 좋지 않은 경우에는 이용을 권하지 않으며, 안전을 위해 일정 조정을 안내드릴 수 있습니다. 편안한 이용을 위해 조용한 공간과 충분한 자리를 미리 확보해 두시면 좋습니다.',
};

// ---------------------------------------------------------------------------
// 예약 전 확인(체크) 페이지 본문 — 지역 컨텍스트 반영
// ---------------------------------------------------------------------------
export function checkBody(c, ctx, relatedLinks) {
  const subj = `${c.name}`;
  const faq = [
    { q: `${c.name}은 왜 확인해야 하나요?`, a: c.body },
    { q: '확인은 언제 하나요?', a: '예약 전에 미리 확인하면 도착 후 지연을 줄이고 원활하게 이용할 수 있습니다.' },
    { q: '확인이 어려운 항목이 있으면 어떻게 하나요?', a: '상담 시 알고 있는 정보만 알려주셔도 됩니다. 나머지는 예약 확인 과정에서 함께 확인해 드립니다.' },
  ];
  return {
    faq,
    html: `<section class="section">
  <div class="container article">
    <p class="eyebrow">${ctx.name} · 예약 전 확인</p>
    <h1>${ctx.name} ${c.h1}</h1>
    <p class="lede">${ctx.name} ${c.desc}</p>
    ${figure(`${ctx.name} ${c.name} 안내 이미지`)}

    <h2>${c.name}</h2>
    <p>${ctx.name} 지역 예약 시 ${c.body}</p>

    <h2>${c.name} — 이것만은 확인하세요</h2>
    <ul>${(c.points || []).map((p) => `<li>${p}</li>`).join('')}</ul>
    <p>${c.deep || ''}</p>
    <p>${CHECK_NOTES[c.slug] || ''}</p>

    <h2>확인이 어려울 때</h2>
    <p>모든 항목을 완벽하게 준비하지 않으셔도 됩니다. 알고 있는 정보(주소, 이용 장소, 희망 시간)만 먼저 알려주시면 나머지는 예약 확인 과정에서 함께 확인해 드립니다. 다만 ${c.name}처럼 도착 후 바로 필요한 정보는 미리 확인해 두시는 편이 ${ctx.name} 이용 시간 확보에 도움이 됩니다.</p>

    ${useLinksInline(ctx)}

    <h2>함께 확인하면 좋은 항목</h2>
    ${checklistHtml()}

    ${policyNotice(ctx)}

    ${priceTable(ctx)}

    <h2>자주 묻는 질문</h2>
    ${faqHtml(faq)}

    <h2>Who · How · Why</h2>
    ${whw(ctx, subj)}

    <h2>관련 페이지 보기</h2>
    ${relatedHtml(relatedLinks)}
  </div>
</section>`,
  };
}
