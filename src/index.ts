import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import { generateFeedback } from './infrastructure/ai-providers/VercelAIService.js';

const app = express();
app.use(express.json());
const port = Number(process.env.PORT ?? 3000);


app.post('/api/v1/code-analysis/test', async (req, res) => {
  try {
    const { code, testResults } = req.body;
    console.log("Datos recibidos:", { code, testResults });
    const feedback = await generateFeedback(code, JSON.stringify(testResults));
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'La IA falló', details: error });
  }
});

app.get('/', (req: Request, res: Response) => {
  res.send('Code Analysis Service is active');
});

app.listen(port, () => {
  console.log(`Code Analysis Service is running on http://localhost:${port}`);
});