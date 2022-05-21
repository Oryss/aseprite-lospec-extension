FROM node:16.13.1-alpine3.15

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json", ".env", "tsconfig.json", "./"]
COPY ./src ./src

RUN npm install

CMD npm run dev
