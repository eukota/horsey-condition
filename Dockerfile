FROM node:20-alpine
WORKDIR /app
COPY package.json server.js platformer.html levels.js scores.json ./
CMD ["node", "server.js"]
