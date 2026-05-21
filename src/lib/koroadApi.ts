import {
  DATA_GO_KR_SERVICE_KEY,
  KOROAD_DATASET_ID,
  KOROAD_UDDI,
} from '@/constants/config';
import { LEARNING_TOTAL_QUESTIONS } from '@/constants/learningCourse';
import { stripOptionPrefix } from '@/lib/questionText';
import type { AppQuestion, KoroadFetchResult, QuestionSource } from '@/types/koroad';

const API_BASE = `https://api.odcloud.kr/api/${KOROAD_DATASET_ID}/v1/uddi:${KOROAD_UDDI}`;
const PAGE_SIZE = 200;

type FallbackRow = {
  questionNumber: number;
  category: string;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const FALLBACK_DATA: FallbackRow[] = require('../../assets/data/koroad-fallback.json');

function pickString(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const v = row[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number') return String(v);
  }
  return '';
}

function pickOptions(row: Record<string, unknown>): string[] {
  const options: string[] = [];
  for (let i = 1; i <= 5; i += 1) {
    const text = pickString(row, [
      `보기${i}`,
      `보기 ${i}`,
      `option_${i}`,
      `option${i}`,
      `choice${i}`,
    ]);
    if (text) options.push(text);
  }
  const trimmed = options.length >= 2 ? options.slice(0, 4) : options;
  return trimmed.map(stripOptionPrefix);
}

function parseCorrectAnswer(raw: string, optionCount: number): number {
  const answerMatch = raw.match(/정답\s*[：:]\s*(\d+)/);
  if (answerMatch) {
    const n = parseInt(answerMatch[1], 10);
    if (n >= 1 && n <= optionCount) return n;
  }
  const cleaned = raw.replace(/[①②③④⑤]/g, (m) => {
    const map: Record<string, string> = { '①': '1', '②': '2', '③': '3', '④': '4', '⑤': '5' };
    return map[m] ?? m;
  });
  const nums = cleaned.match(/\d+/g);
  if (!nums?.length) return 1;
  const n = parseInt(nums[nums.length - 1], 10);
  if (n >= 1 && n <= optionCount) return n;
  return 1;
}

function mapApiRow(row: Record<string, unknown>, index: number): AppQuestion | null {
  const content = pickString(row, ['문제', '문항', 'question', 'content', '제목']);
  if (!content) return null;

  const options = pickOptions(row);
  if (options.length < 2) return null;

  const answerRaw = pickString(row, ['정답', 'answer', 'correct_answer', 'correctAnswer']);
  const category = pickString(row, ['분류', '카테고리', 'category', '영역']) || '운전면허';
  const explanation =
    pickString(row, ['해설', 'explanation', 'comment']) ||
    '한국도로교통공단 운전면허 문제은행 (공공데이터)';

  const qNumRaw = pickString(row, ['번호', '문항번호', 'question_number', 'num']);
  const questionNumber = qNumRaw ? parseInt(qNumRaw, 10) : index + 1;

  return {
    id: `koroad-${questionNumber}`,
    questionNumber: Number.isFinite(questionNumber) ? questionNumber : index + 1,
    category,
    content,
    options,
    correctAnswer: parseCorrectAnswer(answerRaw, options.length),
    explanation,
  };
}

function mapFallbackRows(rows: FallbackRow[]): AppQuestion[] {
  return rows.map((row) => ({
    id: `fallback-${row.questionNumber}`,
    questionNumber: row.questionNumber,
    category: row.category,
    content: row.content,
    options: row.options,
    correctAnswer: row.correctAnswer,
    explanation: row.explanation,
  }));
}

export function getFallbackQuestions(): AppQuestion[] {
  return mapFallbackRows(FALLBACK_DATA);
}

function dedupeByQuestionNumber(questions: AppQuestion[]): AppQuestion[] {
  const byNum = new Map<number, AppQuestion>();
  for (const q of questions) {
    if (!byNum.has(q.questionNumber)) byNum.set(q.questionNumber, q);
  }
  return [...byNum.values()].sort((a, b) => a.questionNumber - b.questionNumber);
}

async function fetchKoroadPage(page: number, perPage: number) {
  const url =
    `${API_BASE}?page=${page}&perPage=${perPage}` +
    `&serviceKey=${encodeURIComponent(DATA_GO_KR_SERVICE_KEY)}`;

  const res = await fetch(url);
  const json = (await res.json()) as {
    data?: Record<string, unknown>[];
    totalCount?: number;
    code?: number;
    msg?: string;
  };

  if (!res.ok || json.code === -401) {
    throw new Error(json.msg ?? `API 오류 (${res.status})`);
  }

  const rows = json.data ?? [];
  const questions = rows
    .map((row, i) => mapApiRow(row, (page - 1) * perPage + i))
    .filter((q): q is AppQuestion => q !== null);

  return {
    questions,
    totalCount: json.totalCount ?? questions.length,
  };
}

/** 공공데이터 API — 최대 1,000문항까지 페이지 단위로 수집 */
export async function fetchKoroadQuestions(options?: {
  page?: number;
  perPage?: number;
  maxItems?: number;
}): Promise<KoroadFetchResult> {
  const maxItems = options?.maxItems ?? LEARNING_TOTAL_QUESTIONS;

  if (!DATA_GO_KR_SERVICE_KEY) {
    const questions = getFallbackQuestions();
    return {
      questions,
      source: 'fallback',
      totalCount: questions.length,
      error:
        'API 키가 없어 샘플만 표시합니다. .env에 EXPO_PUBLIC_DATA_GO_KR_SERVICE_KEY를 넣으면 1,000문항을 불러옵니다. CSV는 추후 assets에 넣을 예정입니다.',
    };
  }

  if (options?.page) {
    try {
      const { questions, totalCount } = await fetchKoroadPage(options.page, options.perPage ?? PAGE_SIZE);
      return { questions, source: 'api', totalCount };
    } catch (e) {
      const questions = getFallbackQuestions();
      const message = e instanceof Error ? e.message : 'API 연결 실패';
      return {
        questions,
        source: 'fallback',
        totalCount: questions.length,
        error: `${message} — 샘플 문제로 대체합니다.`,
      };
    }
  }

  try {
    const collected: AppQuestion[] = [];
    let totalCount = 0;
    let page = 1;

    while (collected.length < maxItems && page <= 10) {
      const batch = await fetchKoroadPage(page, PAGE_SIZE);
      totalCount = batch.totalCount;
      collected.push(...batch.questions);
      if (batch.questions.length < PAGE_SIZE) break;
      if (collected.length >= totalCount) break;
      page += 1;
    }

    const questions = dedupeByQuestionNumber(collected).slice(0, maxItems);
    if (questions.length === 0) {
      throw new Error('API에서 문제를 찾지 못했습니다.');
    }

    return {
      questions,
      source: 'api',
      totalCount: totalCount || questions.length,
    };
  } catch (e) {
    const questions = getFallbackQuestions();
    const message = e instanceof Error ? e.message : 'API 연결 실패';
    return {
      questions,
      source: 'fallback',
      totalCount: questions.length,
      error: `${message} — 샘플 문제로 대체합니다.`,
    };
  }
}

export function shuffleQuestions<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickSessionQuestions(
  all: AppQuestion[],
  count: number,
  excludeIds: string[] = [],
): AppQuestion[] {
  const exclude = new Set(excludeIds);
  const unseen = all.filter((q) => !exclude.has(q.id));
  const pool = unseen.length > 0 ? unseen : all;
  return shuffleQuestions(pool).slice(0, Math.min(count, pool.length));
}
