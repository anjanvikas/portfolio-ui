SHELL := /bin/bash

.DEFAULT_GOAL := help

## help: list all targets
.PHONY: help
help:
	@echo "Targets:"
	@awk -F':' '/^## / { sub(/^## /, "", $$0); printf "  %s\n", $$0 }' $(MAKEFILE_LIST)

## install: install node modules
.PHONY: install
install:
	npm install

## dev: start Next.js dev server
.PHONY: dev
dev:
	npm run dev

## build: production build
.PHONY: build
build:
	npm run build

## start: serve the production build
.PHONY: start
start:
	npm run start

## lint: next lint
.PHONY: lint
lint:
	npm run lint
