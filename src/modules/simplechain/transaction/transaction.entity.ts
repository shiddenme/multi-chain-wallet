import { Table, Column, Model, DataType, Index } from 'sequelize-typescript';

@Table({
  timestamps: false,
  freezeTableName: true,
})
export class sipc_transaction extends Model<sipc_transaction> {
  @Column({
    type: 'varbinary(128)',
  })
  public blockHash: BinaryType;

  @Index('blockNumber')
  @Column({
    type: DataType.INTEGER,
  })
  public blockNumber: number;

  @Column({
    type: 'varbinary(128)',
    primaryKey: true,
  })
  public hash: BinaryType;

  @Index('from_to_contract')
  @Column({
    type: 'varchar(64)',
  })
  public from: string;

  @Column({ type: DataType.BIGINT })
  public gas: number;

  @Column({ type: DataType.BIGINT })
  public gasUsed: number;

  @Column({ type: DataType.BIGINT })
  public gasPrice: number;

  @Column({ type: 'varbinary(50000)' })
  public input: BinaryType;

  @Column({ type: DataType.BIGINT })
  public nonce: number;

  @Index('from_to_contract')
  @Column({ type: 'varchar(64)' })
  public to: string;

  @Column({ type: DataType.SMALLINT })
  public transactionIndex: number;

  @Column({ type: 'varbinary(32)' })
  public value: BinaryType;

  @Index('from_to_contract')
  @Column({ type: 'varchar(64)' })
  public contract: string;

  @Column({ type: DataType.BIGINT })
  public timestamp: number;

  @Column({ type: DataType.BOOLEAN })
  public status: boolean;
}
