/**
 * Vercel 서버리스 — 브라우저 CORS 우회용 도로교통공단 문제 API 프록시
 * Vercel 대시보드 → Environment Variables:
 *   DATA_GO_KR_SERVICE_KEY = (공공데이터포털 인증키)
 */
const DATASET_ID = '15100163';
const UDDI = '602623e8-9263-48f1-b53c-ad7cd88ff6f5';
const API_BASE = `https://api.odcloud.kr/api/${DATASET_ID}/v1/uddi:${UDDI}`;

function corsOrigin(req) {
  const origin = req.headers.origin || req.headers.Origin || '';
  if (!origin) return '*';
  if (
    origin.includes('vercel.app') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin.includes('apps.tossmini.com') ||
    origin.includes('toss.im')
  ) {
    return origin;
  }
  return '*';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', corsOrigin(req));
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ msg: 'Method not allowed' });
    return;
  }

  const key =
    process.env.DATA_GO_KR_SERVICE_KEY || process.env.EXPO_PUBLIC_DATA_GO_KR_SERVICE_KEY;

  if (!key) {
    res.status(500).json({
      code: -401,
      msg: 'Vercel에 DATA_GO_KR_SERVICE_KEY 환경 변수를 설정한 뒤 Redeploy 해주세요.',
    });
    return;
  }

  const page = req.query.page || '1';
  const perPage = req.query.perPage || '200';

  const url =
    `${API_BASE}?page=${page}&perPage=${perPage}` +
    `&serviceKey=${encodeURIComponent(key)}`;

  try {
    const upstream = await fetch(url);
    const json = await upstream.json();
    res.status(upstream.ok ? 200 : upstream.status).json(json);
  } catch (e) {
    res.status(502).json({
      code: -1,
      msg: e instanceof Error ? e.message : 'Upstream fetch failed',
    });
  }
}
