import express from 'express';
import type { Request, Response } from 'express';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.get('/', (req: Request, res: Response) => {
  res.send('Code Analysis Service is active');
});

app.listen(port, () => {
  console.log(`Code Analysis Service is running on http://localhost:${port}`);
});