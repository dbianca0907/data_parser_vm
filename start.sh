#!/bin/bash

# Actualizează DB_HOST în fișierul .env
./update_env.sh || { echo "Eroare la actualizarea fișierului .env"; exit 1; }

# Pornește QuestDB
echo "Pornesc QuestDB..."
./../questdb-8.1.4-rt-linux-x86-64/bin/questdb.sh start &

# Pornește API-ul
echo "Pornesc API-ul..."
npx ts-node src/server.ts &

echo "Am pornit toate serviciile!"
