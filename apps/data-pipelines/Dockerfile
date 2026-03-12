# apps/data-pipelines/Dockerfile
FROM ghcr.io/astral-sh/uv:python3.13-alpine

WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy project files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-dev

# Copy the rest of the application
COPY src/ ./src/

# Expose the port
EXPOSE 8000

# Run the application
CMD ["uv", "run", "python", "src/main.py"]
