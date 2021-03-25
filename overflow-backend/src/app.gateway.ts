import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisClientService } from './redis-client/redis-client.service';

@WebSocketGateway()
export class AppGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AppGateway');

  constructor(private readonly redis: RedisClientService) {}

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.redis.disconnectPlayer(client.id);
    return '';
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('debug', { message: 'Hello world', arg1: 'Hi', arg2: 'there' });
    return '';
  }

  @SubscribeMessage('setName')
  async setName(client: Socket, data: string) {
    if (data.trim().length === 0) {
      client.emit('setNameResponse', {
        result: false,
        message: 'Username cannot be blank',
      });
      return;
    }
    await this.redis.setName(client.id, data);
    client.emit('setNameResponse', { result: true, message: data });
  }

  @SubscribeMessage('createLobby')
  async createLobby(client: Socket, lobbyCode: string) {
    if (lobbyCode.trim().length === 0) {
      return client.emit('createLobbyResponse', {
        result: false,
        message: 'Lobby Code cannot be empty',
      });
    }

    if (await this.redis.gameExists(lobbyCode)) {
      return client.emit('createLobbyResponse', {
        result: false,
        message: 'Lobby Code in use',
      });
    }

    try {
      await this.redis.createNewGame(lobbyCode, client.id);
      return client.emit('createLobbyResponse', {
        result: true,
        message: lobbyCode,
      });
    } catch (error) {
      return client.emit('createLobbyResponse', {
        result: false,
        message: `There was an error: ${JSON.stringify(error)}`,
      });
    }
  }

  @SubscribeMessage('joinLobby')
  async joinLobby(client: Socket, lobbyCode: string) {
    if (lobbyCode.trim().length === 0) {
      return client.emit('joinLobbyResponse', {
        result: false,
        message: 'Lobby Code cannot be empty',
      });
    }

    if (!(await this.redis.gameExists(lobbyCode))) {
      return client.emit('joinLobbyResponse', {
        result: false,
        message: 'Lobby does not exist',
      });
    }

    try {
      await this.redis.joinGame(lobbyCode, client.id);
      return client.emit('joinLobbyResponse', {
        result: true,
        message: lobbyCode,
      });
    } catch (error) {
      return client.emit('joinLobbyResponse', {
        result: false,
        message: `There was an error: ${JSON.stringify(error)}`,
      });
    }
  }
}
