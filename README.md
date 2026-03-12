# Artha

Artha is a high-performance financial data platform designed for real-time market data ingestion and visualization. It leverages a modern, distributed architecture to provide low-latency access to Indian market data.

## 🏗 Architecture

The platform consists of three core components:

- **Terminal (Next.js)**: A premium dashboard for visualizing market trends.
- **Data Pipelines (Python)**: An ingestion engine powered by `financeindia` and FastAPI.
- **Data Service (Rust)**: A high-performance API service built with Axum and SQLx for ultra-fast data retrieval.
- **Database (Postgres)**: A shared storage layer for consistent market data.

## 🚀 Quick Start

### 1. Prerequisites
- **Postgres**: A running instance (default: `localhost:5432`).
- **Dependencies**: `pnpm`, `python` (with `uv`), and `rust`.

### 2. Configuration
Copy `.env.example` (or use the existing `.env`) and configure your database credentials:
```env
dbusername=postgres
dbpassword=postgres
dbhost=localhost
dbport=5432
dbname=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
TERMINAL_PORT=3000
PIPELINE_PORT=8000
SERVICE_PORT=8001
```

### 3. Setup
```bash
make install
```

### 4. Ingest Initial Data
```bash
make ingest
```

### 5. Start Development Environment
```bash
make dev
```
- **Terminal**: http://localhost:3000
- **Data Pipelines (API)**: http://localhost:8000/docs
- **Data Service (API)**: http://localhost:8001/api/market-data

### 6. Run with Docker Compose
```bash
docker compose up --build
```

### 7. Deploy to Kubernetes
```bash
kubectl apply -f k8s/
```

## 🛠 Tech Stack
- **Frontend**: Next.js 15, Tailwind CSS 4, React 19.
- **Python Backend**: FastAPI, Polars, FinanceIndia.
- **Rust Backend**: Axum, SQLx, Tokio.
- **Monorepo**: Turborepo, PNPM Workspaces.

## 📄 Documentation
- [Deployment Guide](DEPLOYMENT.md)
- [Implementation Plan](.gemini/antigravity/brain/8d60bc05-e6dd-42f8-890b-fa4030e779f1/implementation_plan.md)
