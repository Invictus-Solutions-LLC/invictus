# Makefile for the invictus portfolio site.
# Run `make` (or `make help`) to list available targets.

SHELL := /bin/bash
YARN := yarn
DC := docker compose
COMPOSE_DEV := docker-compose.dev.yml
COMPOSE_PROD := docker-compose.prod.yml

.DEFAULT_GOAL := help

.PHONY: help install content dev build start lint typecheck test test-ci audit verify \
        docker-dev-up docker-dev-down docker-build \
        prod-up prod-down prod-pull prod-restart prod-logs clean clean-all

help: ## Show this help
	@echo "invictus — available make targets:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

# ---- local development ----

install: ## Install dependencies (immutable, matches CI)
	corepack enable
	$(YARN) install --immutable

content: ## Seed content/*.json from the *.example.json templates (never overwrites existing files)
	@for f in content/*.example.json; do \
		target="$$(echo "$$f" | sed 's/\.example//')"; \
		if [ -f "$$target" ]; then \
			echo "skip   $$target (already exists)"; \
		else \
			cp "$$f" "$$target"; echo "create $$target"; \
		fi; \
	done

dev: ## Run the Next.js dev server (hot reload)
	$(YARN) dev

build: ## Production build
	$(YARN) build

start: ## Start the production server (run `make build` first)
	$(YARN) start

# ---- quality gates ----

lint: ## Run ESLint
	$(YARN) lint

typecheck: ## Run the TypeScript type checker
	$(YARN) typecheck

test: ## Run the test suite (watch-free)
	$(YARN) test

test-ci: ## Run tests with coverage (matches CI)
	$(YARN) test:ci

audit: ## Fail on high/critical dependency advisories (matches CI)
	$(YARN) npm audit --recursive --severity high

verify: lint typecheck test-ci build ## Full local quality gate: lint + typecheck + tests + build
	@echo "✓ verify passed"

# ---- docker: local ----

docker-dev-up: ## Build & run the dev stack in Docker (docker-compose.dev.yml)
	$(DC) -f $(COMPOSE_DEV) up --build

docker-dev-down: ## Stop & remove the dev stack
	$(DC) -f $(COMPOSE_DEV) down

docker-build: ## Build the production image locally (yarn install is memory-hungry — give Docker ~2GB+ RAM)
	docker build --target production -t ghcr.io/invictus808/invictus:latest .

# ---- docker: production (run on the server; needs a .env — see DEPLOY.md) ----

prod-up: ## Start the production stack detached (docker-compose.prod.yml)
	$(DC) -f $(COMPOSE_PROD) up -d

prod-down: ## Stop & remove the production stack
	$(DC) -f $(COMPOSE_PROD) down

prod-pull: ## Pull the latest published image from GHCR
	$(DC) -f $(COMPOSE_PROD) pull

prod-restart: ## Restart just the app (picks up edited content/ without a new image)
	$(DC) -f $(COMPOSE_PROD) restart invictus

prod-logs: ## Tail the production logs
	$(DC) -f $(COMPOSE_PROD) logs -f

# ---- cleanup ----

clean: ## Remove build artifacts (.next, coverage, *.tsbuildinfo)
	rm -rf .next coverage *.tsbuildinfo

clean-all: clean ## Also remove node_modules and the yarn cache
	rm -rf node_modules .yarn/cache
