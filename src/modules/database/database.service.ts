import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  @Cron('45 * * * * *')
  transactionDBCron() {
    this.logger.debug('Called when the current second is 45');
  }
}
