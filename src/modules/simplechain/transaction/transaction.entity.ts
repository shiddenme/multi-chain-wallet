import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  timestamps: false,
  freezeTableName: true,
})
@Table({
  timestamps: false,
  freezeTableName: true,
})
export class SIPC_Transaction extends Model<SIPC_Transaction> {
  @Column({
    type: 'varbinary(128)',
  })
  public blockHash: BinaryType;

  @Column({
    type: DataType.INTEGER,
  })
  public blockNumber: number;

  @Column({
    type: 'varbinary(128)',
    primaryKey: true,
  })
  public hash: BinaryType;

  @Column({
    type: 'varbinary(64)',
  })
  public from: BinaryType;

  @Column({ type: DataType.MEDIUMINT })
  public gas: number;

  @Column({ type: DataType.MEDIUMINT })
  public gasUsed: number;

  @Column({ type: DataType.BIGINT })
  public gasPrice: number;

  @Column({ type: 'varbinary(50000)' })
  public input: BinaryType;

  @Column({ type: DataType.BIGINT })
  public nonce: number;

  @Column({ type: 'varbinary(64)' })
  public to: BinaryType;

  @Column({ type: DataType.SMALLINT })
  public transactionIndex: number;

  @Column({ type: 'varbinary(32)' })
  public value: BinaryType;

  @Column({ type: 'varchar(10)' })
  public status: string;
}
