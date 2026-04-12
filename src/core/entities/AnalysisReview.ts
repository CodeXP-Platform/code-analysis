import { z } from 'zod';

export const AnalysisReviewSchema = z.object({
  aiScore: z.number().min(0).max(100),
  summary: z.string(),
  suggestions: z.array(z.string()),
  highlights: z.array(z.string()),
  status: z.enum(["PASSED", "FAILED"])
});

export type AnalysisReview = z.infer<typeof AnalysisReviewSchema>;