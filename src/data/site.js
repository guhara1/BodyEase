// 간다GO — 사이트 전역 설정 (business info, contact, SEO defaults)
// 텔레그램/전화 등 연락처는 이 파일 한 곳에서만 관리합니다.

export const site = {
  brand: '간다GO',
  brandEn: 'GandaGO',
  // 공식 도메인 (배포 시 실제 도메인으로 교체)
  baseUrl: 'https://gandago.co.kr',
  locale: 'ko_KR',
  lang: 'ko',

  // 연락처
  phone: '0508-202-4719',
  phoneHref: 'tel:0508-202-4719',

  // 텔레그램 (배포 전 실제 채널/계정으로 교체하세요)
  telegram: {
    // 웹사이트 제작문의
    build: 'https://t.me/gandago_build',
    // 제휴문의
    partner: 'https://t.me/gandago_partner',
  },

  // 대표 SEO
  defaultTitle: '간다GO｜서울 출장마사지 이용 장소·생활권별 예약 안내',
  // 메타 디스크립션은 각 페이지에서 80자 이내로 개별 지정
  defaultDescription: '간다GO 서울 출장마사지 예약 전 호텔·오피스텔·업무지구 이용 기준과 생활권을 안내합니다.',

  // 대표 이미지 (og:image / schema image) — 배포 시 실제 파일로 교체
  ogImage: '/assets/og-default.jpg',

  // 코스·요금 (메인 요금 섹션)
  courses: [
    { name: '60분 코스', minutes: '60분', price: '90,000', desc: '기본 컨디션·릴랙스 케어' },
    { name: '90분 코스', minutes: '90분', price: '150,000', desc: '아로마 포함 추천 구성', recommended: true },
    { name: '120분 코스', minutes: '120분', price: '180,000', desc: '전신 집중 프리미엄 케어' },
  ],
};

// 80자 이내 디스크립션 보장용 헬퍼 (초과 시 잘라 … 처리)
export function clampDesc(text, max = 80) {
  const t = String(text).replace(/\s+/g, ' ').trim();
  if ([...t].length <= max) return t;
  return [...t].slice(0, max - 1).join('') + '…';
}
