import { groq } from '@ai-sdk/groq';
import { generateText, Output } from 'ai';
import { AnalysisReviewSchema } from '../../core/entities/AnalysisReview.js';

export const generateFeedback = async (studentCode: string, testResults: string) => {
  const { text } = await generateText({
    model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
    output: Output.object({ schema: AnalysisReviewSchema }),
    system: `Eres un mentor pedagógico de programación para alumnos de primeros ciclos. 
             Tu objetivo es motivar y guiar, no solo corregir. 
             Analiza el código y los resultados de los tests para dar un feedback constructivo.`,
    prompt: `Código del estudiante: ${studentCode}\nResultados de los tests: ${testResults}`,
  });

  return JSON.parse(text);
};