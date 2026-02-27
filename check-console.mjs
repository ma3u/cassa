import { chromium } from 'playwright';

const browser = await chromium.launch({
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
    '--enable-webgl2',
    '--no-sandbox',
    '--ignore-gpu-blocklist',
    '--enable-features=Vulkan',
  ]
});
const page = await browser.newPage();
const errors = [];
const warnings = [];
const logs = [];
const networkErrors = [];

page.on('console', msg => {
  const type = msg.type();
  const text = msg.text();
  if (type === 'error') errors.push(text);
  else if (type === 'warning') warnings.push(text);
  else logs.push(text.substring(0, 300));
});

page.on('pageerror', err => {
  errors.push('PAGE ERROR: ' + err.message);
});

page.on('response', resp => {
  if (resp.status() >= 400) {
    networkErrors.push(resp.status() + ' ' + resp.url());
  }
});

try {
  await page.goto('http://localhost:5001/', { waitUntil: 'networkidle', timeout: 30000 });
} catch (e) {
  console.log('Navigation issue:', e.message);
}

// Wait for graph to fully initialize
await page.waitForTimeout(6000);

// Also check for failed network requests
const failedRequests = [];
page.on('requestfailed', req => {
  failedRequests.push(req.url() + ' - ' + (req.failure()?.errorText || 'unknown'));
});

console.log('=== ERRORS (' + errors.length + ') ===');
errors.forEach((e, i) => console.log((i + 1) + '. ' + e));
console.log('');
console.log('=== WARNINGS (' + warnings.length + ') ===');
warnings.forEach((w, i) => console.log((i + 1) + '. ' + w));
console.log('');
console.log('=== INFO LOGS (first 30) ===');
logs.slice(0, 30).forEach((l, i) => console.log((i + 1) + '. ' + l));

if (failedRequests.length) {
  console.log('');
  console.log('=== FAILED REQUESTS ===');
  failedRequests.forEach((r, i) => console.log((i + 1) + '. ' + r));
}

if (networkErrors.length) {
  console.log('');
  console.log('=== HTTP ERRORS (status >= 400) ===');
  networkErrors.forEach((r, i) => console.log((i + 1) + '. ' + r));
}

await browser.close();
