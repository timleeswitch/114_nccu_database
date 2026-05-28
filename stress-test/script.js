import http from 'k6/http';
import { check, sleep } from 'k6';
// 自動引入 HTML 報告生成器
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// 1. 設定壓測階段 (模擬用戶逐步增加)
export const options = {
    stages: [
        { duration: '15s', target: 10 },  // 15秒內，虛擬用戶 (VU) 從 0 爬升到 10
        { duration: '30s', target: 50 },  // 30秒內，VU 從 10 激增到 50 (全力轟炸資料庫)
        { duration: '15s', target: 0 },   // 15秒內，用戶退場，讓系統恢復
    ],
    thresholds: {
        http_req_failed: ['rate<0.02'],   // 錯誤率必須小於 2% (如果 DB 連線池爆了，這裡會亮紅燈)
        http_req_duration: ['p(95)<1000'], // 95% 的請求必須在 1000ms (1秒) 内完成
    },
};

// 後端 API 的基礎網址
// 如果是在 Windows 本地直接跑 k6，用 localhost:8000
// 如果是在 Docker Compose 內部跑，改為 http://web-app:8000
const BASE_URL = 'http://localhost:8000'; 

export default function () {
    // 測試情境 A：讀取資料 (觸發 SQLAlchemy 的 SELECT)
    let readRes = http.get(`${BASE_URL}/api/items`);
    check(readRes, {
        'GET status is 200': (r) => r.status === 200,
    });
    sleep(0.5); // 模擬用戶停頓 0.5 秒

    // 測試情境 B：寫入資料 (觸發 SQLAlchemy 的 INSERT，這最考驗 DB 鎖定與連線池)
    let payload = JSON.stringify({
        title: `K6_Test_Item_${__VU}_${__ITER}`, // 確保名稱不重複
        description: '這是由 K6 自動生成的效能測試資料',
    });

    let params = {
        headers: { 'Content-Type': 'application/json' },
    };

    let writeRes = http.post(`${BASE_URL}/api/items`, payload, params);
    check(writeRes, {
        'POST status is 201 or 200': (r) => r.status === 201 || r.status === 200,
    });

    sleep(1); // 停頓 1 秒後進入下一次循環
}

// 2. 壓測結束後自動生成 summary.html 報告
export function handleSummary(data) {
    return {
        "summary.html": htmlReport(data),
    };
}