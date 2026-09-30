FROM python:3.11-slim
WORKDIR /app
COPY server/requirements.txt server/requirements.txt
RUN pip install --no-cache-dir -r server/requirements.txt
COPY server server
COPY docs/mentor-systemprompt.md docs/mentor-systemprompt.md
RUN mkdir -p server/data
ENV MENTOR_DB=/app/server/data/mentor.sqlite
EXPOSE 8787
CMD ["uvicorn", "server.mentor_server:app", "--host", "0.0.0.0", "--port", "8787"]
