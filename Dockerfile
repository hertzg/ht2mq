FROM node:18-alpine
WORKDIR /app

COPY ./package*.json ./yarn.lock ./
RUN yarn install

EXPOSE 8080

COPY ./src ./src

CMD ["node", "src/index.js"]

