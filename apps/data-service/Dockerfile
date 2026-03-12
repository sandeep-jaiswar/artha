# apps/data-service/Dockerfile
FROM rust:1.80-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

# Copy manifest and dummy source to cache dependencies
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm -f target/release/deps/data_service*

# Copy real source code
COPY src/ ./src/

# Set SQLX_OFFLINE=true if using prepared queries, otherwise ensure DB is reachable
# ENV SQLX_OFFLINE=true

RUN cargo build --release

# Runner stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/data-service /app/data-service

EXPOSE 8001

CMD ["./data-service"]
