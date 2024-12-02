import express from 'express';
import { ingest } from './api';
import { logger } from './logger';

const app = express();
app.use(express.json());

app.post('/ingest', async (req, res) => {
  const response = await ingest(req.body);
  res.status(response.status).send(response.body);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`, {});
});
