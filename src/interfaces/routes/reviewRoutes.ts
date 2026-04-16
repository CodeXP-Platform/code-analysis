import { Router } from 'express';
import { getReviewBySolutionId } from '../../infrastructure/controllers/CodeReviewController.js';

const router = Router();

router.get('/reviews/:solutionId', getReviewBySolutionId);

export default router;