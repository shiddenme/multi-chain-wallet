import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  timestamps: false,
  freezeTableName: true,
})
export class btc_transaction extends Model<btc_transaction> {
  @Column({
    type: DataType.INTEGER,
  })
  public blockNumber: number;

  @Column({
    type: 'varbinary(128)',
    primaryKey: true,
  })
  public hash: BinaryType;

  @Column({ type: DataType.JSON })
  public inputs: string;

  @Column({ type: DataType.BIGINT })
  public size: number;

  @Column({ type: DataType.BIGINT })
  public weight: number;

  @Column({ type: DataType.JSON })
  public outputs: BinaryType;

  @Column({ type: DataType.BIGINT })
  public locktime: number;

  @Column({ type: DataType.BIGINT })
  public timestamp: number;
}
