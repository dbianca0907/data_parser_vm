#!/bin/bash

# Funcție pentru oprirea serviciilor
stop_services() {
  echo "Oprind API-ul..."
  kill "$API_PID" 2>/dev/null

  echo "Oprind QuestDB..."
  ./../questdb-8.1.4-rt-linux-x86-64/bin/questdb.sh stop

  echo "Serviciile au fost oprite."
}

# Setează un trap pentru a închide serviciile la terminare
trap stop_services EXIT

# Actualizează DB_HOST în fișierul .env
./update_env.sh || { echo "Eroare la actualizarea fișierului .env"; exit 1; }

# Pornește QuestDB
echo "Pornesc QuestDB..."
./../questdb-8.1.4-rt-linux-x86-64/bin/questdb.sh start &
QUESTDB_PID=$!

# Pornește API-ul
echo "Pornesc API-ul..."
npx ts-node src/server.ts &
API_PID=$!

echo "Am pornit toate serviciile!"

# Așteaptă până când procesul principal se termină
wait $API_PID
wait $QUESTDB_PID
