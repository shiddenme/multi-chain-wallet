import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  timestamps: false,
  freezeTableName: true,
})
class eth_block extends Model<eth_block> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    unique: true,
    primaryKey: true,
  })
  public number: number;

  @Column({
    type: 'varbinary(16)',
    allowNull: false,
  })
  public difficulty: BinaryType;

  @Column({
    type: 'varbinary(5000)',
    allowNull: false,
  })
  public extraData: BinaryType;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  public gasLimit: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  public gasUsed: number;

  @Column({ type: 'varbinary(128)' })
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

  @Column({ type: DataType.SMALLINT })
  public unclesCount: number;

  @Column({ type: DataType.DOUBLE })
  public uncleInclusionRewards: number;

  @Column({ type: DataType.DOUBLE })
  public txnFees: number;

  @Column({ type: DataType.DOUBLE })
  public minerReward: number;

  @Column({ type: DataType.DOUBLE })
  public foundation: number;

  @Column({ type: DataType.MEDIUMINT })
  public size: number;

  @Column({ type: 'varbinary(128)' })
  public stateRoot: BinaryType;

  @Column({ type: DataType.INTEGER })
  public timestamp: number;

  @Column({ type: 'varbinary(32)' })
  public totalDifficulty: BinaryType;

  @Column({ type: 'varbinary(128)' })
  public transactionsRoot: number;
}

@Table({
  timestamps: false,
  freezeTableName: true,
})
export class eth_block_1 extends eth_block {}

@Table({
  timestamps: false,
  freezeTableName: true,
})
export class eth_block_2 extends eth_block {}

@Table({
  timestamps: false,
  freezeTableName: true,
})
export class eth_block_3 extends eth_block {}
