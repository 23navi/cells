import express from 'express';
import path from 'path';
import { createCellsRouter } from './routes/cells';
import { connectDB } from './mongo';

export const serve = (
  port: number,
) => {
  // Connect to MongoDB
  connectDB();

  const app = express();

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use(createCellsRouter());

  // Use path.join and __dirname for clarity
  const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });


  return new Promise<void>((resolve, reject) => {
    app.listen(port, resolve).on('error', reject);
  });
};

serve(3001);