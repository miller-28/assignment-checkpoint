// Mock Auth Middleware
import { FastifyRequest, FastifyReply } from 'fastify';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  // Simple mock - always pass for demo
  (request as any).user = { userId: 'mock-user-123' };
}
