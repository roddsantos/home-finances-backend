FROM node:18-alpine AS development
LABEL description="NodeJS Homepay Backend"

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

EXPOSE 4001

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build