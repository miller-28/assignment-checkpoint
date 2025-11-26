// Mock Auth Middleware
import { FastifyRequest, FastifyReply } from 'fastify';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  // Mock authentication - always pass through
  // In production, validate JWT token here
  return;
}
