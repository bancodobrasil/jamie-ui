FROM node:16-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile && yarn cache clean

COPY . .

RUN yarn build

FROM nginx:1.23

RUN apt update && \
  apt install -y libmaxminddb0 libmaxminddb-dev mmdb-bin nginx-full && \
  apt clean && \
  rm -rf /var/lib/apt/lists/*

RUN rm -f /etc/nginx/modules-enabled/50-mod-http-auth-pam.conf \
  /etc/nginx/modules-enabled/50-mod-http-dav-ext.conf \
  /etc/nginx/modules-enabled/50-mod-http-echo.c \
  /etc/nginx/modules-enabled/50-mod-http-geoip.conf \
  /etc/nginx/modules-enabled/50-mod-http-subs-filter.conf \
  /etc/nginx/modules-enabled/50-mod-http-upstream-fair.conf

COPY nginx/geoip2.conf /etc/nginx/conf.d/geoip2.conf

WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist /usr/share/nginx/html

ARG NGINX_EXPORTER_RESOLVER=8.8.8.8
ENV NGINX_EXPORTER_RESOLVER=${NGINX_EXPORTER_RESOLVER}

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/00-log-formats.conf /etc/nginx/conf.d/00-log-formats.conf
COPY nginx/.htpasswd /etc/nginx/.htpasswd

COPY nginx/setup-env.sh /docker-entrypoint.d
RUN chmod +x /docker-entrypoint.d/setup-env.sh

RUN rm -f /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]