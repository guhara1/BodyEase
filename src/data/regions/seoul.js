// 서울 지역 — 기존 데이터(pages.js)를 지역 래퍼로 구성
import { hubs, times, belts, districts, stations } from '../pages.js';
import { seoulDongs } from '../dongs-seoul.js';

export const seoul = {
  meta: {
    key: 'seoul',
    name: '서울',
    nameTopic: '서울은',
    base: '/seoul-service',
    admin: '25개 자치구와 427개 행정동',
    districtWord: '구',
    districtLabel: '구별 안내',
    beltTitle: '서울 8대 생활벨트',
    seoTitle: '서울 출장마사지｜호텔·오피스텔·업무지구·야간 홈타이 지역 안내',
    seoDesc: '서울 출장마사지 예약 전 강남·잠실·홍대·여의도 등 생활권과 호텔·오피스텔 이용 기준 안내.',
    h1: '서울 출장마사지 · 이용 장소와 생활권별 예약 안내',
    intro: '서울에서 호텔, 오피스텔, 아파트, 업무지구, 관광 숙소 이용 전 필요한 주소 확인, 건물 출입, 예약 가능 시간, 개인정보 처리 기준을 안내합니다.',
    tagline: '강남·잠실·홍대·여의도·성수 등 25개 구 생활권 안내',
  },
  hubs,
  times,
  belts,
  districts,
  stations,
  dongs: seoulDongs,
};
