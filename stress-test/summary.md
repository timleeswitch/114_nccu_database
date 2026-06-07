# k6 Performance Test Report

- Target: http://localhost:8000
- Endpoints: /, /db-test
- Max VUs: 50
- Total requests: 2702
- Throughput: 44.44 req/s
- Average latency: 5.35 ms
- p95 latency: 9.18 ms
- p99 latency: 11.86 ms
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
