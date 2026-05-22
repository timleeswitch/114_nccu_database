# 1. 使用官方 Python 輕量版映像檔
FROM python:3.11-slim

# 2. 設定容器內的工作目錄
WORKDIR /app

# 3. 先複製 requirements.txt 並安裝
COPY requirements.txt .

# 升級 pip 並強迫安裝所有必備套件，這次徹底補上 sqlalchemy！
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 4. 複製所有專案程式碼到容器內
COPY . .

# 5. 開放 Port
EXPOSE 8000

# 6. 安全啟動指令：改用 python -m uvicorn，完美避開 PATH 找不到指令的問題！
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]