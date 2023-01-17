FROM node:16-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./

ARG YARN_TIMEOUT=100000

RUN yarn install --network-timeout ${YARN_TIMEOUT} --frozen-lockfile && yarn cache clean

COPY . .

RUN yarn build

FROM nginx:1.23-alpine

WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist /usr/share/nginx/html

ARG NGINX_EXPORTER_RESOLVER=8.8.8.8
ENV NGINX_EXPORTER_RESOLVER=${NGINX_EXPORTER_RESOLVER}

ARG NGINX_SERVER_NAME=jamie.g6tech.com.br
ENV NGINX_SERVER_NAME=${NGINX_SERVER_NAME}

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/.htpasswd /etc/nginx/.htpasswd

COPY nginx/setup-env.sh /docker-entrypoint.d
RUN chmod +x /docker-entrypoint.d/setup-env.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]