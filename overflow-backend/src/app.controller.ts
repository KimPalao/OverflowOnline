import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * The default controller.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Returns a welcome message
   *
   * @returns 'Welcome to Overflow: Online!'
   */
  @Get()
  getHello(): string {
    return this.appService.getWelcomeMessage();
  }
}
