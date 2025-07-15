import 'express-async-errors';
import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import { createCellsRouter } from './routes/cells';
import { connectDB } from './mongo';

export const serve = (
  port: number,
) => {
  // Connect to MongoDB
  connectDB();

  const app = express();

  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PUT') {
      let bodySize = 0;
      try {
        bodySize = JSON.stringify(req.body)?.length;
      } catch { }

      const bodySizeMB = bodySize / (1024 * 1024);
      console.log(`Request Body Size: ${bodySizeMB} MB`);

      // if (bodySizeMB > 16) {
      //   return res.status(413).json({
      //     error: "Payload too large",
      //     message: "The request body exceeds the 16MB limit.",
      //     receivedSizeMB: bodySizeMB.toFixed(2)
      //   });
      // }
    }
    next();
  });

  app.use(createCellsRouter());

  // Use path.join and __dirname for clarity
  const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
  app.use(express.static(clientBuildPath));


  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Global error handler:', err);
    res.status(500).send({ error: err.message || 'Unknown error' });
  })

  return new Promise<void>((resolve, reject) => {
    app.listen(port, resolve).on('error', reject);
  });
};

serve(3001);