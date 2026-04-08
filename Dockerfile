FROM python:3.10
WORKDIR /app
COPY . .

ENV API_BASE_URL="https://router.huggingface.co/v1"
ENV MODEL_NAME="Qwen/Qwen2.5-72B-Instruct"

RUN pip install --no-cache-dir -r requirements.txt
CMD ["uvicorn", "server.app:app", "--host", "0.0.0.0", "--port", "7860"]
