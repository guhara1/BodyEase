// 지역 레지스트리 — 이 배열에 등록된 지역만 빌드됩니다.
// 지침서 기준: 서울지역 출장마사지 사이트 (2번째 버전, 이용 상황별 허브 구조).
//
// 다른 지역 데이터 파일(gyeonggi.js, incheon.js, busan.js 등)은 리포지토리에
// 보관되어 있으며, 필요 시 아래 배열에 import 후 추가하면 헤더·푸터·홈·사이트맵에
// 자동 반영됩니다. 현재는 지침서 범위(서울 전용)에 맞춰 서울만 빌드합니다.
import { seoul } from './seoul.js';

// checks(예약 전 확인 템플릿)와 policies(전역 정책)는 pages.js에서 공유
export { checks, policies } from '../pages.js';

export const regions = [seoul];
