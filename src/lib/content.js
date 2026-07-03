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

function figure(alt) {
  return `<div class="figure" role="img" aria-label="${alt}">${alt}</div>`;
}

// 지역별 안내 배너 (개인정보 / 불법·선정적 서비스 불가)
function policyNotice(ctx) {
  return `<div class="notice">
  ${site.brand}는 예약 확인과 연락에 필요한 <a href="${ctx.base}/check/privacy/">최소 개인정보</a>만 확인하며,
  <a href="/service-policy/">불법·선정적 서비스</a>는 제공하거나 안내하지 않습니다.
  방문 가능 여부는 실제 주소와 예약 조건 확인 후 안내합니다.
</div>`;
}

// Who/How/Why 블록 (지역 반영)
function whw(ctx) {
  return whwBlock({
    who: `이 콘텐츠는 ${ctx.name} 지역 방문형 웰니스 서비스 이용 전, 사용자가 숙소 유형·건물 출입·생활권·예약 조건을 확인할 수 있도록 작성되었습니다.`,
    how: `${ctx.name} 공식 행정구역 자료와 실제 예약 전 확인 항목, 개인정보 처리 기준을 바탕으로 작성하며, AI 보조 도구를 사용해도 최종 문구는 사람이 검수합니다.`,
    why: `검색 순위 조작이 아니라, ${ctx.name}에서 호텔·오피스텔·아파트·업무지구 이용 전 필요한 확인사항을 이해하기 쉽게 안내하기 위해서입니다.`,
  });
}

// 이용 장소별 차이 표준 설명 (지역 링크)
function useDiff(ctx) {
  return `<h2>이용 장소별로 확인 사항이 다릅니다</h2>
<p>같은 지역이라도 <strong>호텔</strong>은 객실 출입과 프런트 확인, <strong>오피스텔</strong>은 공동현관과 관리 규정,
<strong>아파트·자택</strong>은 경비실과 주차, <strong>업무지구</strong>는 퇴근 후 이동과 건물 출입 방식이 서로 다릅니다.
예약 전에는 지역명보다 먼저 <a href="${ctx.base}/use/hotel/">이용 장소</a>를 확인하는 것이 정확합니다.</p>
<ul>
  <li><a href="${ctx.base}/use/hotel/">호텔·숙소</a> — 객실 출입 가능 여부, 프런트 확인, 예약자명, 야간 출입</li>
  <li><a href="${ctx.base}/use/officetel/">오피스텔</a> — 공동현관, 엘리베이터, 경비실, 관리 규정, 방문 가능 시간</li>
  <li><a href="${ctx.base}/use/apartment-home/">아파트·자택</a> — 동·호수, 공동현관, 경비실, 주차</li>
  <li><a href="${ctx.base}/use/business-district/">업무지구</a> — 퇴근 후 예약, 차량 이동, 건물 출입, 야간 시간대</li>
</ul>`;
}

// ---------------------------------------------------------------------------
// 허브(이용 상황별) 페이지 본문
// ---------------------------------------------------------------------------
export function hubBody(hub, ctx, relatedLinks) {
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

    ${useDiff(ctx)}

    <h2>건물 출입 기준</h2>
    <p>공동현관 인증, 엘리베이터 카드, 경비실 방문자 등록, 프런트 확인 방식은 건물마다 다릅니다. 도착 후 지연을 줄이려면 예약 전에 출입 방식을 미리 확인하는 것이 좋습니다. 자세한 내용은 <a href="${ctx.base}/check/building-access/">건물 출입 방식</a>과 <a href="${ctx.base}/check/apartment-access/">공동현관 확인</a> 페이지를 참고하세요.</p>

    <h2>예약 전 확인사항</h2>
    ${checklistHtml()}

    ${policyNotice(ctx)}

    <h2>자주 묻는 질문</h2>
    ${faqHtml(faq)}

    <h2>Who · How · Why</h2>
    ${whw(ctx)}

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
    ${figure(`${ctx.name} ${t.name} 안내 이미지`)}

    <h2>${t.name} 개요</h2>
    <p>${t.angle} 시간대에 따라 상권 혼잡, 건물 출입, 숙소 정책이 달라지므로, 예약 전 이동 여유와 도착 예상 시간을 함께 확인하는 것이 좋습니다.</p>

    ${useDiff(ctx)}

    <h2>예약 전 확인사항</h2>
    ${checklistHtml()}

    ${policyNotice(ctx)}

    <h2>자주 묻는 질문</h2>
    ${faqHtml(faq)}

    <h2>Who · How · Why</h2>
    ${whw(ctx)}

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
    <p>${belt.angle} ${belt.name}은 하나의 이름으로 묶여 있지만 내부 생활권마다 건물·숙소 유형과 이용 조건이 다릅니다. 예약 전에는 정확한 주소와 이용 장소를 먼저 확인하는 것이 좋습니다.</p>

    <h2>포함 생활권</h2>
    <ul>${areas}</ul>

    ${useDiff(ctx)}

    <h2>건물 출입 기준</h2>
    <p>${belt.name} 내 호텔·오피스텔·아파트는 공동현관 인증, 프런트 확인, 경비실 방문자 등록 방식이 서로 다릅니다. <a href="${ctx.base}/check/building-access/">건물 출입 방식</a> 페이지에서 유형별 확인 사항을 참고하세요.</p>

    <h2>예약 전 확인사항</h2>
    ${checklistHtml()}

    ${policyNotice(ctx)}

    <h2>자주 묻는 질문</h2>
    ${faqHtml(faq)}

    <h2>Who · How · Why</h2>
    ${whw(ctx)}

    <h2>관련 페이지 보기</h2>
    ${relatedHtml(relatedLinks)}
  </div>
</section>`,
  };
}

// ---------------------------------------------------------------------------
// 구/시 페이지 본문
// ---------------------------------------------------------------------------
export function districtBody(d, ctx, beltName, relatedLinks) {
  const sub = d.sub.map((s) => `<li>${s}</li>`).join('');
  const faq = [
    { q: `${d.name}는 어떤 생활권으로 나뉘나요?`, a: `${d.sub.join(', ')} 등 생활권별로 이용 조건이 다릅니다.` },
    { q: `${d.name} 이용 시 무엇을 확인해야 하나요?`, a: '방문 주소, 이용 장소(호텔·오피스텔·아파트·업무지구), 건물 출입 방식, 예약 가능 시간을 확인합니다.' },
    { q: '야간 예약도 가능한가요?', a: '무조건 가능하다고 안내하지 않습니다. 주소, 이동 거리, 건물 출입, 예약 가능 시간 확인 후 안내합니다.' },
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

    <h2>${d.name} 대표 생활권</h2>
    <ul>${sub}</ul>

    ${useDiff(ctx)}

    <h2>가까운 역세권</h2>
    <p>${d.name} 이용 시에는 인근 역세권의 이용 장소도 함께 확인하면 이동이 원활합니다. 역세권은 역명 기준 1개 페이지로 관리하며, 출구별·노선별 개별 페이지는 만들지 않습니다.</p>

    <h2>예약 전 확인사항</h2>
    ${checklistHtml()}

    ${policyNotice(ctx)}

    <h2>자주 묻는 질문</h2>
    ${faqHtml(faq)}

    <h2>Who · How · Why</h2>
    ${whw(ctx)}

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

    ${useDiff(ctx)}

    <h2>건물 출입 기준</h2>
    <p>${s.name} 인근 건물은 공동현관·프런트·경비실 확인 방식이 다양합니다. <a href="${ctx.base}/check/building-access/">건물 출입 방식</a>과 <a href="${ctx.base}/check/time/">예약 가능 시간</a> 페이지를 함께 확인하세요.</p>

    <h2>예약 전 확인사항</h2>
    ${checklistHtml()}

    ${policyNotice(ctx)}

    <h2>자주 묻는 질문</h2>
    ${faqHtml(faq)}

    <h2>Who · How · Why</h2>
    ${whw(ctx)}

    <h2>관련 페이지 보기</h2>
    ${relatedHtml(relatedLinks)}
  </div>
</section>`,
  };
}

// ---------------------------------------------------------------------------
// 예약 전 확인(체크) 페이지 본문 — 지역 컨텍스트 반영
// ---------------------------------------------------------------------------
export function checkBody(c, ctx, relatedLinks) {
  const faq = [
    { q: `${c.name}은 왜 확인해야 하나요?`, a: c.body },
    { q: '확인은 언제 하나요?', a: '예약 전에 미리 확인하면 도착 후 지연을 줄이고 원활하게 이용할 수 있습니다.' },
  ];
  return {
    faq,
    html: `<section class="section">
  <div class="container article">
    <p class="eyebrow">${ctx.name} · 예약 전 확인</p>
    <h1>${ctx.name} ${c.h1}</h1>
    <p class="lede">${ctx.name} ${c.desc}</p>

    <h2>${c.name}</h2>
    <p>${ctx.name} 지역 예약 시 ${c.body}</p>

    <h2>함께 확인하면 좋은 항목</h2>
    ${checklistHtml()}

    ${policyNotice(ctx)}

    <h2>자주 묻는 질문</h2>
    ${faqHtml(faq)}

    <h2>Who · How · Why</h2>
    ${whw(ctx)}

    <h2>관련 페이지 보기</h2>
    ${relatedHtml(relatedLinks)}
  </div>
</section>`,
  };
}
