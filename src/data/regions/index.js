// 지역 레지스트리 — 새 지역은 여기에 추가하면 자동으로 빌드에 포함됩니다.
// 헤더·푸터·홈 지역 선택·사이트맵 모두 이 배열을 기준으로 자동 생성됩니다.
import { seoul } from './seoul.js';
import { gyeonggi } from './gyeonggi.js';
import { incheon } from './incheon.js';
import { busan } from './busan.js';
import { daegu } from './daegu.js';
import { daejeon } from './daejeon.js';
import { gwangju } from './gwangju.js';
import { ulsan } from './ulsan.js';
import { sejong } from './sejong.js';
import { gangwon } from './gangwon.js';
import { chungbuk } from './chungbuk.js';
import { chungnam } from './chungnam.js';
import { jeonbuk } from './jeonbuk.js';
import { jeonnam } from './jeonnam.js';
import { gyeongbuk } from './gyeongbuk.js';
import { gyeongnam } from './gyeongnam.js';
import { jeju } from './jeju.js';
// 주요 도시 허브 (meta.kind === 'city') — 도(道) 내부 대도시의 구·생활권 심화 안내
import { suwon } from './suwon.js';
import { seongnam } from './seongnam.js';
import { yongin } from './yongin.js';
import { goyang } from './goyang.js';
import { changwon } from './changwon.js';
import { cheongju } from './cheongju.js';
import { cheonan } from './cheonan.js';
import { jeonju } from './jeonju.js';
import { pohang } from './pohang.js';

// checks(예약 전 확인 템플릿)와 policies(전역 정책)는 pages.js에서 공유
export { checks, policies } from '../pages.js';

// 순서: 수도권 → 광역시 → 도(道) → 주요 도시 순으로 노출
export const regions = [
  seoul,
  gyeonggi,
  incheon,
  busan,
  daegu,
  daejeon,
  gwangju,
  ulsan,
  sejong,
  gangwon,
  chungbuk,
  chungnam,
  jeonbuk,
  jeonnam,
  gyeongbuk,
  gyeongnam,
  jeju,
  // 주요 도시 허브
  suwon,
  seongnam,
  yongin,
  goyang,
  changwon,
  cheongju,
  cheonan,
  jeonju,
  pohang,
];
