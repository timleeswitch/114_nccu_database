# Runnable

本文件統一說明這個 repo 裡哪些 Python 檔案**可以直接執行 / 提供測試**，以及該怎麼呼叫它們。
所有指令都假設**工作目錄為專案根目錄** `114_nccu_database`。

---

## Prereq（第一次跑請依序執行）

1. 啟動 MySQL container：`docker compose up -d db`（用 `docker ps` 確認 `nccu_mysql_db` 在 running）
2. 套用 schema migration：`python -m alembic upgrade head`
3. Seed 資料（跑 `check_grad` 前必要）：`python -m scripts.seed`

---

## Category 1: CLI scripts（直接執行）

### `scripts/seed.py`
把課程、畢業規則、demo 學生塞進 DB。可重跑（idempotent）。

| 指令 | 動作 |
|------|------|
| `python -m scripts.seed` | 全部 seed |
| `python -m scripts.seed --only courses` | 只塞 9148 筆課程 |
| `python -m scripts.seed --only rules` | 只塞 14 條畢業規則 |
| `python -m scripts.seed --only demo` | 只塞 2 個 demo 學生 + 修課記錄 |

### `scripts/check_grad.py`
對一個或多個學生跑畢業檢核，可輸出文字或 JSON。

| 指令 | 動作 |
|------|------|
| `python -m scripts.check_grad 1` | 單一學生（文字摘要） |
| `python -m scripts.check_grad 1 2 3` | 多個學生 |
| `python -m scripts.check_grad --all` | 全部學生 |
| `python -m scripts.check_grad 1 --json` | 單一學生（JSON） |
| `python -m scripts.check_grad --all --json` | 全部學生 + JSON |

### `scripts/dump_erd.py`
從目前的 SQLAlchemy models 重新產生 ER 圖。

| 指令 | 動作 |
|------|------|
| `python -m scripts.dump_erd` | 輸出 `data/docs/erd.md`（Mermaid 格式） |

### `tests/test_graduation_check.py`
跑全部 `graduation_check.py` 的單元測試。不需要 Docker / MySQL / seed 資料——測試使用 SQLite in-memory，每個 case 自建獨立 DB。

| 指令 | 動作 |
|------|------|
| `python -m pytest tests/` | 跑全部 18 個 test |
| `python -m pytest tests/ -v` | 加上每個 test 的名稱 |
| `python -m pytest tests/test_graduation_check.py::test_happy_path_passes -v` | 只跑指定 test |
| `python -m pytest tests/ -k cross_domain` | 只跑名稱含 `cross_domain` 的 test |

修改 `app/services/graduation_check.py` 後應該跑一次確認沒 regression。

---

## Demo 測試資料

`seed_demo_students()` 會建立 2 個學生 + 對應的修課記錄，分別示範「達標」與「不達標」兩種情境，可直接餵給 `scripts/check_grad.py` 測試畢業檢核邏輯。

### Student 1 — 王達標（通過畢業檢核）

- `student_id = 1`
- `name = "王達標"`
- `hashed_password = "$demo$"`（預留符 demo，非真實 hash）
- 修課總數：55 門
- 設計目標：滿足所有畢業規則

修課配置明細：

| 類別 | 子類別 | 修課數 | 預期累計學分 |
|------|--------|--------|------------|
| 必修 | — | 17 門（13 門有學分 + 4 門零學分實驗） | 39 |
| 群修 | A | 2 | 6 |
| 群修 | B | 1 | 3 |
| 群修 | C | 1 | 3 |
| 選修 | — | 17 門（每門 3 學分，排除「全民國防」、「軍事訓練」） | 51 |
| 一般通識 | 中文通識 | 1 | 3 |
| 一般通識 | 外文通識 | 2 | 6 |
| 一般通識 | 人文通識 | 1 | 3 |
| 一般通識 | 社會通識 | 1 | 3 |
| 一般通識 | 自然通識 | 1 | 3 |
| 核心通識 | 人文通識 | 1 | 3 |
| 核心通識 | 社會通識 | 1 | 3 |
| 體育 | 必修 | 8 門（每門 1 學分，總計 ≥ 4） | 8 |
| 檢定 | — | 1 門 | 0（不計學分） |

跑 `python -m scripts.check_grad 1` 預期看到：

```
Credits: 134.0 / 128  [OK]
Verdict: GRADUATE
```

（累計 ~134 學分，已套用通識總額 cap 28 及其他規則）

### Student 2 — 李未達（未通過畢業檢核）

- `student_id = 2`
- `name = "李未達"`
- `hashed_password = "$demo$"`
- 修課總數：13 門
- 設計目標：故意設計成多處不達標

修課配置明細：

| 類別 | 子類別 | 修課數 | 缺幾學分 / 狀況 |
|------|--------|--------|----------------|
| 必修 | — | 5 門 | 短 24 學分 |
| 群修 | A | 1 | 短 3 學分 |
| 群修 | B | 0 | 完全未修 |
| 群修 | C | 0 | 完全未修 |
| 選修 | — | 5 門 | 短 30 學分 |
| 一般通識 | 中文通識 | 1 | 達標 |
| 一般通識 | 其他子類 | 0 | 全部短缺 |
| 核心通識 | — | 0 | 不滿足「≥ 2 個不同領域」要求 |
| 體育 | 必修 | 1 門 | 短約 3 學分 |
| 檢定 | — | 0 | 未通過 |

跑 `python -m scripts.check_grad 2` 預期看到：

```
Credits: 37.0 / 128  [SHORT]
Verdict: NOT YET
```

（累計 ~37 學分，遠低於 128 學分要求）

### 資料 Schema 對照

Student 與 Enrollment 兩張表的主要欄位：

| 表 | 欄位 |
|----|------|
| `student` | `student_id` (PK), `name`, `hashed_password` |
| `enrollment` | `enrollment_id` (PK), `student_id` (FK→student), `course_id` (FK→course), `semester` |

完整 schema 與 ER 圖見 [`data/docs/erd.md`](./erd.md)。

### 重新產生 Demo 資料

每次跑 `python -m scripts.seed --only demo` 都會先把 `student_id IN (1, 2)` 的 enrollment 與 student 整批刪除再重建，所以隨時可以重跑，不會累積髒資料。

如果想自己 seed 額外的學生，**不要用 `student_id` 1 或 2**（會被下次 demo seed 覆蓋）。

---

## Category 2: Library modules（從 Python 程式碼呼叫）

### `app/services/graduation_check.py`
畢業檢核核心引擎，對外只暴露一個函式：

```python
from app.services.graduation_check import check_graduation

report = check_graduation(student_id=1)              # 自己開 session
report = check_graduation(student_id=1, session=db)  # 用既有 session

report.to_dict()   # dict 結構，給 API 序列化用
report.summary()   # 多行文字摘要，給 CLI / log 用
```

回傳的 `GraduationReport` 是 dataclass，主要欄位：`student_id`、`total_required`、`total_earned`、`passed`、`rules`（每條 rule 的結果）、`notes`（跨領域分配、超修等說明）。

---

## Category 3: Infrastructure（不要直接執行）

這些檔案是「被其他工具呼叫」的，不會也不應該直接 `python xxx.py`。列出來僅供各位知道它們存在以及誰會用到。

| 檔案 | 用途 | 由誰呼叫 |
|------|------|---------|
| `app/database.py` | SQLAlchemy engine + session factory + `Base` | 所有 model、service 都 import 它 |
| `app/models/student.py` | `Student` ORM model | services、Alembic |
| `app/models/course.py` | `Course` ORM model + `CourseCategory` enum | services、Alembic |
| `app/models/enrollment.py` | `Enrollment` ORM model | services、Alembic |
| `app/models/graduation_rule.py` | `GraduationRule` ORM model | services、Alembic |
| `app/models/__init__.py` | 統一 re-export，讓 Alembic autogenerate 看得到所有 model | Alembic |
| `alembic/env.py` | Alembic 啟動腳本 | 由 `alembic` CLI 自動呼叫 |
| `alembic/versions/*.py` | 各版本 migration 腳本 | 由 `alembic upgrade` / `downgrade` 呼叫 |
| `tests/__init__.py` | 標記 `tests/` 為 package | pytest 自動掃描 |
| `tests/conftest.py` | pytest fixtures（in-memory SQLite engine、session、`make_course/make_student/enroll` factory） | pytest 自動載入 |

### Alembic CLI（你可能會用到的指令）

| 指令 | 動作 |
|------|------|
| `python -m alembic current` | 顯示目前 DB 在哪個 revision |
| `python -m alembic upgrade head` | 套用所有未執行的 migration |
| `python -m alembic history` | 列出所有 revision |
| `python -m alembic revision --autogenerate -m "<msg>"` | 改 model 後產生新的 migration |

---

## 驗證錨點（Verification anchors）

跑指令後出現以下關鍵字代表成功：

| 指令 | 預期看到的關鍵字 |
|------|------------------|
| `python -m alembic current` | `2748242b2a0c (head)` |
| `python -m scripts.seed`（全跑） | `[courses] upserted 9148 rows` / `[rules] upserted 14 rows` / `[demo] {...}` |
| `python -m scripts.check_grad 1` | `Credits: 134.0 / 128  [OK]` + `Verdict: GRADUATE` |
| `python -m scripts.check_grad 2` | `Credits: 37.0 / 128  [SHORT]` + `Verdict: NOT YET` |
| `python -m scripts.dump_erd` | `wrote data\docs\erd.md` |
| `python -m pytest tests/` | `18 passed` |

---

## Troubleshooting

- **`Can't connect to MySQL server on '127.0.0.1'`** → MySQL container 沒在跑，執行 `docker compose up -d db`
- **`ModuleNotFoundError: No module named 'app'`** → 不在專案根目錄，先 `cd` 到 `114_nccu_database/` 再跑
- **`check_grad` 回 "No students found"** → 忘了跑 `python -m scripts.seed --only demo`
- **`alembic` 指令找不到** → 可能並非在 virtual environment 當中
- **pytest 找不到 test** → 沒在專案根目錄，先 `cd` 到 `114_nccu_database/` 再跑（pytest 預設從當前目錄向下搜尋）
