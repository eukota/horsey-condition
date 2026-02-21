IMAGE   := platformer
PORT    := 8080
VERSION := $(shell cat version.txt)

.PHONY: build run dev release-patch release-minor release-major

build:
	docker build -t $(IMAGE) .

run:
	@touch scores.db
	docker run --rm -p $(PORT):2000 \
		-v $(PWD)/scores.db:/app/scores.db \
		$(IMAGE)

dev: build
	@touch scores.db
	docker run --rm -p $(PORT):2000 \
		-v $(PWD)/index.html:/app/index.html \
		-v $(PWD)/levels.js:/app/levels.js \
		-v $(PWD)/scores.php:/app/scores.php \
		-v $(PWD)/scores.db:/app/scores.db \
		$(IMAGE)

release-patch:
	$(eval NEW=$(shell awk -F. '{printf "%d.%d.%d",$$1,$$2,$$3+1}' version.txt))
	@echo $(NEW) > version.txt
	@perl -pi -e "s/const VERSION = '[^']*'/const VERSION = '$(NEW)'/" index.html
	git add version.txt index.html
	git commit -m "chore: release v$(NEW)"
	git tag "v$(NEW)"
	git push && git push --tags

release-minor:
	$(eval NEW=$(shell awk -F. '{printf "%d.%d.0",$$1,$$2+1}' version.txt))
	@echo $(NEW) > version.txt
	@perl -pi -e "s/const VERSION = '[^']*'/const VERSION = '$(NEW)'/" index.html
	git add version.txt index.html
	git commit -m "chore: release v$(NEW)"
	git tag "v$(NEW)"
	git push && git push --tags

release-major:
	$(eval NEW=$(shell awk -F. '{printf "%d.0.0",$$1+1}' version.txt))
	@echo $(NEW) > version.txt
	@perl -pi -e "s/const VERSION = '[^']*'/const VERSION = '$(NEW)'/" index.html
	git add version.txt index.html
	git commit -m "chore: release v$(NEW)"
	git tag "v$(NEW)"
	git push && git push --tags
