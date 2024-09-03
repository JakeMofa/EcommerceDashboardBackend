##!/bin/bash

# Set up MySQL configuration
# docker run --name -p 3306:3306 test -e MYSQL_ROOT_PASSWORD=amir -d mysql:latest
# docker run --name vendoDB -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql:latest
# docker-compose up -d -f docker-compose.db.yml
# # Wait for MySQL to start
# echo "Waiting for MySQL to start..."
# max_attempts=30
# attempt=1
# while [ $attempt -le $max_attempts ]; do
#     if mysqladmin ping -hlocalhost -uroot -ppassword --silent &> /dev/null ; then
#         echo "MySQL started!"
#         break
#     fi
#     attempt=$((attempt+1))
#     echo "Attempt $attempt of $max_attempts failed. Retrying in 1 second..."
#     sleep 5
# done


# docker-compose up -d -f docker-compose.app.yml

#!/bin/bash

export DATABASE_URL="$1"
npx prisma migrate up --experimental --create-db --verbose --schema=prisma/brand/brand.prisma