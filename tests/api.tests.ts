import request from 'supertest';
import express from 'express';
import { Client } from 'pg';
import { ingest } from '../src/api';
import dotenv from 'dotenv';

// Încarcă variabilele de mediu din fișierul .env pentru teste
dotenv.config();

const app = express();
app.use(express.json());
app.post('/ingest', async (req, res) => {
  // const response = await ingest(req.body);
  try {
    console.log('Ingestion started');
    const response = await ingest(req.body);
    console.log('Ingestion completed');
    res.status(response.status).send(response.body);
  } catch (error) {
    console.error('Ingestion error:', error);
    res.status(500).send({ error: 'Ingestion failed' });
  }
  // res.status(response.status).send(response.body);
});

// Test variabile de mediu
describe("Environment Variables", () => {
  it("should have the correct values for environment variables", () => {
    expect(process.env.DB_USER).toBe("admin");
    expect(process.env.DB_PASSWORD).toBe("quest");
    expect(process.env.DB_HOST).toBe("34.116.229.9"); // de modificat de fiecare data
    expect(process.env.DB_NAME).toBe("sensor_data");
    expect(process.env.PORT).toBe("3000"); // Dacă ai un port specific
  });
});

// Test pentru conexiunea la baza de date
describe('Database Connection Tests', () => {
  it('should connect to the database', async () => {
    const client = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: 8812, // sau portul corect al QuestDB
    });

    try {
      await client.connect(); // Încearcă să te conectezi la baza de date
      expect(client).toBeDefined(); // Dacă conexiunea a fost realizată, testul va trece
    } catch (error) {
      fail('Database connection failed: '); // Dacă se produce o eroare, testul va eșua
    } finally {
      await client.end(); // Închide conexiunea la baza de date
    }
  });
});

// Testele API
describe('API Tests', () => {
  it('should successfully ingest valid data', async () => {
    const validData = {
      clientId: 'client123',
      timestamp: 1672531200,
      location: { latitude: 45.76, longitude: 4.84 },
      data: [
        { dimension: 'temperature', value: 23.4 },
        { dimension: 'humidity', value: 60.1 },
      ],
    };

    const response = await request(app).post('/ingest').send(validData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
  });

  it('should return 400 for invalid data', async () => {
    const invalidData = {
      clientId: '',
      timestamp: -100,
      location: { latitude: 'invalid', longitude: 4.84 },
      data: [],
    };

    const response = await request(app).post('/ingest').send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
