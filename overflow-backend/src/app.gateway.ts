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

  constructor(private readonly redis: RedisClientService) {
    this.redis.flushAll();
  }

  /**
   * An event handler that is run whenever a client disconnects
   *
   * @param client The Socket.IO socket object
   * @returns An empty message
   */
  async handleDisconnect(client: Socket): Promise<string> {
    this.logger.log(`Client disconnected: ${client.id}`);
    const lobbyCode = await this.redis.getGameOfPlayer(client.id);
    console.log(lobbyCode);
    this.redis.disconnectPlayer(client.id);
    this.server
      .in(`game-${lobbyCode}`)
      .emit('kickEvent', { playerId: client.id });
    return '';
  }

  /**
   * An event handler that is run whenever a client connects
   *
   * @param client The Socket.IO socket object
   * @returns An empty message
   */
  handleConnection(client: Socket): string {
    this.logger.log(
      `Client connected: ${client.id} from ${client.conn.remoteAddress}`,
    );
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
  async setName(client: Socket, displayName: string): Promise<void> {
    // Check if the display name is empty
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
    // Check if the lobby code is empty
    if (lobbyCode.trim().length === 0) {
      client.emit('createLobbyResponse', {
        result: false,
        message: 'Lobby Code cannot be empty',
      });
      return;
    }

    // Check if the lobby code is in use
    if (await this.redis.gameExists(lobbyCode)) {
      client.emit('createLobbyResponse', {
        result: false,
        message: 'Lobby Code in use',
      });
      return;
    }

    try {
      await this.redis.createNewGame(lobbyCode, client.id);
      // Add player to a room identified by the lobby code
      // so that they recieve all events emitted to that room
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
  async joinLobby(client: Socket, lobbyCode: string): Promise<void> {
    // Check if the lobby code is empty
    if (lobbyCode.trim().length === 0) {
      client.emit('joinLobbyResponse', {
        result: false,
        message: 'Lobby Code cannot be empty',
      });
      return;
    }

    // Check if the lobby / game exists
    if (!(await this.redis.gameExists(lobbyCode))) {
      client.emit('joinLobbyResponse', {
        result: false,
        message: 'Lobby does not exist',
      });
      return;
    }

    try {
      await this.redis.joinGame(lobbyCode, client.id);
      // Add player to a room identified by the lobby code
      // so that they recieve all events emitted to that room
      client.join(`game-${lobbyCode}`);
      // Inform the players of the lobby that a new player has joined
      client.to(`game-${lobbyCode}`).emit('playerJoin', {
        displayName: await this.redis.getPlayerName(client.id),
        playerId: client.id,
      });
      client.emit('joinLobbyResponse', {
        result: true,
        message: lobbyCode,
      });
    } catch (error) {
      client.emit('joinLobbyResponse', {
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
  async getPlayers(client: Socket, lobbyCode: string): Promise<void> {
    const players = await this.redis.getGamePlayers(lobbyCode);
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
  ): Promise<void> {
    await this.redis.kickPlayer(lobbyCode, playerId);
    // Alert all players in the lobby that a player has been kicked
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
  async startGame(client: Socket, lobbyCode: string): Promise<void> {
    try {
      if ((await this.redis.getNumberOfPlayers(lobbyCode)) < 2) {
        client.emit('startGameResponse', {
          result: false,
          message: 'Cannot start game with only one player',
        });
      }
      await this.redis.startGame(lobbyCode);
      // Inform the players of the lobby that the game has started
      this.server.in(`game-${lobbyCode}`).emit('gameStartEvent');
    } catch (error) {
      this.logger.error(error);
      client.emit('startGameResponse', { result: false, message: error });
    }
  }

  @SubscribeMessage('getGameData')
  async getGameData(client: Socket, lobbyCode: string): Promise<void> {
    // Return  ahard-coded response for now
    const players = await this.redis.getGamePlayerData(lobbyCode);
    const hand = await this.redis.getPlayerHand(lobbyCode, client.id);
    const host = await this.redis.getHostOfGame(lobbyCode);
    client.emit('getGameDataResponse', {
      players,
      hand,
    });
    // Give the host the first turn
    this.server.to(host).emit('actionGiven');
  }

  @SubscribeMessage('playCard')
  async playCard(
    client: Socket,
    {
      lobbyCode,
      playerId,
      cardIndex,
    }: {
      lobbyCode: string;
      playerId: string;
      cardIndex: number;
    },
  ): Promise<void> {
    // Get list of players
    const players = await this.redis.getGamePlayers(lobbyCode);
    const emitQueue = await this.redis.playCard(lobbyCode, playerId, cardIndex);
    for (const event of emitQueue) {
      // Give the correct lobby the turn info
      this.server.in(`game-${lobbyCode}`).emit(event.event, event.data);
    }
    // Give turn to next player
    for (let i = 0; i < players.length; i++) {
      if (playerId == players[i]['playerId']) {
        //this.server.to(players[(i+1)%players.length]['playerId']).emit('cardDrawn','1');
        this.server
          .to(players[(i + 1) % players.length]['playerId'])
          .emit('actionGiven');
      }
    }
  }

  @SubscribeMessage('drawCards')
  async drawCards(
    client: Socket,
    {
      lobbyCode,
      cardsToDraw,
      playerId,
    }: {
      lobbyCode: string;
      cardsToDraw: number;
      playerId: string;
    },
  ): Promise<void> {
    // Get list of players
    const players = await this.redis.getGamePlayers(lobbyCode);
    const emitQueueDraw = await this.redis.drawCards(
      lobbyCode,
      cardsToDraw,
      playerId,
    );
    for (const event of emitQueueDraw) {
      // Give the correct lobby the turn info
      this.server.in(`game-${lobbyCode}`).emit(event.event, event.data);
    }
    // Give turn to next player
    for (let i = 0; i < players.length; i++) {
      if (playerId == players[i]['playerId']) {
        //this.server.to(players[(i+1)%players.length]['playerId']).emit('cardDrawn','1');
        this.server
          .to(players[(i + 1) % players.length]['playerId'])
          .emit('actionGiven');
      }
    }
  }
}
