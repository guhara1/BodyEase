// 지역 레지스트리 — 새 지역은 여기에 추가하면 자동으로 빌드에 포함됩니다.
import { seoul } from './seoul.js';
import { gyeonggi } from './gyeonggi.js';
import { incheon } from './incheon.js';
import { busan } from './busan.js';
import { daegu } from './daegu.js';

// checks(예약 전 확인 템플릿)와 policies(전역 정책)는 pages.js에서 공유
export { checks, policies } from '../pages.js';

export const regions = [seoul, gyeonggi, incheon, busan, daegu];
