import { z } from "zod";
import { Client } from "pg"; // PostgreSQL client
import { logger } from "./logger";
import dotenv from 'dotenv';

// Încarcă variabilele de mediu din fișierul .env
dotenv.config();

// Definește structura datelor primite
const sensorIngestionContract = z.object({
  clientId: z.string().min(1),
  timestamp: z.union([z.number().int().positive(), z.bigint()]),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  data: z.array(
    z.object({
      dimension: z.string().min(1),
      value: z.number(),
    })
  ),
});

export type SensorIngestionContract = z.infer<typeof sensorIngestionContract>;

// Funcția principală de ingestie
export const ingest = async (
  data: unknown
): Promise<{ status: number; body: object }> => {
  // Validare date
  const validation = sensorIngestionContract.safeParse(data);
  if (!validation.success) {
    logger.info("Invalid request", {
      issues: validation.error.issues,
    });
    return {
      status: 400,
      body: {
        success: false,
        errors: validation.error.issues,
      },
    };
  }

  try {
    // Stocare directă în baza de date
    // Convertire timestamp din milisecunde (dacă este cazul) în nanosecunde
    const validatedData = {
      ...validation.data,
      timestamp:
        validation.data.timestamp > 1_000_000_000_000 // Verifică dacă este în milisecunde
          ? BigInt(validation.data.timestamp) * BigInt(1_000_000)
          : BigInt(validation.data.timestamp) * BigInt(1_000_000_000), // Convertire din secunde
    };
    await insertData(validatedData);
  } catch (e) {
    console.log(e);
    logger.error("Failed to insert data into QuestDB", { data, error: e });
    return {
      status: 500,
      body: {
        success: false,
        error: "Internal server error",
      },
    };
  }


  return {
    status: 200,
    body: {
      success: true,
    },
  };
};

// Inserare directă în QuestDB
const insertData = async (data: SensorIngestionContract) => {
  // Conectează-te la QuestDB
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 8812, // sau portul corect al QuestDB
  });

  await client.connect();


  try {
    // Inserare locație și timestamp
    const location = data.location;
    //const timestamp = new Date(data.timestamp * 1000).toISOString(); // Convertire la ISO
    const timestamp_raw =
  typeof data.timestamp === "bigint"
    ? data.timestamp * 1000n // Dacă este bigint, multiplică cu 1000n
    : BigInt(data.timestamp) * 1000n; // Dacă este number, convertește-l la bigint și multiplică

const timestamp = new Date(Number(timestamp_raw / 1_000_000n)).toISOString(); // Convertire la ISO
    for (const entry of data.data) {
      const query = `
        INSERT INTO sensor_data (client, timestamp, latitude, longitude, dimension, value)
        VALUES ($1, $2, $3, $4, $5, $6);
      `;
      const values = [
        data.clientId,
        timestamp,
        location.latitude,
        location.longitude,
        entry.dimension,
        entry.value,
      ];

      // Execută query-ul
      await client.query(query, values);
    }
  } finally {
    // Închide conexiunea
    await client.end();
  }
};
