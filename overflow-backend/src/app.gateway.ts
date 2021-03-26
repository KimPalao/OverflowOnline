import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisClientService } from './redis-client/redis-client.service';

/**
 * Controls the WebSocket functionality of the backend
 */
@WebSocketGateway()
export class AppGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AppGateway');

  constructor(private readonly redis: RedisClientService) {}

  /**
   * An event handler that is run whenever a client disconnects
   *
   * @param client The Socket.IO socket object
   * @returns An empty message
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.redis.disconnectPlayer(client.id);
    return '';
  }

  /**
   * An event handler that is run whenever a client connects
   *
   * @param client The Socket.IO socket object
   * @returns An empty message
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('debug', { message: 'Hello world', arg1: 'Hi', arg2: 'there' });
    return '';
  }

  /**
   * Saves the displayName of the user in the Redis store
   *
   * It emits to:
   *
   * setNameResponse
   * - result
   * - - True if the operation was successful, false otherwise
   * - message
   * - - The displayName if the operation was successful, otherwise it contains the error message.
   *
   * @param client The Socket.IO socket object
   * @param displayName The display name of the user to be set
   * @returns void
   */
  @SubscribeMessage('setName')
  async setName(client: Socket, displayName: string) {
    if (displayName.trim().length === 0) {
      client.emit('setNameResponse', {
        result: false,
        message: 'Username cannot be blank',
      });
      return;
    }
    await this.redis.setName(client.id, displayName);
    client.emit('setNameResponse', { result: true, message: displayName });
  }

  /**
   * Instantiates a lobby
   *
   * It emits to:
   *
   * createLobbyResponse
   * - result
   * - - True if the operation was successful, false otherwise
   * - message
   * - - The lobbyCode if the operation was successful, otherwise it contains the error message.
   *
   * @param client The Socket.IO socket object
   * @param lobbyCode The code of the lobby / game to create
   */
  @SubscribeMessage('createLobby')
  async createLobby(client: Socket, lobbyCode: string): Promise<void> {
    if (lobbyCode.trim().length === 0) {
      client.emit('createLobbyResponse', {
        result: false,
        message: 'Lobby Code cannot be empty',
      });
      return;
    }

    if (await this.redis.gameExists(lobbyCode)) {
      client.emit('createLobbyResponse', {
        result: false,
        message: 'Lobby Code in use',
      });
      return;
    }

    try {
      await this.redis.createNewGame(lobbyCode, client.id);
      client.join(`game-${lobbyCode}`);
      client.emit('createLobbyResponse', {
        result: true,
        message: lobbyCode,
      });
    } catch (error) {
      client.emit('createLobbyResponse', {
        result: false,
        message: `There was an error: ${JSON.stringify(error)}`,
      });
    }
  }

  /**
   * Assigns a player to a game
   *
   * It emits to:
   *
   * joinLobbyResponse
   * - result
   * - - True if the operation was successful, false otherwise
   * - message
   * - - The lobbyCode if the operation was successful, otherwise it contains the error message.
   *
   * playerJoin
   * - displayName
   * - - The display name of the player that joined
   * - playerId
   * - - The Socket.IO id of the player that joined
   *
   * @param client The Socket.IO socket object
   * @param lobbyCode The code of the lobby / game to create
   */
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
      client.join(`game-${lobbyCode}`);
      client.to(`game-${lobbyCode}`).emit('playerJoin', {
        displayName: await this.redis.getPlayerName(client.id),
        playerId: client.id,
      });
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

  /**
   * Emits a list of the players in a lobby
   *
   * It emits to:
   *
   * getPlayersResponse
   * - players
   * - - The list of players, containing their display names and player Ids.
   *
   * @param client The Socket.IO socket object
   * @param lobbyCode The code of the lobby to get the list of players from
   */
  @SubscribeMessage('getPlayers')
  async getPlayers(client: Socket, lobbyCode: string) {
    const players = await this.redis.getGamePlayers(lobbyCode);
    this.logger.log(players);
    client.emit('getPlayersResponse', {
      players,
    });
  }

  /**
   * Removes a player from a game
   *
   * @param client The Socket.IO socket object
   * @param payload The data from the client
   * @param payload.lobbyCode The code of the lobby to remove a player from
   * @param payload.playerId The Socket.IO id of the player
   */
  @SubscribeMessage('kickPlayer')
  async kickPlayer(
    client: Socket,
    {
      lobbyCode,
      playerId,
    }: {
      lobbyCode: string;
      playerId: string;
    },
  ) {
    await this.redis.kickPlayer(lobbyCode, playerId);
    this.server.in(`game-${lobbyCode}`).emit('kickEvent', { playerId });
  }

  /**
   * Starts a game
   *
   * It emits to:
   *
   * gameStartEvent
   *
   * startGameResponse
   * - result
   * - - False when the game could not be started. Not emitted otherwise.
   * - message
   * - - The error message from failing to start the game
   *
   * @param client The Socket.IO socket object
   * @param lobbyCode The lobby code of the game to start
   */
  @SubscribeMessage('startGame')
  async startGame(client: Socket, lobbyCode: string) {
    try {
      if ((await this.redis.getNumberOfPlayers(lobbyCode)) < 2) {
        client.emit('startGameResponse', {
          result: false,
          message: 'Cannot start game with only one player',
        });
      }
      await this.redis.setGameActive(lobbyCode);
      this.server.in(`game-${lobbyCode}`).emit('gameStartEvent');
    } catch (error) {
      client.emit('startGameResponse', { result: false, message: error });
    }
  }
}
