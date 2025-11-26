// Delivery Controller - HTTP endpoints
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DeliveryService } from '../../domain/services/DeliveryService';
import { ShipOrderUseCase } from '../../application/ShipOrderUseCase';
import { DeliverOrderUseCase } from '../../application/DeliverOrderUseCase';
import { DeliveryStatus } from '../../domain/entities/Delivery';

interface GetDeliveryParams {
  id: string;
}

interface ListDeliveriesQuery {
  status?: DeliveryStatus;
}

export class DeliveryController {
  constructor(
    private deliveryService: DeliveryService,
    private shipOrderUseCase: ShipOrderUseCase,
    private deliverOrderUseCase: DeliverOrderUseCase
  ) {}

  registerRoutes(app: FastifyInstance): void {
    // List deliveries with optional status filter
    app.get<{ Querystring: ListDeliveriesQuery }>(
      '/api/v1/deliveries',
      async (request: FastifyRequest<{ Querystring: ListDeliveriesQuery }>, reply: FastifyReply) => {
        try {
          const deliveries = await this.deliveryService.listDeliveries(request.query.status);
          return reply.send(deliveries);
        } catch (error: any) {
          return reply.code(500).send({ error: error.message });
        }
      }
    );

    // Get delivery by ID
    app.get<{ Params: GetDeliveryParams }>(
      '/api/v1/deliveries/:id',
      async (request: FastifyRequest<{ Params: GetDeliveryParams }>, reply: FastifyReply) => {
        try {
          const delivery = await this.deliveryService.getDeliveryById(request.params.id);
          if (!delivery) {
            return reply.code(404).send({ error: 'Delivery not found' });
          }
          return reply.send(delivery);
        } catch (error: any) {
          return reply.code(500).send({ error: error.message });
        }
      }
    );

    // Ship delivery
    app.post<{ Params: GetDeliveryParams }>(
      '/api/v1/deliveries/:id/ship',
      async (request: FastifyRequest<{ Params: GetDeliveryParams }>, reply: FastifyReply) => {
        try {
          await this.shipOrderUseCase.execute(request.params.id);
          
          // Return updated delivery
          const delivery = await this.deliveryService.getDeliveryById(request.params.id);
          return reply.send(delivery);
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

    // Deliver delivery
    app.post<{ Params: GetDeliveryParams }>(
      '/api/v1/deliveries/:id/deliver',
      async (request: FastifyRequest<{ Params: GetDeliveryParams }>, reply: FastifyReply) => {
        try {
          await this.deliverOrderUseCase.execute(request.params.id);
          
          // Return updated delivery
          const delivery = await this.deliveryService.getDeliveryById(request.params.id);
          return reply.send(delivery);
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
