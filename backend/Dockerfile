FROM node:14.15-alpine AS build

COPY src ./src
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .

RUN npm install
RUN npm install -g typescript
RUN tsc
RUN npm prune --production

FROM node:14.15-alpine

WORKDIR /app

COPY --from=build dist/ ./dist
COPY --from=build node_modules/ ./node_modules

RUN apk add --no-cache openssl
ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

CMD ["node", "dist/index.js"]
