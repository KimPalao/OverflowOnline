import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { DbClientService } from './db-client/db-client.service';
import { Response } from 'express';
import { Card } from './entity/card.entity';

/**
 * The default controller.
 */
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dbClientService: DbClientService,
  ) {}

  async unavailable_db_response(@Res() res: Response) {
    return res.status(503).json({
      message: 'No database connection',
    });
  }

  /**
   * Returns a welcome message
   *
   * @returns 'Welcome to Overflow: Online!'
   */
  @Get()
  async getHello(@Res() res: Response): Promise<any> {
    // Check database connection
    const manager = await this.dbClientService.manager();
    if (!manager) return this.unavailable_db_response(res);
    return res.json({
      message: this.appService.getWelcomeMessage(),
    });
  }

  @Get('cards')
  async getCards(@Res() res: Response): Promise<any> {
    const manager = await this.dbClientService.manager();
    if (!manager) return this.unavailable_db_response(res);
    const cards = await manager.find(Card);
    return res.json({
      data: cards,
    });
  }
}
