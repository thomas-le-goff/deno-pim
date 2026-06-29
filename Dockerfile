FROM node:24 as build

WORKDIR /usr/src/app

COPY package*.json ./
COPY src ./src

RUN npm install

FROM node:24 as runtime

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/src ./src

EXPOSE 3000

CMD ["node", "src/main.ts"]
