.PHONY: install format check

install:
	@echo "Installation de Biome"
	winget install biomejs.biome
	@echo "Terminé"

check:
	biome format .

format:
	biome format --write .

sync:
	git pull origin main
	biome format --write .

