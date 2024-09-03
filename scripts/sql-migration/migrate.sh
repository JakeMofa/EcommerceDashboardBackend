#!/bin/bash

DIR="$(dirname "$0")"
DB_HOST=${DB_HOST:-vendo-stage.cfzvmcilmyox.us-east-2.rds.amazonaws.com}
DB_USER=${DB_USER:-admin}
DB_PASSWORD=${DB_PASSWORD:-vF15obgNAXZxfkfJ9NPi}
DB_PORT=${DB_PORT:-3407}
MAIN_DB=${MAIN_DB:-vendo_commerce}

# Initialize the log to stdout
echo "Migration started at $(date)"

# Fetch the databases from the main database and store them in a file
mysql -u $DB_USER -p$DB_PASSWORD -h $DB_HOST -P $DB_PORT $MAIN_DB -e "SELECT db_name FROM Brands WHERE db_name IS NOT NULL AND db_name <> '' ORDER BY id DESC;" | tail -n +2 > "$DIR/dbs.txt"

process_db() {
    db_name=$1
    echo "Processing database: $db_name at $(date)"
    mysql -u $DB_USER -p$DB_PASSWORD -h $DB_HOST -P $DB_PORT $db_name < "$DIR/migrate.sql"
    echo "Finished processing database: $db_name at $(date)"
}

export -f process_db
export DB_USER DB_PASSWORD DB_HOST DB_PORT DIR

cat "$DIR/dbs.txt" | xargs -I {} -P 1 bash -c 'process_db "$@"' _ {}

rm "$DIR/dbs.txt"

echo "Migration finished at $(date)"