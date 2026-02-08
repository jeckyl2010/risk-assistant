# Python backend for riskctl evaluation engine
FROM python:3.12-slim

WORKDIR /app

# Install uv for faster dependency installation
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy requirements files
COPY requirements.txt requirements-dev.txt ./

# Install dependencies using uv
RUN uv pip install --system --no-cache -r requirements.txt -r requirements-dev.txt

# Copy model, tools, and systems directories
COPY model/ ./model/
COPY tools/ ./tools/
COPY systems/ ./systems/

# Expose port for FastAPI (if running as server)
EXPOSE 8000

# Default command (can be overridden in compose)
CMD ["python", "tools/riskctl.py"]
