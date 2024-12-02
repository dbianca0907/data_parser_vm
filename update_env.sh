#!/bin/bash

# Calea către fișierul .env
ENV_FILE="./data_parser_vm/.env"

# Funcție pentru obținerea IP-ului public (folosind `curl` sau `hostname -I` pe GCP)
get_public_ip() {
    curl -s http://checkip.amazonaws.com || hostname -I | awk '{print $1}'
}

# Obține IP-ul fie automat, fie din argument
if [ -z "$1" ]; then
    PUBLIC_IP=$(get_public_ip)
    if [ -z "$PUBLIC_IP" ]; then
        echo "Nu am putut determina IP-ul public. Te rog oferă-l manual:"
        read -p "IP Public: " PUBLIC_IP
    fi
else
    PUBLIC_IP="$1"
fi

# Confirmă că avem un IP valid
if [ -z "$PUBLIC_IP" ]; then
    echo "Eroare: Nu am un IP public valid. Ieșire."
    exit 1
fi

# Modifică valoarea DB_HOST în fișierul .env
if [ -f "$ENV_FILE" ]; then
    echo "Actualizez DB_HOST cu IP-ul $PUBLIC_IP în $ENV_FILE..."
    sed -i "s/^DB_HOST=.*/DB_HOST=$PUBLIC_IP/" "$ENV_FILE"
    echo "Actualizarea a fost completă!"
else
    echo "Eroare: Fișierul $ENV_FILE nu există."
    exit 1
fi
