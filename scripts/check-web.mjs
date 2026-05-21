import { chromium } from 'playwright';

const url = process.argv[2] || 'https://drive-quest-two.vercel.app/';
const logs = [];
const errors = [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on('pageerror', (err) => errors.push(`PAGE: ${err.message}`));
page.on('requestfailed', (req) =>
  errors.push(`REQ: ${req.url()} ${req.failure()?.errorText ?? ''}`),
);

await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(8000);

const rootText = await page.locator('#root').innerText().catch(() => '');
const rootHtml = await page.locator('#root').innerHTML().catch(() => '');
const title = await page.title();

console.log('URL:', url);
console.log('Title:', title);
console.log('Root text length:', rootText.length);
console.log('Root text preview:', rootText.slice(0, 200));
console.log('Root HTML length:', rootHtml.length);
console.log('\n--- Console ---');
logs.slice(0, 30).forEach((l) => console.log(l));
console.log('\n--- Errors ---');
errors.forEach((e) => console.log(e));

await browser.close();
