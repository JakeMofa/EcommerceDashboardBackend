##!/bin/bash

npx prisma generate --schema=prisma/vendo/vendo.prisma
npx prisma generate --schema=prisma/brand/brand.prisma
npx prisma generate --schema=prisma/commerce/commerce.prisma