IMAGE := platformer
PORT  := 8080

.PHONY: build run dev

build:
	docker build -t $(IMAGE) .

run:
	@test -f scores.json || echo '{"highScores":[],"fastTimes":[]}' > scores.json
	docker run --rm -p $(PORT):2000 \
		-v $(PWD)/scores.json:/app/scores.json \
		$(IMAGE)

dev: build
	@test -f scores.json || echo '{"highScores":[],"fastTimes":[]}' > scores.json
	docker run --rm -p $(PORT):2000 \
		-v $(PWD)/platformer.html:/app/platformer.html \
		-v $(PWD)/levels.js:/app/levels.js \
		-v $(PWD)/server.js:/app/server.js \
		-v $(PWD)/scores.json:/app/scores.json \
		$(IMAGE) node --watch server.js
