### Api pentru colectarea datelor

Comanda pornire server:  npx ts-node src/server.ts

Comanda URL postman pt post: http://192.168.8.156:3000/ingest

exemplu json postman: 
{
  "clientId": "clientId-ec85695bd6a1fdaa",
  "timestamp": 1718699160,
  "location": {
    "latitude": 44.384256,
    "longitude": 26.0866048
  },
  "data": [
    {
      "dimension": "Temperature",
      "value": 35
    },
    {
      "dimension": "Humidity",
      "value": 67
    },
    {
      "dimension": "Pressure",
      "value": 1006
    },
    {
      "dimension": "Altitude",
      "value": 59
    },
    {
      "dimension": "CO2",
      "value": 805
    },
    {
      "dimension": "PM1.0",
      "value": 16
    },
    {
      "dimension": "PM2.5",
      "value": 19
    }
  ]
}

TODO: de modificat ip ul dinamic al bazei de date de fiecare data

 scp -r /Users/dumitru.bianca/Desktop/data_parser dumitru.bianca@192.168.8.156:~/api