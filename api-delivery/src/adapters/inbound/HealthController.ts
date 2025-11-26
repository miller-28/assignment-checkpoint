// Health Controller - Health check and metrics endpoints
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { checkDatabaseHealth } from '../../infrastructure/database/connection';

export class HealthController {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  registerRoutes(app: FastifyInstance): void {
    app.get('/api/v1/health', async (request: FastifyRequest, reply: FastifyReply) => {
      const dbHealthy = await checkDatabaseHealth();
      
      return reply.send({
        status: dbHealthy ? 'healthy' : 'unhealthy',
        database: dbHealthy,
      });
    });

    app.get('/api/v1/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
      const uptime = (Date.now() - this.startTime) / 1000;
      
      return reply.send({
        service: 'order-api',
        uptime,
      });
    });
  }
}
