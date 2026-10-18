import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(RealtimeGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  joinFamilyRoom(client: Socket, familyId: string) {
    client.join(`family:${familyId}`);
    this.logger.log(`Client ${client.id} joined room family:${familyId}`);
  }

  leaveFamilyRoom(client: Socket, familyId: string) {
    client.leave(`family:${familyId}`);
    this.logger.log(`Client ${client.id} left room family:${familyId}`);
  }

  emitToFamily(familyId: string, event: string, data: unknown) {
    this.server.to(`family:${familyId}`).emit(event, data);
  }

  emitTaskCreated(familyId: string, task: unknown) {
    this.emitToFamily(familyId, 'task-created', task);
  }

  emitTaskUpdated(familyId: string, task: unknown) {
    this.emitToFamily(familyId, 'task-updated', task);
  }

  emitTaskDeleted(familyId: string, taskId: string) {
    this.emitToFamily(familyId, 'task-deleted', { id: taskId });
  }

  emitEventCreated(familyId: string, event: unknown) {
    this.emitToFamily(familyId, 'event-created', event);
  }

  emitEventUpdated(familyId: string, event: unknown) {
    this.emitToFamily(familyId, 'event-updated', event);
  }

  emitEventDeleted(familyId: string, eventId: string) {
    this.emitToFamily(familyId, 'event-deleted', { id: eventId });
  }

  emitExpenseCreated(familyId: string, expense: unknown) {
    this.emitToFamily(familyId, 'expense-created', expense);
  }

  emitNotification(familyId: string, notification: unknown) {
    this.emitToFamily(familyId, 'notification', notification);
  }
}
