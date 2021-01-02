FROM node:lts-alpine AS build

ARG VUE_APP_API_URL
ENV VUE_APP_API_URL=$VUE_APP_API_URL

WORKDIR /app
COPY . .
RUN npm install


RUN npm run build --production

FROM nginx:stable-alpine
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
