import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

export const getReviewBySolutionId = async (req: Request, res: Response) => {
  try {
    const rawSolutionId = req.params.solutionId;
    const solutionId = Array.isArray(rawSolutionId) ? rawSolutionId[0] : rawSolutionId;

    if (!solutionId) {
      return res.status(400).json({ message: 'solutionId es requerido' });
    }

    const review = await prisma.codeReview.findUnique({
      where: { solutionId }
    });

    if (!review) {
      return res.status(404).json({ 
        message: "Análisis no encontrado para esta solución" 
      });
    }

    return res.json(review);
  } catch (error) {
    console.error("Error al obtener la review:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};