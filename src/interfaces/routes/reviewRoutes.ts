import {
    Router,
    type NextFunction,
    type Request,
    type Response,
} from "express";
import jwt from "jsonwebtoken";
import {
    getReviewBySolutionId,
    getReviewByAttemptId,
} from "../../infrastructure/controllers/CodeReviewController.js";

const router = Router();

// Middleware para verificar JWT
const verifyJwt = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ message: "No se proporcionó token o formato inválido" });
    }

    const token = authHeader.split(" ")[1];
    try {
        // Asume que la variable de entorno JWT_SECRET existe
        const secret = process.env.JWT_SECRET || "tu_secreto_por_defecto";
        const decoded = jwt.verify(token, secret) as { sub?: string };
        // El id del usuario suele venir en 'sub' (subject) o 'id'
        (req as any).userId = decoded.sub || (decoded as any).id;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token inválido o expirado" });
    }
};

router.get("/reviews/:solutionId", getReviewBySolutionId);

// Nuevo endpoint que valida userId usando JWT
router.get(
    "/api/v1/code-analysis/reviews/:solutionId/attempts/:attemptId",
    verifyJwt,
    getReviewByAttemptId,
);

export default router;
