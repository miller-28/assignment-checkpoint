// Health Controller
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { healthCheck } from '../../infrastructure/database/connection';

export class HealthController {
  registerRoutes(app: FastifyInstance): void {
    app.get('/api/v1/health', async (request: FastifyRequest, reply: FastifyReply) => {
      const dbHealthy = await healthCheck();
      const status = dbHealthy ? 'healthy' : 'unhealthy';
      const code = dbHealthy ? 200 : 503;
      return reply.code(code).send({ status, database: dbHealthy });
    });

    app.get('/api/v1/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
      // Basic metrics - could be expanded
      return reply.send({
        service: 'sales-api',
        uptime: process.uptime(),
      });
    });
  }
}
