# Deployment Guide: Artha

This guide outlines the steps to deploy the Artha platform to a production-grade environment.

## 🧩 Infrastructure Overview

Artha is designed to be horizontally scalable. Each component can be containerized and deployed independently.

### Component Port Mapping
- **Terminal**: 3000
- **Data Pipelines**: 8000
- **Data Service**: 8001

## 🐳 Containerization

Detailed Dockerfiles are provided for each service:
- **Terminal**: [apps/terminal/Dockerfile](file:///media/sandeep-jaiswar/DataDrive2/artha/apps/terminal/Dockerfile) (Multi-stage Node.js)
- **Data Pipelines**: [apps/data-pipelines/Dockerfile](file:///media/sandeep-jaiswar/DataDrive2/artha/apps/data-pipelines/Dockerfile) (Python with `uv`)
- **Data Service**: [apps/data-service/Dockerfile](file:///media/sandeep-jaiswar/DataDrive2/artha/apps/data-service/Dockerfile) (Multi-stage Rust)

### Local Development with Docker Compose
Run the entire stack locally with:
```bash
docker compose up --build
```

## ☸️ Orchestration (Kubernetes)

Kubernetes manifests are located in the [k8s/](file:///media/sandeep-jaiswar/DataDrive2/artha/k8s/) directory.

### Deployment Steps
1. **Apply Base Config**: `kubectl apply -f k8s/base.yaml`
2. **Deploy Postgres**: `kubectl apply -f k8s/postgres.yaml` (For non-managed databases)
3. **Deploy Services**: `kubectl apply -f k8s/data-service.yaml -f k8s/data-pipelines.yaml -f k8s/terminal.yaml`

### CI/CD Integration
The Dockerfiles are optimized for CI/CD pipelines, using multi-stage builds to keep production images minimal.

### 1. Database Migration
Ensure the `equity_bhavcopy` table exist. The Python pipeline handles table creation automatically on the first `ingest` run, but for production, use a migration tool like `alembic` (Python) or `sqlx-cli` (Rust).

### 2. Service Orchestration
Use Kubernetes (K8s) or Docker Compose for local production-like environments.

```yaml
# docker-compose.prod.yml example
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: artha
  
  data-service:
    build: ./apps/data-service
    depends_on: [db]
    
  data-pipelines:
    build: ./apps/data-pipelines
    depends_on: [db]
    
  terminal:
    build: ./apps/terminal
    depends_on: [data-service]
```

### 3. CI/CD Pipeline
- **Lint & Test**: Run `cargo test`, `pytest`, and `npm test` on every PR.
- **Build & Push**: Build Docker images and push to a registry (ECR, GCR).
- **Deploy**: Trigger a rolling update to your cluster.

## 🛡 Security Best Practices
- **CORS**: Restricted allowed origins in `data-service` and `data-pipelines`.
- **RBAC**: Use Read-Only database users for the `data-service`.
- **TLS**: Terminate SSL at an Ingress Controller (Nginx, Traefik).
