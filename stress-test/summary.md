# k6 Performance Test Report

- Target: http://localhost:8000
- Endpoints: /, /db-test
- Max VUs: 2
- Total requests: 16
- Throughput: 2.63 req/s
- Average latency: 5.45 ms
- p95 latency: 7.99 ms
- p99 latency: 8.47 ms
- Failed requests: 0.00%
- Check pass rate: 100.00%

## Thresholds

- `http_req_failed`: rate < 2%
- `http_req_duration`: p95 < 1000 ms

## Run Command

```powershell
k6 run stress-test/script.js
# or customize target/endpoints:
$env:BASE_URL="http://localhost:8000"; $env:ENDPOINTS="/,/db-test"; k6 run stress-test/script.js
```
