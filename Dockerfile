FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt* pyproject.toml* uv.lock* ./
RUN pip install --no-cache-dir fastapi uvicorn openai 2>/dev/null || true

COPY . .

RUN pip install --no-cache-dir -e . 2>/dev/null || true

EXPOSE 7860

CMD ["uvicorn", "server.app:app", "--host", "0.0.0.0", "--port", "7860"]
