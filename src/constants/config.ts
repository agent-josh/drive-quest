export const APP_NAME = 'Drive Quest';

/** 로그인 없이 UI·학습만 체험하는 데모 모드 */
export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE !== 'false';

/** @deprecated use learningCourse.ts */
export const LEARNING_SESSION_SIZE = 20;
/** 확인 퀴즈 합격 — 20문항 중 12문항 이상 (60%) */
export const LEARNING_QUIZ_PASS_CORRECT = 12;
export const LEARNING_POINTS_PER_CORRECT = 10;
export const MOCK_EXAM_DEFAULT_SIZE = 40;
export const MOCK_EXAM_PASS_SCORE = 60;
/** 운전면허 필기 시험 제한 시간 (초) */
export const MOCK_EXAM_TIME_SECONDS = 60 * 60;

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** 공공데이터포털 — 도로교통공단 운전면허 문제은행 (15100163) */
export const KOROAD_DATASET_ID = '15100163';
export const KOROAD_UDDI = '602623e8-9263-48f1-b53c-ad7cd88ff6f5';
export const DATA_GO_KR_SERVICE_KEY = process.env.EXPO_PUBLIC_DATA_GO_KR_SERVICE_KEY ?? '';
