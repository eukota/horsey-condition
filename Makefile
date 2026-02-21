IMAGE := platformer
PORT  := 8080

.PHONY: build run dev

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
