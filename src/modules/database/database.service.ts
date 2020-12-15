import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

declare const sql = `CREATE TABLE Eth_Transaction (
    blockHash varbinary(128) DEFAULT NULL,
    blockNumber int(11) DEFAULT NULL,
    hash varbinary(128) NOT NULL,
    from varchar(64) DEFAULT NULL,
    gas bigint(20) DEFAULT NULL,
    gasUsed bigint(20) DEFAULT NULL,
    gasPrice bigint(20) DEFAULT NULL,
    input varbinary(50000) DEFAULT NULL,
    nonce bigint(20) DEFAULT NULL,
    to varchar(64) DEFAULT NULL,
    transactionIndex smallint(6) DEFAULT NULL,
    value varbinary(32) DEFAULT NULL,
    type varchar(10) DEFAULT NULL,
    timestamp bigint(20) DEFAULT NULL,
    PRIMARY KEY (hash),
    KEY from_to_type_timestamp (from,to,type,timestamp),
    KEY from_type_timestamp (from,type,timestamp),
    KEY to_type_timestamp (to,type,timestamp)
  ) ENGINE=InnoDB DEFAULT CHARSET=latin1 `;

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  @Cron('45 * * * * *')
  transactionDBCron() {
    this.logger.debug('Called when the current second is 45');
  }
}
