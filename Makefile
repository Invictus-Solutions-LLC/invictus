# Makefile — the single entry point for the invictus portfolio site.
# Run `make` (or `make help`) to list every target, grouped by lifecycle stage.

SHELL := /bin/bash
YARN := yarn
DC := docker compose
COMPOSE_DEV := docker-compose.dev.yml
COMPOSE_PROD := docker-compose.prod.yml
BUNDLED := --profile bundled
IMAGE := ghcr.io/invictus-solutions-llc/invictus:latest

.DEFAULT_GOAL := help

.PHONY: help setup install content env \
        dev dev-docker dev-docker-down \
        verify lint typecheck test test-ci audit \
        build image \
        deploy app-up app-down app-pull app-restart app-logs nginx-install \
        stack-up stack-down stack-pull stack-restart stack-logs \
        swap docker-clean clean clean-all

help: ## Show this help
	@awk 'BEGIN {FS = ":.*##"} \
		/^##@/ {printf "\n\033[1m%s\033[0m\n", substr($$0, 5); next} \
		/^[a-zA-Z0-9_-]+:.*##/ {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo

##@ Setup & environment
setup: install content env ## First-time local setup: install deps, seed content, create .env
	@echo "✓ setup complete — edit .env and content/*.json, then run: make dev"

install: ## Install dependencies (immutable, matches CI)
	corepack enable
	$(YARN) install --immutable

content: ## Seed content/*.json from *.example.json templates (never overwrites existing files)
	@for f in content/*.example.json; do \
		target="$$(echo "$$f" | sed 's/\.example//')"; \
		if [ -f "$$target" ]; then echo "skip   $$target (exists)"; \
		else cp "$$f" "$$target"; echo "create $$target"; fi; \
	done

env: ## Create .env from .env.example if it doesn't exist yet
	@if [ -f .env ]; then echo ".env already exists — leaving it alone"; \
	else cp .env.example .env; echo "created .env from .env.example — fill in your real values"; fi

##@ Develop
dev: ## Run the Next.js dev server (hot reload)
	$(YARN) dev

dev-docker: ## Build & run the dev stack in Docker (docker-compose.dev.yml)
	$(DC) -f $(COMPOSE_DEV) up --build

dev-docker-down: ## Stop & remove the dev Docker stack
	$(DC) -f $(COMPOSE_DEV) down

##@ Quality
verify: lint typecheck test-ci build ## Full local gate: lint + typecheck + tests + build
	@echo "✓ verify passed"

lint: ## Run ESLint
	$(YARN) lint

typecheck: ## Run the TypeScript type checker
	$(YARN) typecheck

test: ## Run the test suite
	$(YARN) test

test-ci: ## Run tests with coverage (matches CI)
	$(YARN) test:ci

audit: ## Fail on high/critical dependency advisories (matches CI)
	$(YARN) npm audit --recursive --severity high

##@ Build
build: ## Production build (local, no Docker)
	$(YARN) build

image: ## Build the production Docker image (yarn install needs ~2GB RAM — build off-server)
	docker build --target production -t $(IMAGE) .

##@ Deploy — app behind your own host nginx (recommended)
deploy: app-pull app-up ## Pull the latest published image and (re)start the app
	@echo "✓ deployed — app is live on 127.0.0.1:3000 behind your host nginx"

app-up: ## Start the app container on 127.0.0.1:3000 (never builds on the server)
	$(DC) -f $(COMPOSE_PROD) up -d --no-build

app-down: ## Stop & remove the app container
	$(DC) -f $(COMPOSE_PROD) down

app-pull: ## Pull the latest published image
	$(DC) -f $(COMPOSE_PROD) pull

app-restart: ## Restart the app (picks up edited content/ without a new image)
	$(DC) -f $(COMPOSE_PROD) restart invictus

app-logs: ## Tail the app logs
	$(DC) -f $(COMPOSE_PROD) logs -f invictus

nginx-install: ## Install the host nginx server block (edit the domain + run certbot after)
	sudo cp nginx/host-invictus.conf.example /etc/nginx/conf.d/invictus.conf
	@echo "Installed /etc/nginx/conf.d/invictus.conf — now:"
	@echo "  1) edit server_name to your domain"
	@echo "  2) sudo nginx -t && sudo systemctl reload nginx"
	@echo "  3) sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"

##@ Deploy — bundled stack (app + nginx + certbot, no host nginx needed)
stack-up: ## Start the full stack detached (pulls the image; never builds on the server)
	$(DC) -f $(COMPOSE_PROD) $(BUNDLED) up -d --no-build

stack-down: ## Stop & remove the full stack
	$(DC) -f $(COMPOSE_PROD) $(BUNDLED) down

stack-pull: ## Pull the latest published images (app + nginx + certbot)
	$(DC) -f $(COMPOSE_PROD) $(BUNDLED) pull

stack-restart: ## Restart just the app (picks up edited content/ without a new image)
	$(DC) -f $(COMPOSE_PROD) restart invictus

stack-logs: ## Tail the full-stack logs
	$(DC) -f $(COMPOSE_PROD) $(BUNDLED) logs -f

##@ Maintain & clean
swap: ## Add a 2G swap file (only needed if you must build the image on a low-RAM host)
	sudo fallocate -l 2G /swapfile
	sudo chmod 600 /swapfile
	sudo mkswap /swapfile
	sudo swapon /swapfile
	@echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

docker-clean: ## Stop this project's containers and remove its image (leaves other Docker alone)
	-$(DC) -f $(COMPOSE_PROD) $(BUNDLED) down
	-$(DC) -f $(COMPOSE_DEV) down
	-docker image rm $(IMAGE)

clean: ## Remove build artifacts (.next, coverage, *.tsbuildinfo)
	rm -rf .next coverage *.tsbuildinfo

clean-all: clean ## Also remove node_modules and the yarn cache
	rm -rf node_modules .yarn/cache
