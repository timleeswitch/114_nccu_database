import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const ENDPOINTS = (__ENV.ENDPOINTS || '/,/db-test')
  .split(',')
  .map((endpoint) => endpoint.trim())
  .filter(Boolean);

export const options = {
  stages: [
    { duration: '15s', target: 10 },
    { duration: '30s', target: 50 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<1000'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
};

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedBase = BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function metricValue(data, metricName, valueName) {
  return data.metrics[metricName]?.values?.[valueName] ?? 0;
}

function toMs(value) {
  return `${value.toFixed(2)} ms`;
}

function toRate(value) {
  return `${value.toFixed(2)} req/s`;
}

function toPercent(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function buildMarkdownReport(data) {
  const avgLatency = metricValue(data, 'http_req_duration', 'avg');
  const p95Latency = metricValue(data, 'http_req_duration', 'p(95)');
  const p99Latency = metricValue(data, 'http_req_duration', 'p(99)');
  const throughput = metricValue(data, 'http_reqs', 'rate');
  const requestCount = metricValue(data, 'http_reqs', 'count');
  const failureRate = metricValue(data, 'http_req_failed', 'rate');
  const checkRate = metricValue(data, 'checks', 'rate');
  const vusMax = metricValue(data, 'vus_max', 'max');

  return [
    '# k6 Performance Test Report',
    '',
    `- Target: ${BASE_URL}`,
    `- Endpoints: ${ENDPOINTS.join(', ')}`,
    `- Max VUs: ${vusMax}`,
    `- Total requests: ${requestCount}`,
    `- Throughput: ${toRate(throughput)}`,
    `- Average latency: ${toMs(avgLatency)}`,
    `- p95 latency: ${toMs(p95Latency)}`,
    `- p99 latency: ${toMs(p99Latency)}`,
    `- Failed requests: ${toPercent(failureRate)}`,
    `- Check pass rate: ${toPercent(checkRate)}`,
    '',
    '## Thresholds',
    '',
    '- `http_req_failed`: rate < 2%',
    '- `http_req_duration`: p95 < 1000 ms',
    '',
    '## Run Command',
    '',
    '```powershell',
    'k6 run stress-test/script.js',
    '# or customize target/endpoints:',
    '$env:BASE_URL="http://localhost:8000"; $env:ENDPOINTS="/,/db-test"; k6 run stress-test/script.js',
    '```',
    '',
  ].join('\n');
}

export default function () {
  for (const endpoint of ENDPOINTS) {
    const response = http.get(buildUrl(endpoint), {
      tags: { endpoint },
      timeout: '30s',
    });

    check(response, {
      [`GET ${endpoint} returns 2xx/3xx`]: (res) => res.status >= 200 && res.status < 400,
      [`GET ${endpoint} responds within 1s`]: (res) => res.timings.duration < 1000,
    });

    sleep(0.5);
  }
}

export function handleSummary(data) {
  const avgLatency = metricValue(data, 'http_req_duration', 'avg');
  const p95Latency = metricValue(data, 'http_req_duration', 'p(95)');
  const throughput = metricValue(data, 'http_reqs', 'rate');
  const failureRate = metricValue(data, 'http_req_failed', 'rate');

  const headline = [
    '',
    'Performance headline',
    `- Average latency: ${toMs(avgLatency)}`,
    `- p95 latency: ${toMs(p95Latency)}`,
    `- Throughput: ${toRate(throughput)}`,
    `- Failed requests: ${toPercent(failureRate)}`,
    '',
  ].join('\n');

  return {
    stdout: `${textSummary(data, { indent: ' ', enableColors: true })}\n${headline}`,
    'summary.html': htmlReport(data),
    'summary.json': JSON.stringify(data, null, 2),
    'summary.md': buildMarkdownReport(data),
  };
}
