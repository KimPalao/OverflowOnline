import { Injectable } from '@nestjs/common';

/**
 * The default app service
 */
@Injectable()
export class AppService {
  getWelcomeMessage(): string {
    return 'Welcome to Overflow: Online!';
  }
}
