import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { DbClientService } from './db-client/db-client.service';
import { Response } from 'express';

/**
 * The default controller.
 */
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dbClientService: DbClientService,
  ) {}

  /**
   * Returns a welcome message
   *
   * @returns 'Welcome to Overflow: Online!'
   */
  @Get()
  async getHello(@Res() res: Response): Promise<any> {
    // Check database connection
    const manager = await this.dbClientService.manager();
    if (manager)
      return res.json({
        message: this.appService.getWelcomeMessage(),
      });
    return res.status(503).json({
      message: 'No database connection',
    });
  }
}
