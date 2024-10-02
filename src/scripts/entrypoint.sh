#!/bin/sh

while ! npx prisma migrate dev 2>&1; do
    echo "Makemigrations"
    sleep 3
done

echo "App is running....."

node ./src/index.js
sleep 3

exec "$@"
