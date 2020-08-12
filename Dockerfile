FROM node:12.16-alpine

RUN mkdir -p /app/api && mkdir -p /app/web

WORKDIR /app

COPY ./api/package.json ./api/yarn.lock /app/api/
COPY ./web/package.json ./web/yarn.lock /app/web/

RUN yarn --cwd=/app/api install && yarn --cwd=/app/web install

COPY ./web/tsconfig.json /app/web/
COPY ./api/tsconfig.json /app/api/

COPY ./web/public /app/web/public

COPY ./api/src /app/api/src
COPY ./web/src /app/web/src

RUN REACT_APP_GRAPHQL=/graphql REACT_APP_IMG=/img yarn --cwd=/app/web build
CMD yarn --cwd=/app/api start

