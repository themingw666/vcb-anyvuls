#!/bin/sh

while ! npx prisma migrate dev 2>&1; do
    echo "Makemigrations"
    sleep 3
done

echo "Fakedata and run app"
node -r ./node_modules/@babel/register ./src/helper/initdata.js
node -r ./node_modules/@babel/register ./src/index.js

sleep 3

exec "$@"