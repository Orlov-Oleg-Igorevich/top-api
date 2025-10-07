FROM node:22-alpine
WORKDIR /top-api
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["node", "./dist/src/main.js"]