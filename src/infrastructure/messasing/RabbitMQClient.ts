import amqp from 'amqplib';
import { generateFeedback } from '../ai-providers/VercelAIService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const initRabbitMQ = async () => {
  try {
    //conexion y bandeja de entrada
    const connection = await amqp.connect(process.env.RABBIT_URL || 'amqp://rabbitmq:rabbitmq@localhost:5672');
    const channel = await connection.createChannel();

    const exchangeName = 'Code Execution';
    await channel.assertExchange(exchangeName, 'topic', { durable: true });

    const queueName = 'Code Analysis';
    await channel.assertQueue(queueName, { durable: true });

    await channel.bindQueue(queueName, exchangeName, 'codeexecution.solution.execution.completed');

    console.log('Escuchando eventos...');

    

    channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        const eventData = JSON.parse(msg.content.toString());
        console.log('Mensaje recibido:', eventData.eventId);

        try {
          const { code, testResults } = eventData.data;
          
          const feedback = await generateFeedback(code, JSON.stringify(testResults));

          
          const savedReview = await prisma.codeReview.create({
            data: {
              solutionId: eventData.data.solutionId,
              userId: eventData.data.userId,
              status: 'COMPLETED',
              aiScore: feedback.aiScore,
              feedback: feedback.summary,
              suggestions: feedback.suggestions, 
            }
          });
          
          console.log('Feedback generado para:', eventData.data.solutionId);
          
          const analysisResults = {
            solutionId: eventData.data.solutionId,
            aiScore: feedback.aiScore,
            status: feedback.status,
          };

          await publishAnalysisReady(channel, {
            ...analysisResults,
            reviewId: savedReview.id,
          });

          
          channel.ack(msg);
        } catch (error) {
          console.error('Error procesando análisis:', error);
          channel.nack(msg, false, true); 
        }
      }
    });

  } catch (error) {
    console.error('Error conectando a RabbitMQ:', error);
  }
};

export const publishAnalysisReady = async (channel: any, analysisData: any) => {
  const exchangeName = 'Code Analysis';
  await channel.assertExchange(exchangeName, 'topic', { durable: true });
  const routingKey = 'codeanalysis.analysis.ready';

  const event = {
    eventId: crypto.randomUUID(),
    eventType: 'AnalysisReadyEvent',
    timestamp: new Date().toISOString(),
    data: {
      solutionId: analysisData.solutionId,
      challengeId: analysisData.challengeId,
      userId: analysisData.userId,
      status: analysisData.status,
      aiScore: analysisData.aiScore,
      reviewId: analysisData.reviewId
    }
  };

  channel.publish(
    exchangeName,
    routingKey,
    Buffer.from(JSON.stringify(event)),
    { persistent: true }
  );

  console.log('📢 Evento AnalysisReadyEvent publicado');
};