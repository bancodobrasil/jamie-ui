FROM node:16-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile && yarn cache clean

COPY . .

RUN yarn build

FROM nginx:1.23-alpine

WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx/default.conf /etc/nginx/conf.d

COPY nginx/setup-env.sh /docker-entrypoint.d
RUN chmod +x /docker-entrypoint.d/setup-env.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]