// Order Controller - HTTP endpoints
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { OrderService } from '../../domain/services/OrderService';
import { ShipOrderUseCase } from '../../application/ShipOrderUseCase';
import { DeliverOrderUseCase } from '../../application/DeliverOrderUseCase';
import { OrderStatus } from '../../domain/entities/Order';

interface GetOrderParams {
  id: string;
}

interface ListOrdersQuery {
  status?: OrderStatus;
}

export class OrderController {
  constructor(
    private orderService: OrderService,
    private shipOrderUseCase: ShipOrderUseCase,
    private deliverOrderUseCase: DeliverOrderUseCase
  ) {}

  registerRoutes(app: FastifyInstance): void {
    // List orders with optional status filter
    app.get<{ Querystring: ListOrdersQuery }>(
      '/api/v1/orders',
      async (request: FastifyRequest<{ Querystring: ListOrdersQuery }>, reply: FastifyReply) => {
        try {
          const orders = await this.orderService.listOrders(request.query.status);
          return reply.send(orders);
        } catch (error: any) {
          return reply.code(500).send({ error: error.message });
        }
      }
    );

    // Get order by ID
    app.get<{ Params: GetOrderParams }>(
      '/api/v1/orders/:id',
      async (request: FastifyRequest<{ Params: GetOrderParams }>, reply: FastifyReply) => {
        try {
          const order = await this.orderService.getOrderById(request.params.id);
          if (!order) {
            return reply.code(404).send({ error: 'Order not found' });
          }
          return reply.send(order);
        } catch (error: any) {
          return reply.code(500).send({ error: error.message });
        }
      }
    );

    // Ship order
    app.post<{ Params: GetOrderParams }>(
      '/api/v1/orders/:id/ship',
      async (request: FastifyRequest<{ Params: GetOrderParams }>, reply: FastifyReply) => {
        try {
          await this.shipOrderUseCase.execute(request.params.id);
          
          // Return updated order
          const order = await this.orderService.getOrderById(request.params.id);
          return reply.send(order);
        } catch (error: any) {
          if (error.message.includes('not found')) {
            return reply.code(404).send({ error: error.message });
          }
          if (error.message.includes('transition')) {
            return reply.code(400).send({ error: error.message });
          }
          return reply.code(500).send({ error: error.message });
        }
      }
    );

    // Deliver order
    app.post<{ Params: GetOrderParams }>(
      '/api/v1/orders/:id/deliver',
      async (request: FastifyRequest<{ Params: GetOrderParams }>, reply: FastifyReply) => {
        try {
          await this.deliverOrderUseCase.execute(request.params.id);
          
          // Return updated order
          const order = await this.orderService.getOrderById(request.params.id);
          return reply.send(order);
        } catch (error: any) {
          if (error.message.includes('not found')) {
            return reply.code(404).send({ error: error.message });
          }
          if (error.message.includes('transition')) {
            return reply.code(400).send({ error: error.message });
          }
          return reply.code(500).send({ error: error.message });
        }
      }
    );
  }
}
