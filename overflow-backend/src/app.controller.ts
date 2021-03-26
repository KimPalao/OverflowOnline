import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DbClientService } from './db-client/db-client.service';

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
  async getHello(): Promise<string> {
    // Check database connection
    const manager = await this.dbClientService.manager();
    if (manager) {
      console.log('Connected to database');
    } else {
      console.log('No database connection');
    }
    return this.appService.getWelcomeMessage();
  }
}
