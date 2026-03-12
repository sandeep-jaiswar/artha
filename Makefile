.PHONY: dev ingest install

# Install everything at once
install:
	pnpm install
	cd apps/data-pipelines && uv sync
	cd apps/data-service && cargo build

# Start Terminal, Data Service and Data Pipeline simultaneously
dev:
	npx -y turbo run dev

# Run the Python ingestion script manually
ingest:
	cd apps/data-pipelines && uv run python src/main.py --ingest