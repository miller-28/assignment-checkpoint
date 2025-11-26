// Order Controller - HTTP endpoints
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CreateOrderUseCase } from '../../application/CreateOrderUseCase';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';

interface CreateOrderBody {
  user_id: string;
  product_id: string;
  quantity: number;
  idempotency_key?: string;
}

interface GetOrderParams {
  id: string;
}

export class OrderController {
  constructor(
    private createOrderUseCase: CreateOrderUseCase,
    private orderRepository: IOrderRepository
  ) {}

  registerRoutes(app: FastifyInstance): void {
    app.post<{ Body: CreateOrderBody }>(
      '/api/v1/orders',
      {
        schema: {
          body: {
            type: 'object',
            required: ['user_id', 'product_id', 'quantity'],
            properties: {
              user_id: { type: 'string' },
              product_id: { type: 'string' },
              quantity: { type: 'number', minimum: 1 },
              idempotency_key: { type: 'string' },
            },
          },
        },
      },
      async (request: FastifyRequest<{ Body: CreateOrderBody }>, reply: FastifyReply) => {
        try {
          const order = await this.createOrderUseCase.execute(request.body);
          return reply.code(201).send(order);
        } catch (error: any) {
          return reply.code(400).send({ error: error.message });
        }
      }
    );

    // List all orders
    app.get(
      '/api/v1/orders',
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          const orders = await this.orderRepository.findAll();
          return reply.send(orders);
        } catch (error: any) {
          return reply.code(500).send({ error: error.message });
        }
      }
    );

    app.get<{ Params: GetOrderParams }>(
      '/api/v1/orders/:id',
      async (request: FastifyRequest<{ Params: GetOrderParams }>, reply: FastifyReply) => {
        try {
          const order = await this.orderRepository.findById(request.params.id);
          if (!order) {
            return reply.code(404).send({ error: 'Order not found' });
          }
          return reply.send(order);
        } catch (error: any) {
          return reply.code(500).send({ error: error.message });
        }
      }
    );

    // Delete specific order
    app.delete<{ Params: GetOrderParams }>(
      '/api/v1/orders/:id',
      async (request: FastifyRequest<{ Params: GetOrderParams }>, reply: FastifyReply) => {
        try {
          await this.orderRepository.delete(request.params.id);
          return reply.code(204).send();
        } catch (error: any) {
          return reply.code(500).send({ error: error.message });
        }
      }
    );

    // Delete all orders
    app.delete(
      '/api/v1/orders',
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          await this.orderRepository.deleteAll();
          return reply.code(204).send();
        } catch (error: any) {
          return reply.code(500).send({ error: error.message });
        }
      }
    );
  }
}
