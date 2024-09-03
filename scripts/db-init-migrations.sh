##!/bin/bash

npx prisma migrate resolve --schema=prisma/vendo/vendo.prisma --applied init
npx prisma migrate resolve --schema=prisma/commerce/commerce.prisma --applied init_vendo_commerce
npx prisma migrate resolve --schema=prisma/brand/brand.prisma --applied init_vendo_brand
npx prisma migrate deploy --schema=prisma/vendo/vendo.prisma
npx prisma migrate deploy --schema=prisma/commerce/commerce.prisma
npx prisma migrate deploy --schema=prisma/brand/brand.prisma
