FROM node:lts-alpine
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate --schema=prisma/vendo/vendo.prisma
RUN npx prisma generate --schema=prisma/brand/brand.prisma
RUN npx prisma generate --schema=prisma/commerce/commerce.prisma

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]