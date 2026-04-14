import 'dotenv/config';
import express from 'express';
import { client } from './config/eureka-client.js';
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

app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

app.get('/info', (req, res) => {
  res.json({ 
    app: 'code-analysis-service', 
    description: 'AI-powered code analysis tutor' 
  });
});

app.get('/', (req: Request, res: Response) => {
  res.send('Code Analysis Service is active');
});

app.listen(port, () => {
  console.log(`Code Analysis Service is running on http://localhost:${port}`);
});

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
  client.stop((error) => {
    console.log('Unregistered from Eureka');
    process.exit(error ? 1 : 0);
  });
});
});