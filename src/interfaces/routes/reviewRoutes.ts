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
    console.log("Ejecutando verifyJwt");
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ message: "No se proporcionó token o formato inválido" });
    }

    const token = authHeader.split(" ")[1];
    try {
        // Asume que la variable de entorno JWT_SECRET existe
        const secret = Buffer.from(process.env.JWT_SECRET || "tu_secreto_por_defecto", "base64");
        console.log("SECRET ", secret);
        const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] }) as { sub?: string };
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
    "/reviews/:solutionId/attempts/:attemptId",
    verifyJwt,
    getReviewByAttemptId,
);

export default router;
