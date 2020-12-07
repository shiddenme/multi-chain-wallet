import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  timestamps: false,
  freezeTableName: true,
})
export class Eth_Uncle extends Model<Eth_Uncle> {
  @Column({
    type: DataType.INTEGER,
  })
  public blockNumber: number;

  @Column({
    type: DataType.INTEGER,
  })
  public number: number;

  @Column({ type: 'varbinary(5000)' })
  public extraData: BinaryType;

  @Column({ type: DataType.BIGINT })
  public gasLimit: number;

  @Column({ type: DataType.BIGINT })
  public gasUsed: number;

  @Column({
    type: 'varbinary(128)',
    primaryKey: true,
  })
  public hash: BinaryType;

  @Column({ type: 'varbinary(1024)' })
  public logsBloom: BinaryType;

  @Column({ type: 'varbinary(64)' })
  public miner: BinaryType;

  @Column({ type: 'varbinary(128)' })
  public mixHash: BinaryType;

  @Column({ type: 'varbinary(32)' })
  public nonce: BinaryType;

  @Column({ type: 'varbinary(128)' })
  public parentHash: BinaryType;

  @Column({ type: 'varbinary(128)' })
  public receiptsRoot: BinaryType;

  @Column({ type: 'varbinary(128)' })
  public sha3Uncles: BinaryType;

  @Column({ type: DataType.MEDIUMINT })
  public size: number;

  @Column({ type: 'varbinary(128)' })
  public stateRoot: number;

  @Column({ type: DataType.INTEGER })
  public timestamp: number;

  @Column({ type: 'varbinary(128)' })
  public transactionsRoot: number;

  @Column({ type: DataType.SMALLINT })
  public uncleIndex: number;

  @Column({ type: DataType.DOUBLE })
  public reward: number;
}
