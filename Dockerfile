FROM node:20-alpine
WORKDIR /app
COPY package.json server.js index.html levels.js scores.json ./
CMD ["node", "server.js"]
