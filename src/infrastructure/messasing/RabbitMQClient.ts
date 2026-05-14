import amqp from "amqplib";
import { generateFeedback } from "../ai-providers/VercelAIService.js";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

export const initRabbitMQ = async () => {
    try {
        //conexion y bandeja de entrada
        const connection = await amqp.connect(
            process.env.RABBITMQ_URL || "amqp://rabbitmq:rabbitmq@localhost:5672",
        );
        const channel = await connection.createChannel();

        const exchangeName = "codeexecution.exchange";
        await channel.assertExchange(exchangeName, "topic", { durable: true });

        const queueName = "Code Analysis";
        await channel.assertQueue(queueName, { durable: true });

        await channel.bindQueue(
            queueName,
            exchangeName,
            "codeexecution.solution.execution.completed",
        );

        console.log("Escuchando eventos...");

        channel.consume(queueName, async (msg) => {
            if (msg !== null) {
                const eventData = JSON.parse(msg.content.toString());
                console.log("Mensaje recibido:", eventData.eventId);

                try {
                    const {
                        code,
                        testResults,
                        attemptId,
                        challengeId,
                        solutionId,
                        userId,
                    } = eventData.data;

                    // 1. Crear el registro en base de datos con estado inicial QUEUED
                    let reviewRecord = await prisma.codeReview.upsert({
                        where: { attemptId: attemptId },
                        update: { status: "QUEUED" },
                        create: {
                            solutionId: solutionId,
                            attemptId: attemptId,
                            challengeId: challengeId,
                            userId: userId,
                            status: "QUEUED",
                        },
                    });

                    console.log(`[${attemptId}] Fase: QUEUED`);

                    // 2. Actualizar estado a GENERATING justo antes de llamar a la IA
                    reviewRecord = await prisma.codeReview.update({
                        where: { id: reviewRecord.id },
                        data: { status: "GENERATING" },
                    });

                    console.log(`[${attemptId}] Fase: GENERATING`);

                    // Llamada a la IA
                    const feedback = await generateFeedback(
                        code,
                        JSON.stringify(testResults),
                    );

                    // 3. Actualizar estado a COMPLETED y guardar resultados
                    reviewRecord = await prisma.codeReview.update({
                        where: { id: reviewRecord.id },
                        data: {
                            status: "COMPLETED",
                            aiScore: feedback.aiScore,
                            feedback: feedback.summary,
                            suggestions: feedback.suggestions,
                        },
                    });

                    console.log(
                        `[${attemptId}] Fase: COMPLETED (Feedback guardado)`,
                    );

                    const analysisResults = {
                        solutionId: solutionId,
                        attemptId: attemptId,
                        challengeId: challengeId,
                        userId: userId,
                        aiScore: feedback.aiScore,
                        status: feedback.status, // Status del veredicto de la IA (PASSED/FAILED)
                    };

                    await publishAnalysisReady(channel, {
                        ...analysisResults,
                        reviewId: reviewRecord.id,
                    });

                    channel.ack(msg);
                } catch (error) {
                    console.error("Error procesando análisis:", error);
                    channel.nack(msg, false, true);
                }
            }
        });
    } catch (error) {
        console.error("Error conectando a RabbitMQ:", error);
    }
};

export const publishAnalysisReady = async (channel: any, analysisData: any) => {
    const exchangeName = "Code Analysis";
    await channel.assertExchange(exchangeName, "topic", { durable: true });
    const routingKey = "codeanalysis.analysis.ready";

    const event = {
        eventId: crypto.randomUUID(),
        eventType: "AnalysisReadyEvent",
        timestamp: new Date().toISOString(),
        data: {
            solutionId: analysisData.solutionId,
            attemptId: analysisData.attemptId,
            challengeId: analysisData.challengeId,
            userId: analysisData.userId,
            status: analysisData.status,
            aiScore: analysisData.aiScore,
            reviewId: analysisData.reviewId,
        },
    };

    channel.publish(
        exchangeName,
        routingKey,
        Buffer.from(JSON.stringify(event)),
        { persistent: true },
    );

    console.log("📢 Evento AnalysisReadyEvent publicado");
};
