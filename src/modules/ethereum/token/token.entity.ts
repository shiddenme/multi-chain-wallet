import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  timestamps: false,
  freezeTableName: true,
})
export class eth_token extends Model<eth_token> {
  @Column({
    type: 'varchar(64)',
    primaryKey: true,
  })
  public contract: string;

  @Column({
    type: 'varchar(64)',
  })
  public symbol: string;

  @Column({
    type: 'varchar(512)',
  })
  public icon: string;

  @Column({
    type: 'varchar(64)',
  })
  public name: string;

  @Column({
    type: 'decimal(10,2)',
  })
  public price: number;

  @Column({
    type: DataType.INTEGER,
  })
  public sort: number;

  @Column({
    type: DataType.JSON,
  })
  public details: string;
}
