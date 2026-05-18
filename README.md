# NCCU_Databaase
## 111學年度資訊科學系學士班 - 畢業門檻審查系統

本專案為資料庫系統期末專案。系統旨在協助 111 入學之資科系學士班學生（不含延畢生），透過視覺化網頁介面，自主管理與檢核其修課紀錄是否達成 128 學分之畢業門檻。

## 🚀 核心功能
- **學生登入與管理**：支援學生登入，並可檢視、人工編輯（新增/刪除）個人修課紀錄。
- **學期分類管理**：自動依據不同學期分類顯示修課歷史。
- **畢業門檻智慧檢核**：系統根據系所規則，自動比對 128 學分結構，分類顯示「已完成/未完成」清單，並精確計算缺少的必修課名與學分數。

---

## 🛠️ 技術選型
- **前端 (Frontend)**：React (輕量化設計，專注於登入、課程清單與檢核結果三大頁面)
- **後端 (Backend)**：Python 3.10+ / FastAPI (高併發效能、自動生成 Swagger UI 交互式文件)
- **資料庫 (Database)**：MySQL 8.0 (關聯式資料庫)
- **物件關係映射 (ORM)**：SQLAlchemy (配合 Alembic 進行資料庫遷移變更管理)
- **容器化 (Containerization)**：Docker / Docker Compose
- **效能測試 (Load Testing)**：k6

---

## 📐 資料庫架構 (ER Diagram)

本系統嚴格遵循關係型資料庫規範，設計以下實體與關係：
- `Student` (學生資訊)
- `Course` (課程清單)
- `Enrollment` (修課紀錄，作為學生與課程的多對多 $M:N$ 中介表)
- `GraduationRule` (系所畢業學分規則)

### 實體關係圖概要
- `Student` (1) ─── (N) `Enrollment`
- `Course` (1) ─── (N) `Enrollment`
- `GraduationRule` 表獨立存放各學系與課程類別（如必修、通識）所需的學分數，供純 Python 計算引擎調用。

---

<!-- ## 🐳 快速啟動 (Docker Compose)

本專案已完全容器化。請確保您的環境已安裝 Docker 與 Docker Compose，並於根目錄建立 `.env` 檔案配置環境變數（切勿將密碼寫死於程式碼中）。

### 1. 設定環境變數 (`.env`)
```env
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_DATABASE=grad_check_db
MYSQL_USER=user
MYSQL_PASSWORD=user_password
DATABASE_URL=mysql+mysqldb://user:user_password@db:3306/grad_check_db -->