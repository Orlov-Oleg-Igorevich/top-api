FROM node:22-alpine
WORKDIR /top-api
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production
CMD ["node", "./dist/src/main.js"]