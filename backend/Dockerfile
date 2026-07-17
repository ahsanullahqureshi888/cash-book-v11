# Use an official, lightweight Python image
FROM python:3.11-slim

# Set environment variables
# PYTHONUNBUFFERED=1 sends stdout/stderr straight to logs without buffering
# PYTHONDONTWRITEBYTECODE=1 prevents python from writing .pyc files
# PYTHONPATH=/app ensures app imports can resolve correctly
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

# Set working directory in container
WORKDIR /app

# Install system build dependencies required for compiling libraries like bcrypt
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first to utilize Docker build cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files
COPY . .

# Expose port 8000 for FastAPI
EXPOSE 8000

# Run the app with Uvicorn ASGI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
